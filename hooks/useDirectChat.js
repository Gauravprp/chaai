import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/lib/supabase';

export function useDirectChat(currentUserId) {
  const [messages, setMessages] = useState([]);
  const [conversations, setConversations] = useState({});
  const [activeRecipientId, setActiveRecipientId] = useState(null);
  const [loadingHistory, setLoadingHistory] = useState(false);

  const activeRecipientIdRef = useRef(activeRecipientId);
  useEffect(() => {
    activeRecipientIdRef.current = activeRecipientId;
  }, [activeRecipientId]);

  // Fetch all conversations summary (last message + unread count)
  const refreshConversations = useCallback(async () => {
    if (!currentUserId) return;
    try {
      const { data, error } = await supabase
        .from('direct_messages')
        .select('*')
        .or(`sender_id.eq.${currentUserId},receiver_id.eq.${currentUserId}`)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const summary = {};
      data.forEach((msg) => {
        const otherId = msg.sender_id === currentUserId ? msg.receiver_id : msg.sender_id;
        if (!summary[otherId]) {
          summary[otherId] = {
            lastMessage: msg,
            unreadCount: 0,
          };
        }
        if (msg.receiver_id === currentUserId && !msg.is_read) {
          summary[otherId].unreadCount += 1;
        }
      });
      setConversations(summary);
    } catch (err) {
      console.error('Failed to load conversations list:', err);
    }
  }, [currentUserId]);

  // Load chat history between currentUser and activeRecipientId
  const loadChatHistory = useCallback(async (recipientId) => {
    if (!currentUserId || !recipientId) return;
    setLoadingHistory(true);
    try {
      const { data, error } = await supabase
        .from('direct_messages')
        .select('*')
        .in('sender_id', [currentUserId, recipientId])
        .in('receiver_id', [currentUserId, recipientId])
        .order('created_at', { ascending: true });

      if (error) throw error;
      setMessages(data || []);

      // Mark these messages as read in the DB
      await supabase
        .from('direct_messages')
        .update({ is_read: true })
        .eq('sender_id', recipientId)
        .eq('receiver_id', currentUserId)
        .eq('is_read', false);

      // Refresh conversations to clear unread counts locally
      refreshConversations();
    } catch (err) {
      console.error('Failed to load chat history:', err);
    } finally {
      setLoadingHistory(false);
    }
  }, [currentUserId, refreshConversations]);

  // Change selected conversation
  const selectConversation = useCallback((recipientId) => {
    setActiveRecipientId(recipientId);
    if (recipientId) {
      loadChatHistory(recipientId);
    } else {
      setMessages([]);
    }
  }, [loadChatHistory]);

  // Send message
  const sendMessage = useCallback(async (content) => {
    const recipientId = activeRecipientIdRef.current;
    if (!currentUserId || !recipientId || !content.trim()) return null;

    const newMsg = {
      sender_id: currentUserId,
      receiver_id: recipientId,
      content: content.trim(),
      is_read: false,
    };

    try {
      const { data, error } = await supabase
        .from('direct_messages')
        .insert(newMsg)
        .select()
        .single();

      if (error) throw error;
      
      // Update local message list
      setMessages((prev) => [...prev, data]);
      refreshConversations();
      return data;
    } catch (err) {
      console.error('Failed to send message:', err);
      return null;
    }
  }, [currentUserId, refreshConversations]);

  // Real-time subscription
  useEffect(() => {
    if (!currentUserId) return;

    // Load initial list
    refreshConversations();

    const channel = supabase
      .channel('direct_messages_changes')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'direct_messages' },
        async (payload) => {
          const newMsg = payload.new;
          
          // Relevant to this user?
          if (newMsg.sender_id === currentUserId || newMsg.receiver_id === currentUserId) {
            const activeRecipient = activeRecipientIdRef.current;
            
            // If message is from/to the active conversation participant
            const isCurrentConversation = 
              (newMsg.sender_id === currentUserId && newMsg.receiver_id === activeRecipient) ||
              (newMsg.sender_id === activeRecipient && newMsg.receiver_id === currentUserId);

            if (isCurrentConversation) {
              setMessages((prev) => {
                if (prev.some((m) => m.id === newMsg.id)) return prev;
                return [...prev, newMsg];
              });

              // Mark incoming message as read if it is currently open
              if (newMsg.receiver_id === currentUserId && !newMsg.is_read) {
                await supabase
                  .from('direct_messages')
                  .update({ is_read: true })
                  .eq('id', newMsg.id);
              }
            }
            
            refreshConversations();
          }
        }
      )
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'direct_messages' },
        (payload) => {
          const updatedMsg = payload.new;
          if (updatedMsg.sender_id === currentUserId || updatedMsg.receiver_id === currentUserId) {
            setMessages((prev) =>
              prev.map((msg) => (msg.id === updatedMsg.id ? { ...msg, ...updatedMsg } : msg))
            );
            refreshConversations();
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [currentUserId, refreshConversations]);

  return {
    messages,
    conversations,
    activeRecipientId,
    loadingHistory,
    selectConversation,
    sendMessage,
    refreshConversations,
  };
}
