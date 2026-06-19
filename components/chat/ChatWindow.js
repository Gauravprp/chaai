'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useWorkspace } from '@/contexts/WorkspaceContext';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { 
  Send, Smile, MessageSquare, Sparkles, Languages, Check, ArrowRight, 
  Info, AlertCircle, Copy, Trash2, Edit3, CornerUpLeft, Paperclip, 
  Mic, Search, Pin, Star, Archive, ShieldAlert, FileText, Image as ImageIcon, 
  Video as VideoIcon, CheckCheck, MoreVertical, X, Calendar, UserCheck,
  Square, Loader2
} from 'lucide-react';
import { generateAvatar } from '@/utils/avatar';
import { toast } from "toastflux";
import { parseTaskCommand } from '@/utils/taskParser';
import VoicePlayer from './VoicePlayer';

const toUUID = (str) => {
  if (!str) return '00000000-0000-0000-0000-000000000000';
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (uuidRegex.test(str)) return str;
  const clean = str.toString().replace(/[^0-9a-f]/gi, '').toLowerCase();
  const padded = clean.padEnd(32, '0').slice(0, 32);
  return `${padded.slice(0, 8)}-${padded.slice(8, 12)}-${padded.slice(12, 16)}-${padded.slice(16, 20)}-${padded.slice(20, 32)}`;
};

