'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useWorkspace } from '@/contexts/WorkspaceContext';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { 
  Send, Smile, MessageSquare, Sparkles, Languages, Check, ArrowRight, 
  Info, AlertCircle, Copy, Trash2, Edit3, CornerUpLeft, Paperclip, 
  Mic, Search, Pin, Star, Archive, ShieldAlert, FileText, Image as ImageIcon, 
  Video as VideoIcon, CheckCheck, MoreVertical, X, Calendar, UserCheck
} from 'lucide-react';
import { generateAvatar } from '@/utils/avatar';
import { toast } from "toastflux";

const toUUID = (str) => {
  if (!str) return '00000000-0000-0000-0000-000000000000';
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (uuidRegex.test(str)) return str;
  const clean = str.toString().replace(/[^0-9a-f]/gi, '').toLowerCase();
  const padded = clean.padEnd(32, '0').slice(0, 32);
  return `${padded.slice(0, 8)}-${padded.slice(8, 12)}-${padded.slice(12, 16)}-${padded.slice(16, 20)}-${padded.slice(20, 32)}`;
};

export default function ChatWindow() {
  const { activeChannel, messages, setMessages, members } = useWorkspace();
  const { profile } = useAuth();
  
  // State
  const [inputText, setInputText] = useState('');
  const [activeThread, setActiveThread] = useState(null);
  const [threadInput, setThreadInput] = useState('');
  const [editingMessage, setEditingMessage] = useState(null);
  const [replyTarget, setReplyTarget] = useState(null);
  
  // Custom panels
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showMediaTab, setShowMediaTab] = useState(false);
  const [pinnedMessage, setPinnedMessage] = useState(null);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [scheduleTime, setScheduleTime] = useState('');

  // Audio Recording Mock
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const recordingTimer = useRef(null);

  // Wallpaper and Theme
  const [wallpaper, setWallpaper] = useState('bg-[#efeae2]'); // Classic WhatsApp Cream/Beige
  const [isDarkMode, setIsDarkMode] = useState(false);

  const chatEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const messagesContainerRef = useRef(null);

  // Auto-scroll only when a new message sent by the current user appears
  const prevMessagesRef = useRef(messages);
  useEffect(() => {
    const prev = prevMessagesRef.current;
    if (messages.length > prev.length) {
      const newMsg = messages[messages.length - 1];
      const isSelfMsg =
        newMsg.sender_id?.toLowerCase() === profile?.id?.toLowerCase() ||
        newMsg.user_id?.toLowerCase() === profile?.id?.toLowerCase();
      if (isSelfMsg) {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }
    }
    prevMessagesRef.current = messages;
  }, [messages, profile]);

  // Load Pinned Message
  useEffect(() => {
    loadPinnedMessage();
  }, [activeChannel]);

  const loadPinnedMessage = async () => {
    if (!activeChannel) {
      setPinnedMessage(null);
      return;
    }
    try {
      const { data, error } = await supabase
        .from('pinned_messages')
        .select('*, messages(*)')
        .eq('conversation_id', toUUID(activeChannel.id))
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();
      if (data && data.messages) {
        setPinnedMessage(data.messages);
      } else {
        setPinnedMessage(null);
      }
    } catch (e) {
      console.warn("Pinned message load error:", e);
    }
  };

  // Recording Timer
  const startRecording = () => {
    setIsRecording(true);
    setRecordingTime(0);
    recordingTimer.current = setInterval(() => {
      setRecordingTime(prev => prev + 1);
    }, 1000);
  };

  const stopRecording = async () => {
    clearInterval(recordingTimer.current);
    setIsRecording(false);
    
    // Simulate sending a voice note
    const tempId = `temp-voice-${Date.now()}`;
    const optimisticMessage = {
      id: tempId,
      channel_id: toUUID(activeChannel?.id),
      user_id: toUUID(profile?.id),
      content: `Voice Note (${recordingTime}s)`,
      message_type: 'voice',
      created_at: new Date().toISOString(),
      profiles: profile,
    };
    setMessages(prev => [...prev, optimisticMessage]);
  };

  // Message Send Handler
  const handleSendMessage = async (e) => {
    if (e) e.preventDefault();
    if (!inputText.trim()) return;

    const messageContent = inputText;
    setInputText('');
    setReplyTarget(null);

    const tempId = `temp-${Date.now()}`;
    const optimisticMessage = {
      id: tempId,
      conversation_id: toUUID(activeChannel?.id),
      sender_id: toUUID(profile?.id),
      user_id: toUUID(profile?.id),
      content: messageContent,
      message_type: 'text',
      created_at: new Date().toISOString(),
      profiles: profile,
      reply_to_message_id: replyTarget ? replyTarget.id : null,
    };

    setMessages(prev => [...prev, optimisticMessage]);

    try {
      const { data, error } = await supabase
        .from('messages')
        .insert({
          conversation_id: toUUID(activeChannel?.id),
          sender_id: toUUID(profile?.id),
          content: messageContent,
          message_type: 'text',
          reply_to_message_id: replyTarget ? toUUID(replyTarget.id) : null,
        })
        .select()
        .single();
      if (error) throw error;

      setMessages(prev =>
        prev.map(msg => (msg.id === tempId ? { ...msg, ...data, user_id: data.sender_id } : msg))
      );
    } catch (err) {
      console.error("Message sync error:", err.message || err.details || err);
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
    const filePath = `${fileName}`;

    let msgType = 'document';
    if (file.type.startsWith('image/')) msgType = 'image';
    else if (file.type.startsWith('video/')) msgType = 'video';
    else if (file.type.startsWith('audio/')) msgType = 'voice';

    // 1. Add an optimistic uploading message
    const tempId = `uploading-${Date.now()}`;
    const uploadingMsg = {
      id: tempId,
      conversation_id: toUUID(activeChannel?.id),
      sender_id: toUUID(profile?.id),
      user_id: toUUID(profile?.id),
      content: `Uploading ${file.name}...`,
      message_type: msgType,
      isUploading: true,
      created_at: new Date().toISOString(),
      profiles: profile,
    };

    setMessages(prev => [...prev, uploadingMsg]);

    try {
      // 2. Upload to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('chat-attachments')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // 3. Get Public URL
      const { data: { publicUrl } } = supabase.storage
        .from('chat-attachments')
        .getPublicUrl(filePath);

      // 4. Send message with media URL
      const { data, error } = await supabase
        .from('messages')
        .insert({
          conversation_id: toUUID(activeChannel?.id),
          sender_id: toUUID(profile?.id),
          content: `Sent a ${msgType}: ${file.name}`,
          message_type: msgType,
          media_url: publicUrl,
        })
        .select()
        .single();

      if (error) throw error;

      // Replace the uploading message with the final message
      setMessages(prev =>
        prev.map(msg => (msg.id === tempId ? { ...msg, ...data, user_id: data.sender_id, isUploading: false } : msg))
      );
      toast.success("File uploaded successfully! 🚀");
    } catch (err) {
      console.error("File upload/send error:", err.message || err);
      // Remove the uploading message
      setMessages(prev => prev.filter(msg => msg.id !== tempId));
      toast.error("Failed to upload/send file: " + (err.message || err));
    }
  };

  // Schedule Message
  const handleScheduleMessage = async () => {
    if (!inputText.trim() || !scheduleTime) return;
    try {
      await supabase.from('scheduled_messages').insert({
        conversation_id: toUUID(activeChannel?.id),
        sender_id: toUUID(profile?.id),
        content: inputText,
        message_type: 'text',
        send_at: new Date(scheduleTime).toISOString()
      });
      setInputText('');
      setShowScheduleModal(false);
      toast.success("Message scheduled successfully! 📅");
    } catch (e) {
      console.error("Schedule error:", e);
      toast.error("Could not schedule message.");
    }
  };

  // Edit Message
  const handleEditMessage = async (msgId, newText) => {
    try {
      await supabase
        .from('messages')
        .update({ content: newText, edited: true })
        .eq('id', toUUID(msgId));
      
      setMessages(prev =>
        prev.map(msg => (msg.id === msgId ? { ...msg, content: newText, edited: true } : msg))
      );
      setEditingMessage(null);
      toast.success("Message updated!");
    } catch (err) {
      console.error(err);
      toast.error("Could not edit message.");
    }
  };

  // Delete for Everyone
  const handleDeleteForEveryone = async (msgId) => {
    try {
      await supabase
        .from('messages')
        .update({ deleted_for_everyone: true, content: '🚫 This message was deleted' })
        .eq('id', toUUID(msgId));

      setMessages(prev =>
        prev.map(msg => (msg.id === msgId ? { ...msg, deleted_for_everyone: true, content: '🚫 This message was deleted' } : msg))
      );
      toast.success("Message deleted!");
    } catch (err) {
      console.error(err);
      toast.error("Could not delete message.");
    }
  };

  // Pin Message
  const handlePinMessage = async (msgId) => {
    try {
      await supabase.from('pinned_messages').insert({
        conversation_id: toUUID(activeChannel?.id),
        message_id: toUUID(msgId),
        pinned_by: toUUID(profile?.id)
      });
      toast.success("Message pinned successfully! 📌");
      loadPinnedMessage();
    } catch (e) {
      console.error(e);
      toast.error("Could not pin message.");
    }
  };

  // Unpin Message
  const handleUnpinMessage = async () => {
    if (!activeChannel) return;
    try {
      await supabase
        .from('pinned_messages')
        .delete()
        .eq('conversation_id', toUUID(activeChannel.id));
      setPinnedMessage(null);
      toast.success("Message unpinned successfully! 📌");
    } catch (e) {
      console.error(e);
      toast.error("Could not unpin message.");
    }
  };

  // Add Reaction
  const handleAddReaction = async (msgId, emoji) => {
    try {
      await supabase.from('message_reactions').insert({
        message_id: toUUID(msgId),
        user_id: toUUID(profile?.id),
        emoji
      });
    } catch (e) {
      console.warn("Reaction already present or failed:", e);
    }
  };

  // Filter messages based on search
  const filteredMessages = searchQuery
    ? messages.filter(m => m.content?.toLowerCase().includes(searchQuery.toLowerCase()))
    : messages;

  // Header Details
  const getDMPartner = () => {
    if (!activeChannel || !activeChannel.name) return null;
    const name = activeChannel.name;
    if (!name.startsWith('dm_') && !name.startsWith('dm-')) return null;
    
    // Extract UUIDs from dm_UUID1_UUID2
    const parts = name.split('_');
    if (parts.length < 3) return null;
    
    const userUuid = toUUID(profile?.id);
    const partnerUuid = toUUID(parts[1]) === userUuid ? toUUID(parts[2]) : toUUID(parts[1]);
    
    // Find partner in members list
    const partner = members.find(m => toUUID(m.id) === partnerUuid);
    return partner;
  };

  const getHeaderName = () => {
    if (!activeChannel) return 'WhatsApp Chat';
    if (activeChannel.name?.startsWith('dm-') || activeChannel.name?.startsWith('dm_')) {
      const partner = getDMPartner();
      return partner ? partner.name : 'Direct Message';
    }
    return `# ${activeChannel.name}`;
  };

  const getHeaderAvatar = () => {
    if (activeChannel && (activeChannel.name?.startsWith('dm-') || activeChannel.name?.startsWith('dm_'))) {
      const partner = getDMPartner();
      if (partner) {
        return partner.avatar_url || generateAvatar(partner.name || 'User');
      }
    }
    return generateAvatar(getHeaderName());
  };

  const partner = getDMPartner();
  const isPartnerOnline = partner ? (partner.id.toString().charCodeAt(0) % 2 === 0 || partner.name.includes("Rahul") || partner.name.includes("Gaurav")) : false;

  return (
    <div className={`flex-1 flex h-full overflow-hidden ${isDarkMode ? 'dark bg-slate-900' : 'bg-slate-100'}`}>
      
      {/* Main Chat Feed */}
      <div className="flex-1 flex flex-col h-full overflow-hidden relative">
        
        {/* WhatsApp Topbar */}
        <div className="h-16 bg-[#f0f2f5] dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 px-6 flex items-center justify-between shrink-0 select-none z-10 shadow-sm">
          <div className="flex items-center gap-3">
            <img
              src={getHeaderAvatar()}
              alt="Avatar"
              className="w-10 h-10 rounded-full object-cover"
            />
            <div>
              <h2 className="text-sm font-bold text-slate-800 dark:text-white">{getHeaderName()}</h2>
              {isPartnerOnline ? (
                <span className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  Online
                </span>
              ) : (
                <span className="text-xs text-slate-400 font-semibold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-300"></span>
                  Offline
                </span>
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-4 text-slate-600 dark:text-slate-300">
            <button onClick={() => setShowSearch(!showSearch)} title="Search Messages">
              <Search size={20} className="hover:text-emerald-600 transition-colors" />
            </button>
            <button onClick={() => setShowMediaTab(!showMediaTab)} title="Shared Media">
              <Paperclip size={20} className="hover:text-emerald-600 transition-colors" />
            </button>
            <button onClick={() => setShowScheduleModal(true)} title="Schedule Message">
              <Calendar size={20} className="hover:text-emerald-600 transition-colors" />
            </button>
            <MoreVertical size={20} className="cursor-pointer hover:text-emerald-600" />
          </div>
        </div>

        {/* Pinned Message Banner */}
        {pinnedMessage && (
          <div className="bg-emerald-50 border-b border-emerald-100 px-6 py-2 flex items-center justify-between text-xs text-emerald-800 font-medium z-10 shadow-sm">
            <div className="flex items-center gap-2">
              <Pin size={14} className="text-emerald-600 shrink-0" />
              <span>Pinned Message: "{pinnedMessage.content}"</span>
            </div>
            <div className="flex items-center gap-3">
              <button 
                onClick={() => {
                  const element = document.getElementById(`msg-${pinnedMessage.id}`);
                  if (element) {
                    element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    element.classList.add('bg-yellow-100', 'dark:bg-yellow-900/30');
                    setTimeout(() => {
                      element.classList.remove('bg-yellow-100', 'dark:bg-yellow-900/30');
                    }, 2000);
                  }
                }}
                className="text-emerald-600 font-bold hover:underline"
              >
                Jump to Message
              </button>
              <span className="text-emerald-300">|</span>
              <button 
                onClick={handleUnpinMessage}
                className="text-rose-600 font-bold hover:underline"
              >
                Unpin
              </button>
            </div>
          </div>
        )}

        {/* Messages Body */}
        <div 
          ref={messagesContainerRef}
          className={`flex-grow overflow-y-auto p-6 space-y-4 ${wallpaper}`}
          style={{ backgroundImage: `url('/chat-bg-pattern.png')`, backgroundBlendMode: 'overlay' }}
        >
          {filteredMessages.map((msg) => {
            const isSelf = msg.sender_id?.toLowerCase() === profile?.id?.toLowerCase() || msg.user_id?.toLowerCase() === profile?.id?.toLowerCase();
            
            return (
              <div 
                key={msg.id} 
                id={`msg-${msg.id}`}
                className={`flex w-full ${isSelf ? 'justify-end' : 'justify-start'} group mb-1 transition-colors duration-500`}
              >
                {/* Message Bubble Container */}
                <div className="relative max-w-[70%]">
                  
                  {/* Reaction Hover Palette */}
                  <div className="absolute -top-6 right-2 hidden group-hover:flex items-center gap-1 bg-white dark:bg-slate-800 shadow-md border border-slate-150 rounded-full px-2 py-1 z-20 pb-2 -mb-2">
                    {['👍', '❤️', '😂', '😮', '😢', '🔥'].map(emoji => (
                      <button 
                        key={emoji} 
                        onClick={() => handleAddReaction(msg.id, emoji)}
                        className="hover:scale-125 transition-transform text-xs"
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>

                  {/* Message Bubble */}
                  <div className={`p-3 rounded-lg shadow-sm text-sm relative ${
                    isSelf 
                      ? 'bg-[#d9fdd3] dark:bg-emerald-800 text-slate-800 dark:text-white rounded-tr-none' 
                      : 'bg-white dark:bg-slate-700 text-slate-800 dark:text-white rounded-tl-none'
                  }`}>
                    
                    {/* Sender Profile Name for Groups */}
                    {!isSelf && !(activeChannel?.name?.startsWith('dm_') || activeChannel?.name?.startsWith('dm-') || activeChannel?.is_private) && (
                      <span className="block text-xs font-bold text-emerald-700 dark:text-emerald-300 mb-0.5">
                        {msg.profiles?.name || 'User'}
                      </span>
                    )}

                    {/* Reply Context Render */}
                    {msg.reply_to_message_id && (
                      <div className="bg-slate-50/70 dark:bg-slate-800/50 border-l-4 border-emerald-500 p-2 rounded text-xs text-slate-600 dark:text-slate-300 mb-2 font-medium select-none">
                        Replied to another message
                      </div>
                    )}

                    {/* Content */}
                    {editingMessage === msg.id ? (
                      <input 
                        type="text" 
                        defaultValue={msg.content}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleEditMessage(msg.id, e.target.value);
                        }}
                        className="bg-white border border-slate-300 p-1 rounded w-full text-slate-800"
                        autoFocus
                      />
                    ) : (
                      <div>
                        {msg.isUploading ? (
                          <div className="flex flex-col items-center justify-center p-6 space-y-2 bg-slate-50 dark:bg-slate-800 rounded-lg min-w-[200px]">
                            <div className="w-6 h-6 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
                            <span className="text-xs text-slate-500 font-semibold">Uploading file...</span>
                          </div>
                        ) : msg.media_url && (
                          <div className="mt-1 mb-2 max-w-full overflow-hidden rounded-lg border border-slate-100 dark:border-slate-650 bg-slate-50 dark:bg-slate-800">
                            {msg.message_type === 'image' && (
                              <img src={msg.media_url} alt="Attachment" className="max-h-60 w-auto object-contain rounded" />
                            )}
                            {msg.message_type === 'video' && (
                              <video src={msg.media_url} controls className="max-h-60 w-full rounded" />
                            )}
                            {msg.message_type === 'voice' && (
                              <audio src={msg.media_url} controls className="w-full max-w-xs" />
                            )}
                            {msg.message_type === 'document' && (
                              <a href={msg.media_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 p-2.5 text-emerald-700 dark:text-emerald-400 font-semibold text-xs hover:bg-slate-100 dark:hover:bg-slate-700">
                                <FileText size={16} />
                                <span>Download Document</span>
                              </a>
                            )}
                          </div>
                        )}
                        {!msg.isUploading && !['image', 'video'].includes(msg.message_type) && (
                          <p className="whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                        )}
                      </div>
                    )}

                    {/* Time & Read Receipts */}
                    <div className="flex items-center justify-end gap-1.5 mt-1 text-[10px] text-slate-400 dark:text-slate-300 select-none">
                      <span>{new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      {msg.edited && <span className="italic">(edited)</span>}
                      {isSelf && (
                        <span>
                          {msg.metadata?.is_read ? (
                            <span className="text-sky-500" title="Seen">
                              <CheckCheck size={14} />
                            </span>
                          ) : isPartnerOnline ? (
                            <span className="text-slate-400" title="Delivered">
                              <CheckCheck size={14} />
                            </span>
                          ) : (
                            <span className="text-slate-400" title="Sent (Offline)">
                              <Check size={14} />
                            </span>
                          )}
                        </span>
                      )}
                    </div>

                    {/* Dropdown Menu Trigger */}
                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <select 
                        onChange={(e) => {
                          const val = e.target.value;
                          if (val === 'reply') setReplyTarget(msg);
                          if (val === 'edit') setEditingMessage(msg.id);
                          if (val === 'pin') handlePinMessage(msg.id);
                          if (val === 'delete') handleDeleteForEveryone(msg.id);
                          e.target.value = '';
                        }}
                        className="bg-transparent border-none text-slate-400 cursor-pointer outline-none w-5"
                        defaultValue=""
                      >
                        <option value="" disabled></option>
                        <option value="reply">Reply</option>
                        {isSelf && <option value="edit">Edit</option>}
                        <option value="pin">Pin</option>
                        <option value="delete">Delete</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
          <div ref={chatEndRef} />
        </div>

        {/* Reply Preview Bar */}
        {replyTarget && (
          <div className="bg-slate-50 dark:bg-slate-800 px-6 py-2 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between text-xs text-slate-600 dark:text-slate-300 animate-slide-up">
            <div className="border-l-4 border-emerald-500 pl-3">
              <span className="font-bold text-emerald-600">Replying to {replyTarget.profiles?.name || 'User'}</span>
              <p className="truncate text-slate-500 max-w-md">{replyTarget.content}</p>
            </div>
            <button onClick={() => setReplyTarget(null)}>
              <X size={16} />
            </button>
          </div>
        )}

        {/* Input Controls Panel */}
        <div className="p-3 bg-[#f0f2f5] dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 flex items-center gap-3 shrink-0">
          <button title="Smile Emojis">
            <Smile className="text-slate-600 dark:text-slate-300 hover:text-emerald-600 transition-colors" size={22} />
          </button>
          
          <button onClick={() => fileInputRef.current?.click()} title="Attach File">
            <Paperclip className="text-slate-600 dark:text-slate-300 hover:text-emerald-600 transition-colors" size={22} />
          </button>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            className="hidden"
          />

          <form onSubmit={handleSendMessage} className="flex-grow flex items-center gap-2">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Type a message..."
              className="w-full bg-white dark:bg-slate-700 text-slate-800 dark:text-white rounded-lg px-4 py-2 text-sm focus:outline-none border-none shadow-sm"
            />
            {inputText.trim() ? (
              <button 
                type="submit" 
                className="p-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full transition-all"
              >
                <Send size={18} />
              </button>
            ) : (
              <button 
                type="button"
                onClick={isRecording ? stopRecording : startRecording}
                className={`p-2 rounded-full transition-all ${isRecording ? 'bg-red-500 text-white animate-pulse' : 'bg-emerald-600 text-white'}`}
              >
                <Mic size={18} />
              </button>
            )}
          </form>
        </div>
      </div>

      {/* Shared Media Tab Sidepanel */}
      {showMediaTab && (
        <div className="w-80 border-l border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 flex flex-col h-full animate-slide-left z-20">
          <div className="h-16 border-b border-slate-200 dark:border-slate-700 px-4 flex items-center justify-between shrink-0">
            <span className="font-bold text-slate-800 dark:text-white">Shared Media</span>
            <button onClick={() => setShowMediaTab(false)}>
              <X size={20} className="text-slate-500 hover:text-slate-800" />
            </button>
          </div>
          <div className="p-4 overflow-y-auto flex-1 grid grid-cols-3 gap-2">
            <div className="bg-slate-100 p-4 rounded flex flex-col items-center justify-center text-xs text-slate-500">
              <ImageIcon size={24} />
              <span>Image1.png</span>
            </div>
            <div className="bg-slate-100 p-4 rounded flex flex-col items-center justify-center text-xs text-slate-500">
              <VideoIcon size={24} />
              <span>Video.mp4</span>
            </div>
            <div className="bg-slate-100 p-4 rounded flex flex-col items-center justify-center text-xs text-slate-500">
              <FileText size={24} />
              <span>Doc.pdf</span>
            </div>
          </div>
        </div>
      )}



      {/* Schedule Message Modal */}
      {showScheduleModal && (
        <div className="fixed inset-0 bg-black/55 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-sm w-full space-y-4">
            <h3 className="font-bold text-slate-800 text-sm">Schedule Message Delivery</h3>
            <input 
              type="datetime-local" 
              value={scheduleTime}
              onChange={(e) => setScheduleTime(e.target.value)}
              className="w-full border p-2 rounded text-xs focus:outline-emerald-500"
            />
            <div className="flex justify-end gap-2 text-xs">
              <button onClick={() => setShowScheduleModal(false)} className="px-3 py-1.5 border rounded">Cancel</button>
              <button onClick={handleScheduleMessage} className="px-3 py-1.5 bg-emerald-600 text-white rounded">Schedule</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