export default function ChatWindow() {
  const { activeChannel, messages, setMessages, members, createTask } = useWorkspace();
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
  const [mediaTabType, setMediaTabType] = useState('media'); // 'media' | 'docs'
  const [pinnedMessage, setPinnedMessage] = useState(null);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [scheduleTime, setScheduleTime] = useState('');
  const [showScrollBottom, setShowScrollBottom] = useState(false);
  const [openMenuId, setOpenMenuId] = useState(null);
  
  // Autocomplete State
  const [showAutocomplete, setShowAutocomplete] = useState(false);
  const [autocompleteSuggestions, setAutocompleteSuggestions] = useState([]);
  const [autocompleteType, setAutocompleteType] = useState('command'); // 'command' | 'user'
  const [autocompleteIndex, setAutocompleteIndex] = useState(0);

  // AI Tools State
  const [activeAIPill, setActiveAIPill] = useState(null);
  const [aiTargetLang, setAiTargetLang] = useState('Hindi');
  const [isInputFocused, setIsInputFocused] = useState(false);
  const [translatedMessages, setTranslatedMessages] = useState({});
  const [translatingMsgId, setTranslatingMsgId] = useState(null);

  // Audio Recording State
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [isUploadingVoice, setIsUploadingVoice] = useState(false);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const recordingTimer = useRef(null);
  const textInputRef = useRef(null);

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
        scrollToBottom();
      }
    }
    prevMessagesRef.current = messages;
  }, [messages, profile]);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleScroll = (e) => {
    const { scrollTop, scrollHeight, clientHeight } = e.target;
    // Show scroll bottom button if user scrolls up more than 100px from bottom
    const isAtBottom = scrollHeight - scrollTop - clientHeight < 100;
    setShowScrollBottom(!isAtBottom);
  };

  const handleAIRewrite = async (mode) => {
    if (!inputText.trim()) return;
    
    let wordLimit = null;
    if (mode === 'expand' || mode === 'shorten') {
      const input = window.prompt(`Enter word limit for ${mode} (optional, e.g. 50):`);
      if (input && !isNaN(parseInt(input))) {
        wordLimit = parseInt(input);
      }
    }

    setActiveAIPill(mode);
    try {
      const res = await fetch('/api/ai/rewrite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: inputText, mode, wordLimit })
      });
      const data = await res.json();
      if (data.result) setInputText(data.result);
      else if (data.error) toast.error(data.error);
    } catch (err) {
      toast.error('AI Rewrite failed: ' + err.message);
    } finally {
      setActiveAIPill(null);
    }
  };

  const handleAITranslate = async (lang) => {
    if (!inputText.trim()) return;
    setActiveAIPill('translation');
    try {
      const res = await fetch('/api/ai/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: inputText, language: lang })
      });
      const data = await res.json();
      if (data.result) setInputText(data.result);
      else if (data.error) toast.error(data.details || data.error);
    } catch (err) {
      toast.error('AI Translation failed: ' + err.message);
    } finally {
      setActiveAIPill(null);
    }
  };

  const handleInlineTranslate = async (msg, lang) => {
    setTranslatingMsgId(msg.id);
    setOpenMenuId(null);
    try {
      const res = await fetch('/api/ai/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: msg.content, language: lang })
      });
      const data = await res.json();
      if (data.result) {
        setTranslatedMessages(prev => ({ ...prev, [msg.id]: { lang, text: data.result } }));
      } else if (data.error) {
        toast.error(data.error);
      }
    } catch (err) {
      toast.error('Inline Translation failed');
    } finally {
      setTranslatingMsgId(null);
    }
  };

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

  // Real Audio Recording Implementation
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        // Stream tracks must be stopped to release mic
        stream.getTracks().forEach(track => track.stop());
        
        if (audioChunksRef.current.length === 0) return;
        
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        audioChunksRef.current = [];
        
        await uploadVoiceNote(audioBlob);
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);
      recordingTimer.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    } catch (err) {
      console.error("Microphone access error:", err);
      if (!navigator.mediaDevices) {
        toast.error("Microphone API not supported in this browser/context.");
      } else {
        toast.error(`Mic Error: ${err.message || err.name}`);
      }
    }
  };

  const cancelRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      // Clear chunks so onstop doesn't upload
      audioChunksRef.current = [];
      mediaRecorderRef.current.stop();
    }
    clearInterval(recordingTimer.current);
    setIsRecording(false);
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
    }
    clearInterval(recordingTimer.current);
    setIsRecording(false);
  };

  const uploadVoiceNote = async (audioBlob) => {
    if (!activeChannel || !profile) return;
    setIsUploadingVoice(true);
    
    // Add optimistic temp message
    const tempId = `temp-voice-${Date.now()}`;
    const optimisticMessage = {
      id: tempId,
      channel_id: toUUID(activeChannel?.id),
      user_id: toUUID(profile?.id),
      content: `Voice Note (${recordingTime}s)`,
      message_type: 'voice',
      media_url: URL.createObjectURL(audioBlob),
      created_at: new Date().toISOString(),
      profiles: profile,
    };
    setMessages(prev => [...prev, optimisticMessage]);

    try {
      const fileName = `voice_${profile.id}_${Date.now()}.webm`;
      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('chat-attachments')
        .upload(fileName, audioBlob, {
          contentType: 'audio/webm'
        });

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from('chat-attachments')
        .getPublicUrl(fileName);

      const fileUrl = urlData.publicUrl;

      // Save to database
      const { data, error } = await supabase
        .from('messages')
        .insert({
          channel_id: toUUID(activeChannel?.id),
          conversation_id: toUUID(activeChannel?.id),
          sender_id: toUUID(profile?.id),
          content: `Voice Note (${recordingTime}s)`,
          message_type: 'voice',
          media_url: fileUrl,
        })
        .select()
        .single();

      if (error) throw error;

      // Update optimistic message with real data
      setMessages(prev =>
        prev.map(msg => (msg.id === tempId ? { ...msg, ...data, user_id: data.sender_id } : msg))
      );
    } catch (err) {
      console.error("Failed to upload voice note:", err);
      toast.error("Failed to send voice message");
      // Remove optimistic message
      setMessages(prev => prev.filter(msg => msg.id !== tempId));
    } finally {
      setIsUploadingVoice(false);
    }
  };

  // Message Send Handler
  const handleSendMessage = async (e) => {
    if (e) e.preventDefault();
    if (!inputText.trim()) return;

    const messageContent = inputText;
    setInputText('');
    setReplyTarget(null);
    setShowAutocomplete(false);

    // Parse for Tasks
    const taskParse = parseTaskCommand(messageContent, members);
    if (taskParse && taskParse.error) {
      toast.error(`❌ ${taskParse.error}`);
      return;
    }
    
    // Check if the message is only a task, or task + other text
    // The parser returns isTask if it contains @task anywhere
    if (taskParse && taskParse.isTask) {
        let assignedUserIds = [];
        let collaboratorIds = [];
        
        const isDM = activeChannel?.name?.startsWith('dm_') || activeChannel?.name?.startsWith('dm-');
        const partner = isDM ? getDMPartner() : null;
        
        // Helper to extract valid Dyzo ID (ignoring Supabase UUIDs)
        const getValidId = (userObj) => {
           if (!userObj) return null;
           if (userObj.dyzoId) return userObj.dyzoId;
           if (userObj.id && !isNaN(userObj.id)) return userObj.id;
           return null;
        };
        
        // 1. Assignees logic
        if (taskParse.assignees.length === 0) {
           const pid = getValidId(partner);
           if (pid) assignedUserIds = [pid];
        } else {
           assignedUserIds = taskParse.assignees.map(getValidId).filter(Boolean);
        }

        // 2. Collaborators logic
        if (taskParse.collaborators.length === 0) {
           const myId = getValidId(profile);
           if (myId) collaboratorIds.push(myId);
           
           const pid = getValidId(partner);
           if (pid) collaboratorIds.push(pid);
        } else {
           collaboratorIds = taskParse.collaborators.map(getValidId).filter(Boolean);
        }
        
        // Ensure the creator and ALL assignees are always in collaborators
        const creatorId = getValidId(profile);
        const finalCollaborators = new Set([...collaboratorIds, ...assignedUserIds]);
        if (creatorId) finalCollaborators.add(creatorId);
        
        collaboratorIds = Array.from(finalCollaborators);

        try {
          await createTask({
            title: taskParse.title,
            description: taskParse.description,
            assigned_users: assignedUserIds,
            collaborators: collaboratorIds,
          });
          toast.success(`✅ Task created successfully`);
      } catch (err) {
        toast.error('❌ Failed to create task: ' + err.message);
        return; // Halt sending if task creation fails and user intended it as a task
      }
    }

    // Continue sending the message as a regular chat message too so it shows in history
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

  // Autocomplete Handlers
  const COMMANDS = ['@task ', '@description '];
  
  const handleInputChange = (e) => {
    const val = e.target.value;
    setInputText(val);

    // Detect if we should show autocomplete
    const cursorPosition = e.target.selectionStart;
    const textBeforeCursor = val.slice(0, cursorPosition);
    
    // Check for commands or mentions
    const lastAtPos = textBeforeCursor.lastIndexOf('@');
    if (lastAtPos !== -1) {
      const searchString = textBeforeCursor.slice(lastAtPos);
      // If there's no space after @ (or just starting to type)
      if (!searchString.includes(' ')) {
        setShowAutocomplete(true);
        setAutocompleteIndex(0);
        setAutocompleteType('command');
        const matches = COMMANDS.filter(c => {
          if (c === '@description ' && !val.includes('@task')) return false;
          return c.toLowerCase().startsWith(searchString.toLowerCase());
        });
        setAutocompleteSuggestions(matches);
      } else {
        setShowAutocomplete(false);
      }
    } else {
      setShowAutocomplete(false);
    }
  };

  const handleAutocompleteSelect = (suggestion) => {
    const input = textInputRef.current;
    if (!input) return;
    
    const cursorPosition = input.selectionStart;
    const textBeforeCursor = inputText.slice(0, cursorPosition);
    const textAfterCursor = inputText.slice(cursorPosition);
    
    const lastAtPos = textBeforeCursor.lastIndexOf('@');
    if (lastAtPos === -1) return;
    
    let replacement = suggestion;
    if (suggestion === '@task ') {
      replacement = '@task  @description ';
    }
    
    const newText = textBeforeCursor.slice(0, lastAtPos) + replacement + textAfterCursor;
    setInputText(newText);
    setShowAutocomplete(false);
    
    // Focus and adjust cursor
    setTimeout(() => {
      input.focus();
      if (suggestion === '@task ') {
        // Place cursor between @task and @description
        const newCursorPos = lastAtPos + '@task '.length;
        input.setSelectionRange(newCursorPos, newCursorPos);
      } else {
        input.setSelectionRange(lastAtPos + replacement.length, lastAtPos + replacement.length);
      }
    }, 0);
  };

  const handleKeyDown = (e) => {
    if (showAutocomplete && autocompleteSuggestions.length > 0) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setAutocompleteIndex(prev => (prev + 1) % autocompleteSuggestions.length);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setAutocompleteIndex(prev => (prev - 1 + autocompleteSuggestions.length) % autocompleteSuggestions.length);
      } else if (e.key === 'Enter' || e.key === 'Tab') {
        e.preventDefault();
        handleAutocompleteSelect(autocompleteSuggestions[autocompleteIndex]);
      } else if (e.key === 'Escape') {
        setShowAutocomplete(false);
      }
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

  // Get Shared Media
  const sharedMedia = messages.filter(msg => msg.media_url);
  const filteredSharedMedia = sharedMedia.filter(msg => {
    if (mediaTabType === 'media') return msg.message_type === 'image' || msg.message_type === 'video';
    return msg.message_type === 'document' || msg.message_type === 'voice';
  });

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
    if (activeChannel.name === 'general') {
      return 'Project Group Chat';
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

  if (!activeChannel) {
    return (
      <div className={`flex-1 flex flex-col items-center justify-center h-full overflow-hidden ${isDarkMode ? 'dark bg-slate-900' : 'bg-[#f0f2f5]'}`}>
        <div className="w-32 h-32 bg-white dark:bg-slate-800 shadow-xl rounded-full flex items-center justify-center mb-8 relative">
          <MessageSquare size={56} strokeWidth={1.5} className="text-emerald-500" />
          <div className="absolute top-0 right-0 w-8 h-8 bg-emerald-500 rounded-full border-4 border-[#f0f2f5] dark:border-slate-900 flex items-center justify-center">
             <Sparkles size={12} className="text-white" />
          </div>
        </div>
        <h2 className="text-3xl font-bold text-slate-800 dark:text-white mb-3">TeamFlow Chat</h2>
        <p className="text-slate-500 dark:text-slate-400 max-w-md text-center leading-relaxed">
          Select a project group chat or a team member from the sidebar to start messaging and collaborating seamlessly.
        </p>
      </div>
    );
  }

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
          onScroll={handleScroll}
          className={`flex-grow overflow-y-auto p-6 space-y-4 ${wallpaper} relative`}

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
                <div className={`relative max-w-[70%] ${openMenuId === msg.id ? 'z-50' : 'z-0'}`}>
                  
                  {/* Reaction Hover Palette */}
                  <div className="absolute -top-[30px] right-0 hidden group-hover:flex items-center gap-1 bg-white dark:bg-slate-800 shadow-md border border-slate-200 rounded-full px-2 py-1 z-50">
                    {['👍', '❤️', '😂', '😮', '😢', '🔥'].map(emoji => (
                      <button 
                        key={emoji} 
                        onClick={() => handleAddReaction(msg.id, emoji)}
                        className="hover:scale-125 transition-transform text-sm px-0.5"
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
                              <VoicePlayer src={msg.media_url} durationText={`(${msg.content.match(/\d+/)?.[0] || 0}s)`} />
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
                          <div className="flex flex-col gap-1">
                            <p className="whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                            {translatingMsgId === msg.id && (
                              <p className="text-[10px] text-emerald-600 dark:text-emerald-400 italic animate-pulse mt-1">Translating...</p>
                            )}
                            {translatedMessages[msg.id] && (
                              <div className="mt-1 pt-1.5 border-t border-slate-200 dark:border-slate-600/50">
                                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">{translatedMessages[msg.id].lang} translation</span>
                                <p className="whitespace-pre-wrap leading-relaxed text-[13px] text-slate-700 dark:text-slate-200 mt-0.5">{translatedMessages[msg.id].text}</p>
                              </div>
                            )}
                          </div>
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
                    <div className={`absolute top-2 right-2 transition-opacity z-10 ${openMenuId === msg.id ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                      <button 
                        onClick={() => setOpenMenuId(openMenuId === msg.id ? null : msg.id)}
                        className="text-slate-400 hover:text-slate-600 bg-white/50 hover:bg-white rounded p-0.5"
                      >
                        <MoreVertical size={16} />
                      </button>
                    </div>

                    {/* Custom Dropdown Menu */}
                    {openMenuId === msg.id && (
                      <div className="absolute top-8 right-2 bg-slate-100 dark:bg-slate-700 shadow-xl rounded-lg py-1 w-32 border border-slate-200 dark:border-slate-600 z-[100] overflow-hidden flex flex-col font-medium text-sm">
                        <button className="px-4 py-2.5 text-left hover:bg-slate-200 dark:hover:bg-slate-600 border-b border-slate-200 dark:border-slate-600 transition-colors text-slate-700 dark:text-slate-200" onClick={() => { setReplyTarget(msg); setOpenMenuId(null); }}>Reply</button>
                        {isSelf && <button className="px-4 py-2.5 text-left hover:bg-slate-200 dark:hover:bg-slate-600 border-b border-slate-200 dark:border-slate-600 transition-colors text-slate-700 dark:text-slate-200" onClick={() => { setEditingMessage(msg.id); setOpenMenuId(null); }}>Edit</button>}
                        <button className="px-4 py-2.5 text-left hover:bg-slate-200 dark:hover:bg-slate-600 border-b border-slate-200 dark:border-slate-600 transition-colors text-slate-700 dark:text-slate-200" onClick={() => { handleInlineTranslate(msg, 'English'); }}>Translate (EN)</button>
                        <button className="px-4 py-2.5 text-left hover:bg-slate-200 dark:hover:bg-slate-600 border-b border-slate-200 dark:border-slate-600 transition-colors text-slate-700 dark:text-slate-200" onClick={() => { handleInlineTranslate(msg, 'Hindi'); }}>Translate (HI)</button>
                        <button className="px-4 py-2.5 text-left hover:bg-slate-200 dark:hover:bg-slate-600 border-b border-slate-200 dark:border-slate-600 transition-colors text-slate-700 dark:text-slate-200" onClick={() => { handlePinMessage(msg.id); setOpenMenuId(null); }}>Pin</button>
                        <button className="px-4 py-2.5 text-left hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors text-rose-500" onClick={() => { handleDeleteForEveryone(msg.id); setOpenMenuId(null); }}>Delete</button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
          <div ref={chatEndRef} />
        </div>

        {/* Scroll to bottom button - Centered over chat feed */}
        {showScrollBottom && (
          <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2 z-40">
            <button
              onClick={scrollToBottom}
              className="bg-white text-slate-500 hover:text-slate-800 p-2.5 rounded-full shadow-md border border-slate-200 transition-all hover:scale-110 flex items-center justify-center"
            >
              <ArrowRight size={20} className="transform rotate-90" />
            </button>
          </div>
        )}

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

        {/* AI Tools Pills Panel */}
        {(isInputFocused || inputText.trim().length > 0) && (
          <div className="bg-white dark:bg-slate-800 px-4 py-2 border-t border-slate-200 dark:border-slate-700 flex items-center gap-2 overflow-x-auto no-scrollbar shrink-0">
            <Sparkles size={14} className="text-emerald-500 mr-1" />
            {['professional', 'shorten', 'expand', 'grammar_fix'].map((mode) => (
              <button
                key={mode}
                onClick={() => handleAIRewrite(mode)}
                disabled={activeAIPill !== null || !inputText.trim()}
                className={`px-3 py-1 text-[11px] font-medium rounded-full whitespace-nowrap transition-all ${
                  activeAIPill === mode 
                    ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 opacity-70 cursor-not-allowed animate-pulse'
                    : 'bg-slate-100 text-slate-600 hover:bg-emerald-50 hover:text-emerald-600 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed'
                }`}
              >
                {activeAIPill === mode ? 'Processing...' : mode.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
              </button>
            ))}
            
            <div className="h-4 w-px bg-slate-300 dark:bg-slate-600 mx-1"></div>
            
            {inputText.trim() && activeAIPill === null && (
              <div className="flex gap-1 ml-2">
                <button 
                  className="px-3 py-1 bg-indigo-50 text-indigo-600 hover:bg-indigo-100 dark:bg-indigo-900/30 dark:text-indigo-400 dark:hover:bg-indigo-900/50 rounded-full text-[11px] font-medium transition-colors"
                  onClick={() => { setAiTargetLang('English'); handleAITranslate('English'); }}
                >
                  English
                </button>
                <button 
                  className="px-3 py-1 bg-indigo-50 text-indigo-600 hover:bg-indigo-100 dark:bg-indigo-900/30 dark:text-indigo-400 dark:hover:bg-indigo-900/50 rounded-full text-[11px] font-medium transition-colors"
                  onClick={() => { setAiTargetLang('Hindi'); handleAITranslate('Hindi'); }}
                >
                  Hindi
                </button>
              </div>
            )}
          </div>
        )}

        {/* Input Controls Panel */}
        <div className="p-3 bg-[#f0f2f5] dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 flex items-center gap-3 shrink-0 relative">
          
          {/* Autocomplete Overlay */}
          {showAutocomplete && autocompleteSuggestions.length > 0 && (
            <div className="absolute bottom-full left-12 mb-2 w-64 bg-white dark:bg-slate-800 shadow-xl border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden z-50">
              {autocompleteSuggestions.map((suggestion, idx) => {
                const isUser = typeof suggestion !== 'string';
                const key = isUser ? suggestion.id : suggestion;
                const display = isUser ? suggestion.name : suggestion;
                return (
                  <div
                    key={key}
                    className={`px-4 py-2 cursor-pointer flex items-center gap-2 text-sm ${
                      idx === autocompleteIndex ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400' : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700'
                    }`}
                    onClick={() => handleAutocompleteSelect(suggestion)}
                  >
                    {isUser && (
                      <img src={suggestion.avatar_url || generateAvatar(suggestion.name)} alt="" className="w-6 h-6 rounded-full" />
                    )}
                    <span>{display}</span>
                    {isUser && <span className="text-[10px] text-slate-400 ml-auto">{suggestion.role}</span>}
                  </div>
                );
              })}
            </div>
          )}

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

          <form onSubmit={handleSendMessage} className="flex-grow flex items-center gap-2 relative">
            {isRecording ? (
              <div className="w-full flex items-center justify-between bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-full px-4 py-1.5 border border-red-200 dark:border-red-800 animate-in fade-in zoom-in duration-200">
                <div className="flex items-center gap-3">
                  <div className="relative flex items-center justify-center">
                    <div className="absolute w-8 h-8 bg-red-500 rounded-full animate-ping opacity-20"></div>
                    <Mic size={18} className="animate-pulse relative z-10 text-red-500" />
                  </div>
                  <span className="font-mono font-medium tracking-wider text-sm">
                    {Math.floor(recordingTime / 60)}:{(recordingTime % 60).toString().padStart(2, '0')}
                  </span>
                  
                  {/* Fake subtle waveform to look cool */}
                  <div className="flex items-center gap-1 ml-4 opacity-70">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <div key={i} className={`w-1 bg-red-500 rounded-full animate-bounce`} style={{ height: `${Math.random() * 12 + 4}px`, animationDelay: `${i * 0.1}s` }} />
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <button type="button" onClick={cancelRecording} className="p-2 hover:bg-red-100 dark:hover:bg-red-900/50 rounded-full transition-colors text-red-600" title="Cancel">
                    <Trash2 size={18} />
                  </button>
                  <button type="button" onClick={stopRecording} className="p-2 bg-red-500 hover:bg-red-600 text-white rounded-full transition-transform hover:scale-105 active:scale-95 ml-1" title="Send">
                    <Send size={16} className="ml-0.5" />
                  </button>
                </div>
              </div>
            ) : (
              <>
                <input
                  ref={textInputRef}
                  type="text"
                  value={inputText}
                  onChange={handleInputChange}
                  onKeyDown={handleKeyDown}
                  onFocus={() => setIsInputFocused(true)}
                  onBlur={() => setTimeout(() => setIsInputFocused(false), 200)}
                  placeholder="Type a message..."
                  className="w-full bg-white dark:bg-slate-700 text-slate-800 dark:text-white rounded-full px-5 py-2.5 text-sm focus:outline-none border border-slate-200 dark:border-slate-600 focus:border-emerald-500 shadow-sm transition-all"
                />
                {inputText.trim() ? (
                  <button 
                    type="submit" 
                    className="p-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full transition-all shadow-sm shrink-0"
                  >
                    <Send size={18} className="ml-0.5" />
                  </button>
                ) : (
                  <button 
                    type="button"
                    onClick={startRecording}
                    className="p-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-600 dark:text-slate-300 rounded-full transition-all shrink-0"
                  >
                    <Mic size={18} />
                  </button>
                )}
              </>
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
          
          {/* Tabs */}
          <div className="flex items-center border-b border-slate-200 dark:border-slate-700 shrink-0">
            <button 
              onClick={() => setMediaTabType('media')}
              className={`flex-1 py-3 text-sm font-medium text-center border-b-2 transition-colors ${
                mediaTabType === 'media' ? 'border-emerald-600 text-emerald-600' : 'border-transparent text-slate-500 hover:text-slate-700'
              }`}
            >
              Media
            </button>
            <button 
              onClick={() => setMediaTabType('docs')}
              className={`flex-1 py-3 text-sm font-medium text-center border-b-2 transition-colors ${
                mediaTabType === 'docs' ? 'border-emerald-600 text-emerald-600' : 'border-transparent text-slate-500 hover:text-slate-700'
              }`}
            >
              Docs
            </button>
          </div>

          <div className="p-4 overflow-y-auto flex-1 content-start grid grid-cols-2 gap-3 auto-rows-max">
            {filteredSharedMedia.length > 0 ? (
              filteredSharedMedia.map((mediaMsg) => {
                const isImage = mediaMsg.message_type === 'image';
                const isVideo = mediaMsg.message_type === 'video';
                const isDoc = mediaMsg.message_type === 'document' || mediaMsg.message_type === 'voice';

                return (
                  <div key={mediaMsg.id} className="bg-slate-100 dark:bg-slate-700 rounded overflow-hidden flex flex-col group relative h-28 cursor-pointer shadow-sm border border-slate-200 dark:border-slate-600">
                    <a href={mediaMsg.media_url} target="_blank" rel="noopener noreferrer" className="w-full h-full flex flex-col">
                      {isImage && (
                        <div className="w-full h-full bg-cover bg-center" style={{ backgroundImage: `url(${mediaMsg.media_url})` }}></div>
                      )}
                      {isVideo && (
                        <div className="w-full h-full bg-slate-900 flex items-center justify-center relative">
                          <VideoIcon size={24} className="text-white opacity-80" />
                          <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-all"></div>
                        </div>
                      )}
                      {isDoc && (
                        <div className="w-full h-full bg-slate-50 dark:bg-slate-600 flex flex-col items-center justify-center p-2 text-emerald-600 dark:text-emerald-400">
                          <div className="mt-2 text-slate-800 dark:text-slate-200 whitespace-pre-wrap flex items-center gap-2">
                            {mediaMsg.message_type === 'voice' ? (
                              isUploadingVoice && mediaMsg.id.startsWith('temp') ? (
                                <div className="flex items-center gap-3 bg-slate-100 dark:bg-slate-700/50 rounded-full p-2 pr-4 min-w-[200px]">
                                  <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-600 flex items-center justify-center">
                                    <Loader2 size={18} className="animate-spin text-slate-500" />
                                  </div>
                                  <div className="flex-1 text-sm text-slate-500 font-medium">Sending...</div>
                                </div>
                              ) : (
                                <VoicePlayer src={mediaMsg.file_url} durationText={`(${mediaMsg.content.match(/\d+/)?.[0] || 0}s)`} />
                              )
                            ) : (
                              <div className="flex items-center gap-2">
                                <FileText size={24} />
                                <span>{mediaMsg.content || 'File attached'}</span>
                              </div>
                            )}
                          </div>
                          <span className="text-[10px] mt-1 text-slate-500 dark:text-slate-300 truncate w-full text-center">
                            {mediaMsg.message_type === 'voice' ? 'Voice Note' : 'Document'}
                          </span>
                        </div>
                      )}
                    </a>
                  </div>
                );
              })
            ) : (
              <div className="col-span-2 text-center text-sm text-slate-500 mt-10">
                No {mediaTabType} shared in this chat yet.
              </div>
            )}
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
