'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useWorkspace } from '@/contexts/WorkspaceContext';
import { useAuth } from '@/contexts/AuthContext';
import { useCall } from '@/contexts/CallContext';
import { supabase } from '@/lib/supabase';
import {
  Send, Smile, MessageSquare, Sparkles, Languages, Check, ArrowRight,
  Info, AlertCircle, Copy, Trash2, Edit3, CornerUpLeft, Paperclip,
  Mic, Search, Pin, Star, Archive, ShieldAlert, FileText, Image as ImageIcon,
  Video as VideoIcon, CheckCheck, MoreVertical, X, Calendar, UserCheck,
  Square, Loader2, ChevronLeft, Phone
} from 'lucide-react';
import { generateAvatar } from '@/utils/avatar';
import { toast } from "toastflux";
import { parseTaskCommand } from '@/utils/taskParser';
import VoicePlayer from './VoicePlayer';
import EditGroupModal from '../workspace/EditGroupModal';

const toUUID = (str) => {
  if (!str) return '00000000-0000-0000-0000-000000000000';
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (uuidRegex.test(str)) return str;
  const clean = str.toString().replace(/[^0-9a-f]/gi, '').toLowerCase();
  const padded = clean.padEnd(32, '0').slice(0, 32);
  return `${padded.slice(0, 8)}-${padded.slice(8, 12)}-${padded.slice(12, 16)}-${padded.slice(16, 20)}-${padded.slice(20, 32)}`;
};

export default function ChatWindow() {
  const { activeChannel, setActiveChannel, messages, setMessages, members, createTask } = useWorkspace();
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
  const [showHeaderMenu, setShowHeaderMenu] = useState(false);
  const { startCall } = useCall();
  const [showEditGroupModal, setShowEditGroupModal] = useState(false);

  const [pinnedMessage, setPinnedMessage] = useState(null);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [scheduleTime, setScheduleTime] = useState('');
  const [showScrollBottom, setShowScrollBottom] = useState(false);
  const [openMenuId, setOpenMenuId] = useState(null);
  const [pendingAttachment, setPendingAttachment] = useState(null);
  const [initialScrollDone, setInitialScrollDone] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);

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
  const [wallpaper, setWallpaper] = useState('bg-slate-50/50'); // Modern Clean Cream/Beige
  const [isDarkMode, setIsDarkMode] = useState(false);

  const chatEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const messagesContainerRef = useRef(null);

  // Draft Management
  const lastChannelRef = useRef(activeChannel?.id);
  useEffect(() => {
    if (activeChannel?.id !== lastChannelRef.current) {
      if (activeChannel?.id) {
        const draft = localStorage.getItem(`draft_${activeChannel.id}`);
        setInputText(draft || '');
        setInitialScrollDone(false);
        setPendingAttachment(null);
      } else {
        setInputText('');
      }
      lastChannelRef.current = activeChannel?.id;
    } else if (activeChannel?.id) {
      if (inputText.trim() !== '') {
        localStorage.setItem(`draft_${activeChannel.id}`, inputText);
      } else {
        localStorage.removeItem(`draft_${activeChannel.id}`);
      }
    }
  }, [inputText, activeChannel?.id]);

  // Initial scroll and Auto-scroll
  const prevMessagesRef = useRef(messages);
  useEffect(() => {
    const prev = prevMessagesRef.current;

    // Initial load scroll
    if (messages.length > 0 && !initialScrollDone) {
      const firstUnreadMsg = messages.find(m =>
        m.sender_id?.toLowerCase() !== profile?.id?.toLowerCase() &&
        !m.metadata?.is_read
      );
      if (firstUnreadMsg) {
        const element = document.getElementById(`msg-${firstUnreadMsg.id}`);
        if (element) {
          element.scrollIntoView({ behavior: 'auto', block: 'center' });
          setInitialScrollDone(true);
          prevMessagesRef.current = messages;
          return;
        }
      } else {
        scrollToBottom(true);
        setInitialScrollDone(true);
        prevMessagesRef.current = messages;
        return;
      }
    }

    if (messages.length > prev.length && initialScrollDone) {
      const newMsg = messages[messages.length - 1];
      const isSelfMsg =
        newMsg.sender_id?.toLowerCase() === profile?.id?.toLowerCase() ||
        newMsg.user_id?.toLowerCase() === profile?.id?.toLowerCase();
      if (isSelfMsg) {
        scrollToBottom();
      }
    }
    prevMessagesRef.current = messages;
  }, [messages, profile, initialScrollDone]);

  const scrollToBottom = (instant = false) => {
    chatEndRef.current?.scrollIntoView({ behavior: instant ? 'auto' : 'smooth' });
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
    if (!inputText.trim() && !pendingAttachment) return;

    if (editingMessage) {
      await handleEditMessage(editingMessage, inputText);
      setInputText('');
      setPendingAttachment(null);
      return;
    }

    let messageContent = inputText;
    const attachmentToSend = pendingAttachment;

    setInputText('');
    setPendingAttachment(null);
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
        const taskResponse = await createTask({
          title: taskParse.title,
          description: taskParse.description,
          assigned_users: assignedUserIds,
          collaborators: collaboratorIds,
        });

        const dyzoTaskId = taskResponse?.task?._id || taskResponse?.task?.id || taskResponse?.data?._id || taskResponse?.data?.id || taskResponse?.id;
        if (dyzoTaskId) {
          messageContent += `\n\nTask Link: https://dyzo.ai/task/${dyzoTaskId}`;
        }

        toast.success(`✅ Task created successfully`);
      } catch (err) {
        toast.error('❌ Failed to create task: ' + err.message);
        return; // Halt sending if task creation fails and user intended it as a task
      }
    }

    let msgType = 'text';
    let fileUrl = null;

    if (attachmentToSend) {
      msgType = 'document';
      if (attachmentToSend.type.startsWith('image/')) msgType = 'image';
      else if (attachmentToSend.type.startsWith('video/')) msgType = 'video';
      else if (attachmentToSend.type.startsWith('audio/')) msgType = 'voice';

      const fileExt = attachmentToSend.name.split('.').pop() || 'png';
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const uploadingTempId = `uploading-${Date.now()}`;

      setMessages(prev => [...prev, {
        id: uploadingTempId,
        conversation_id: toUUID(activeChannel?.id),
        sender_id: toUUID(profile?.id),
        user_id: toUUID(profile?.id),
        content: `Uploading ${attachmentToSend.name}...`,
        message_type: msgType,
        isUploading: true,
        created_at: new Date().toISOString(),
        profiles: profile,
      }]);

      try {
        const { error: uploadError } = await supabase.storage
          .from('chat-attachments')
          .upload(fileName, attachmentToSend);
        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('chat-attachments')
          .getPublicUrl(fileName);
        fileUrl = publicUrl;
        setMessages(prev => prev.filter(msg => msg.id !== uploadingTempId));
      } catch (err) {
        toast.error("Failed to upload attachment");
        setMessages(prev => prev.filter(msg => msg.id !== uploadingTempId));
        return; // Halt sending if upload fails
      }
    }

    const tempId = `temp-${Date.now()}`;
    const optimisticMessage = {
      id: tempId,
      conversation_id: toUUID(activeChannel?.id),
      sender_id: toUUID(profile?.id),
      user_id: toUUID(profile?.id),
      content: messageContent || `Sent a ${msgType}`,
      message_type: msgType,
      media_url: fileUrl,
      created_at: new Date().toISOString(),
      profiles: profile,
      reply_to_message_id: replyTarget ? replyTarget.id : null,
    };

    setMessages(prev => [...prev, optimisticMessage]);
    setTimeout(() => scrollToBottom(), 100);

    try {
      const { data, error } = await supabase
        .from('messages')
        .insert({
          conversation_id: toUUID(activeChannel?.id),
          sender_id: toUUID(profile?.id),
          content: messageContent || `Sent a ${msgType}`,
          message_type: msgType,
          media_url: fileUrl,
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

  const handlePaste = (e) => {
    const items = e.clipboardData?.items;
    if (!items) return;
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf('image') !== -1) {
        const file = items[i].getAsFile();
        if (file) {
          const fakeFile = new File([file], file.name || 'pasted-image.png', { type: file.type });
          setPendingAttachment(fakeFile);
        }
        break;
      }
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPendingAttachment(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
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
        .update({ deleted_for_everyone: true, content: '🚫 This message was deleted', media_url: null })
        .eq('id', toUUID(msgId));

      setMessages(prev =>
        prev.map(msg => (msg.id === msgId ? { ...msg, deleted_for_everyone: true, content: '🚫 This message was deleted', media_url: null } : msg))
      );
      toast.success("Message deleted!");
    } catch (err) {
      console.error(err);
      toast.error("Could not delete message.");
    }
  };

  const handleDownloadImage = async (url, customFilename) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = customFilename || `downloaded-image-${Date.now()}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(blobUrl);
      toast.success("Downloading image...");
    } catch (err) {
      console.error("Error downloading file:", err);
      window.open(url, '_blank');
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
      const tempId = Date.now().toString();
      const newReaction = { id: tempId, message_id: msgId, user_id: profile?.id, emoji };
      setMessages(prev => prev.map(msg => {
        if (msg.id === msgId) {
          const reactions = msg.message_reactions || [];
          return { ...msg, message_reactions: [...reactions, newReaction] };
        }
        return msg;
      }));

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
  const isGroup = activeChannel && !activeChannel.is_private && !activeChannel.name?.startsWith('dm_') && !activeChannel.name?.startsWith('dm-');

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

        {/* Sticky Modern Header */}
        <div className="h-16 bg-white/80 backdrop-blur-md dark:bg-slate-900/80 border-b border-slate-200/60 dark:border-slate-800 px-4 md:px-6 flex items-center justify-between shrink-0 select-none z-20 shadow-sm sticky top-0">
          <div className="flex items-center gap-3">
            <button onClick={() => setActiveChannel(null)} className="md:hidden p-1 -ml-1 text-slate-500 hover:text-slate-800 rounded-full hover:bg-slate-100 transition-colors">
              <ChevronLeft size={24} />
            </button>
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
            {!isGroup && activeChannel && (
              <>
                <button onClick={() => startCall(activeChannel, 'audio')} title="Audio Call" className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors">
                  <Phone size={20} className="hover:text-emerald-600 transition-colors" />
                </button>
                <button onClick={() => startCall(activeChannel, 'video')} title="Video Call" className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors">
                  <VideoIcon size={20} className="hover:text-emerald-600 transition-colors" />
                </button>
              </>
            )}
            {isGroup && (
              <button onClick={() => setShowSearch(!showSearch)} title="Search Messages">
                <Search size={20} className="hover:text-emerald-600 transition-colors" />
              </button>
            )}
            <button onClick={() => setShowMediaTab(!showMediaTab)} title="Shared Media">
              <Paperclip size={20} className="hover:text-emerald-600 transition-colors" />
            </button>
            <button onClick={() => setShowScheduleModal(true)} title="Schedule Message">
              <Calendar size={20} className="hover:text-emerald-600 transition-colors" />
            </button>
            <div className="relative">
              <MoreVertical
                size={20}
                className="cursor-pointer hover:text-emerald-600"
                onClick={() => setShowHeaderMenu(!showHeaderMenu)}
              />
              {showHeaderMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-800 rounded-lg shadow-xl border border-slate-200 dark:border-slate-700 py-1 z-50 animate-in fade-in zoom-in duration-100">
                  {isGroup && (
                    <button
                      onClick={() => {
                        setShowHeaderMenu(false);
                        setShowEditGroupModal(true);
                      }}
                      className="w-full text-left px-4 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                    >
                      Edit Group
                    </button>
                  )}
                  <button
                    onClick={() => setShowHeaderMenu(false)}
                    className="w-full text-left px-4 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                  >
                    Close Menu
                  </button>
                </div>
              )}
            </div>
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
          className={`flex-grow overflow-y-auto px-3 md:px-6 py-6 space-y-5 pb-32 ${wallpaper} relative`}
        >

          {filteredMessages.map((msg, idx) => {
            const isSelf = msg.sender_id?.toLowerCase() === profile?.id?.toLowerCase() || msg.user_id?.toLowerCase() === profile?.id?.toLowerCase();
            const isLastFew = idx >= filteredMessages.length - 3 && idx >= 3;

            return (
              <div
                key={msg.id}
                id={`msg-${msg.id}`}
                className={`flex w-full ${isSelf ? 'justify-end' : 'justify-start'} group ${msg.message_reactions && msg.message_reactions.length > 0 ? 'mb-4' : 'mb-1'} transition-colors duration-500`}
              >
                {/* Message Bubble Container */}
                <div className={`relative max-w-[70%] ${openMenuId === msg.id ? 'z-50' : 'z-0'}`}>

                  {/* Reaction Hover Palette */}
                  <div className={`absolute -top-[30px] ${isSelf ? 'right-0' : 'left-0'} hidden group-hover:flex items-center gap-1 bg-white dark:bg-slate-800 shadow-md border border-slate-200 rounded-full px-2 py-1 z-50`}>
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
                  <div className={`p-3.5 rounded-[20px] shadow-sm text-[15px] leading-relaxed relative ${isSelf
                    ? 'bg-gradient-to-br from-primary-600 to-primary-500 text-white rounded-tr-sm shadow-primary-500/20'
                    : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-white rounded-tl-sm border border-slate-100 dark:border-slate-700'
                    }`}>

                    {/* Sender Profile Name for Groups */}
                    {!isSelf && !(activeChannel?.name?.startsWith('dm_') || activeChannel?.name?.startsWith('dm-') || activeChannel?.is_private) && (
                      <span className="block text-xs font-bold text-emerald-700 dark:text-emerald-300 mb-0.5">
                        {msg.profiles?.name || 'User'}
                      </span>
                    )}

                    {/* Reply Context Render */}
                    {msg.reply_to_message_id && (() => {
                      const repliedMsg = messages.find(m => m.id === msg.reply_to_message_id);
                      if (!repliedMsg) {
                        return (
                          <div className={`border-l-4 border-emerald-500 p-2 rounded text-xs mb-2 font-medium select-none ${
                            isSelf ? 'bg-white/10 text-white/90' : 'bg-slate-50/70 dark:bg-slate-800/50 text-slate-600 dark:text-slate-300'
                          }`}>
                            Replied to another message
                          </div>
                        );
                      }
                      const senderName = repliedMsg.profiles?.name || 'User';
                      let previewText = repliedMsg.content;
                      if (!previewText || (repliedMsg.media_url && previewText.startsWith('Uploading '))) {
                        if (repliedMsg.message_type === 'image') previewText = '📸 Photo';
                        else if (repliedMsg.message_type === 'video') previewText = '🎥 Video';
                        else if (repliedMsg.message_type === 'voice') previewText = '🎤 Voice message';
                        else if (repliedMsg.message_type === 'document') previewText = '📄 Document';
                        else previewText = 'Attachment';
                      }
                      return (
                        <div className={`border-l-4 border-emerald-500 p-2 rounded text-xs mb-2 select-none cursor-pointer hover:opacity-90 ${
                          isSelf ? 'bg-white/10 text-white/95' : 'bg-slate-50/70 dark:bg-slate-800/50 text-slate-600 dark:text-slate-300'
                        }`} onClick={(e) => {
                          e.stopPropagation();
                          const el = document.getElementById(`msg-${msg.reply_to_message_id}`);
                          if (el) {
                            el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                            el.classList.add('bg-emerald-500/20');
                            setTimeout(() => el.classList.remove('bg-emerald-500/20'), 2000);
                          }
                        }}>
                          <span className={`block font-bold mb-0.5 ${
                            isSelf ? 'text-emerald-200' : 'text-emerald-600 dark:text-emerald-400'
                          }`}>
                            {senderName}
                          </span>
                          <span className="block truncate max-w-[250px]">
                            {previewText}
                          </span>
                        </div>
                      );
                    })()}


                    {/* Content */}
                    <div>
                      {msg.isUploading ? (
                        <div className="flex flex-col items-center justify-center p-6 space-y-2 bg-slate-50 dark:bg-slate-800 rounded-lg min-w-[200px]">
                          <div className="w-6 h-6 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
                          <span className="text-xs text-slate-500 font-semibold">Uploading file...</span>
                        </div>
                      ) : msg.media_url && (
                        <div className="mt-1 mb-2 max-w-full overflow-hidden rounded-lg border border-slate-100 dark:border-slate-650 bg-slate-50 dark:bg-slate-800">
                           {msg.message_type === 'image' && (
                            <div className="relative group/img max-h-60 overflow-hidden rounded flex items-center justify-center">
                              <img
                                src={msg.media_url}
                                alt="Attachment"
                                className="max-h-60 w-auto object-contain rounded cursor-pointer hover:opacity-95 transition-opacity"
                                onClick={() => setPreviewImage(msg.media_url)}
                              />
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDownloadImage(msg.media_url, `chat-image-${msg.id}.png`);
                                }}
                                className="absolute bottom-2 right-2 p-1.5 bg-black/60 hover:bg-black/80 text-white rounded-full opacity-0 group-hover/img:opacity-100 transition-opacity shadow-sm flex items-center justify-center"
                                title="Download Image"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg>
                              </button>
                            </div>
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
                      {!msg.isUploading && (msg.message_type === 'text' || (msg.content && msg.content !== `Sent a ${msg.message_type}` && !msg.content.startsWith('Uploading '))) && (
                        <div className="flex flex-col gap-1">
                          <p className="whitespace-pre-wrap leading-relaxed">
                            {msg.content.split(/(https?:\/\/[^\s]+)/g).map((part, i) =>
                              part.match(/^https?:\/\//) ? (
                                <a key={i} href={part} target="_blank" rel="noopener noreferrer" className="underline font-semibold hover:opacity-80 break-all" onClick={(e) => e.stopPropagation()}>
                                  {part}
                                </a>
                              ) : part
                            )}
                          </p>
                          {translatingMsgId === msg.id && (
                            <p className="text-[10px] text-emerald-600 dark:text-emerald-400 italic animate-pulse mt-1">Translating...</p>
                          )}
                          {translatedMessages[msg.id] && (
                            <div className="mt-1 pt-1.5 border-t border-slate-200 dark:border-slate-600/50">
                              <span className="text-[9px] font-bold text-[#bca1f9] uppercase tracking-wider">{translatedMessages[msg.id].lang} translation</span>
                              <p className="whitespace-pre-wrap text-[#bca1f9] leading-relaxed text-[13px] text-white dark:text-slate-200 mt-0.5">{translatedMessages[msg.id].text}</p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Time & Read Receipts */}
                    <div className={`flex items-center justify-end gap-1.5 mt-1.5 text-[10px] select-none ${isSelf ? 'text-primary-100' : 'text-slate-400 dark:text-slate-500'}`}>
                      <span>{new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      {msg.edited && <span className="italic">(edited)</span>}
                      {isSelf && (
                        <span>
                          {msg.metadata?.is_read ? (
                            <span className="text-sky-300 drop-shadow-sm" title="Seen">
                              <CheckCheck size={14} />
                            </span>
                          ) : isPartnerOnline ? (
                            <span className="text-white/70" title="Delivered">
                              <CheckCheck size={14} />
                            </span>
                          ) : (
                            <span className="text-white/50" title="Sent (Offline)">
                              <Check size={14} />
                            </span>
                          )}
                        </span>
                      )}
                    </div>

                    {/* Reactions Display */}
                    {msg.message_reactions && msg.message_reactions.length > 0 && (
                      <div className={`absolute -bottom-3 ${isSelf ? 'right-2' : 'left-2'} flex flex-wrap gap-1 z-10`}>
                        {Object.entries(
                          msg.message_reactions.reduce((acc, r) => { acc[r.emoji] = (acc[r.emoji] || 0) + 1; return acc; }, {})
                        ).map(([emoji, count]) => (
                          <div key={emoji} className="flex items-center gap-0.5 bg-white dark:bg-slate-800 shadow-[0_1px_3px_rgba(0,0,0,0.15)] border border-slate-100 dark:border-slate-700 rounded-full px-1.5 py-0.5 text-[11px] select-none">
                            <span>{emoji}</span>
                            {count > 1 && <span className="font-semibold text-slate-600 dark:text-slate-300 ml-0.5">{count}</span>}
                          </div>
                        ))}
                      </div>
                    )}

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
                      <div className={`absolute ${isLastFew ? 'bottom-[calc(100%-32px)]' : 'top-8'} ${isSelf ? 'right-2' : 'left-2'} bg-slate-100 dark:bg-slate-700 shadow-xl rounded-lg py-1 w-32 border border-slate-200 dark:border-slate-600 z-[100] overflow-hidden flex flex-col font-medium text-sm`}>
                        <button className="px-4 py-2.5 text-left hover:bg-slate-200 dark:hover:bg-slate-600 border-b border-slate-200 dark:border-slate-600 transition-colors text-slate-700 dark:text-slate-200" onClick={() => { setReplyTarget(msg); setOpenMenuId(null); }}>Reply</button>
                        {isSelf && <button className="px-4 py-2.5 text-left hover:bg-slate-200 dark:hover:bg-slate-600 border-b border-slate-200 dark:border-slate-600 transition-colors text-slate-700 dark:text-slate-200" onClick={() => { setEditingMessage(msg.id); setInputText(msg.content); setOpenMenuId(null); textInputRef.current?.focus(); }}>Edit</button>}
                        <button className="px-4 py-2.5 text-left hover:bg-slate-200 dark:hover:bg-slate-600 border-b border-slate-200 dark:border-slate-600 transition-colors text-slate-700 dark:text-slate-200" onClick={() => { handleInlineTranslate(msg, 'English'); }}>Translate (EN)</button>
                        <button className="px-4 py-2.5 text-left hover:bg-slate-200 dark:hover:bg-slate-600 border-b border-slate-200 dark:border-slate-600 transition-colors text-slate-700 dark:text-slate-200" onClick={() => { handleInlineTranslate(msg, 'Hindi'); }}>Translate (HI)</button>
                        <button className="px-4 py-2.5 text-left hover:bg-slate-200 dark:hover:bg-slate-600 border-b border-slate-200 dark:border-slate-600 transition-colors text-slate-700 dark:text-slate-200" onClick={() => { handlePinMessage(msg.id); setOpenMenuId(null); }}>Pin</button>
                        {isSelf && <button className="px-4 py-2.5 text-left hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors text-rose-500" onClick={() => { handleDeleteForEveryone(msg.id); setOpenMenuId(null); }}>Delete</button>}
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
          <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2 z-[140]">
            <button
              onClick={scrollToBottom}
              className="bg-white text-slate-500 hover:text-slate-800 p-2.5 rounded-full shadow-md border border-slate-200 transition-all hover:scale-110 flex items-center justify-center"
            >
              <ArrowRight size={20} className="transform rotate-90" />
            </button>
          </div>
        )}

        {/* Bottom Input Area Container */}
        <div className="absolute bottom-4 left-4 right-4 z-[150] flex flex-col gap-2 pointer-events-none">
          {/* AI Tools Pills Panel */}
          <div className={`w-full flex items-center gap-2 overflow-x-auto no-scrollbar transition-all duration-300 pointer-events-auto ${
            isInputFocused || inputText.trim().length > 0
              ? 'opacity-100 translate-y-0 max-h-12'
              : 'opacity-0 translate-y-2 pointer-events-none max-h-0 overflow-hidden'
          }`}>
          <div className="bg-white/90 backdrop-blur-md dark:bg-slate-800/90 px-4 py-2 rounded-full border border-slate-200/50 dark:border-slate-700/50 shadow-sm flex items-center gap-2">
            <Sparkles size={16} className="text-primary-500 mr-1" />
            {['professional', 'shorten', 'expand', 'grammar_fix'].map((mode) => (
              <button
                key={mode}
                onClick={() => handleAIRewrite(mode)}
                disabled={activeAIPill !== null || !inputText.trim()}
                className={`px-3 py-1.5 text-[11px] font-semibold rounded-full whitespace-nowrap transition-all ${activeAIPill === mode
                  ? 'bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400 opacity-70 cursor-not-allowed animate-pulse'
                  : 'bg-slate-100 text-slate-600 hover:bg-primary-50 hover:text-primary-600 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed'
                  }`}
              >
                {activeAIPill === mode ? 'Processing...' : mode.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
              </button>
            ))}

            <div className="h-4 w-px bg-slate-200 dark:bg-slate-600 mx-1"></div>

            {inputText.trim() && activeAIPill === null && (
              <div className="flex gap-1 ml-2">
                <button
                  className="px-3 py-1.5 bg-primary-50 text-primary-600 hover:bg-primary-100 dark:bg-primary-900/30 dark:text-primary-400 dark:hover:bg-primary-900/50 rounded-full text-[11px] font-semibold transition-colors border border-primary-100"
                  onClick={() => { setAiTargetLang('English'); handleAITranslate('English'); }}
                >
                  English
                </button>
                <button
                  className="px-3 py-1.5 bg-primary-50 text-primary-600 hover:bg-primary-100 dark:bg-primary-900/30 dark:text-primary-400 dark:hover:bg-primary-900/50 rounded-full text-[11px] font-semibold transition-colors border border-primary-100"
                  onClick={() => { setAiTargetLang('Hindi'); handleAITranslate('Hindi'); }}
                >
                  Hindi
                </button>
              </div>
            )}
          </div>
        </div>

          {/* Input Controls Panel - Floating Glass Container */}
          <div className="w-full bg-white/90 backdrop-blur-lg dark:bg-slate-800/90 border border-slate-200/50 dark:border-slate-700/50 shadow-[0_8px_30px_rgba(0,0,0,0.08)] rounded-[24px] p-2 flex flex-col gap-2 pointer-events-auto transition-all duration-300 hover:shadow-[0_12px_40px_rgba(0,0,0,0.12)]">

          {/* Edit Target Info */}
          {editingMessage && (
            <div className="bg-indigo-50/50 dark:bg-indigo-900/30 px-4 py-2 rounded-xl flex items-center justify-between text-xs text-indigo-600 dark:text-indigo-300 animate-slide-up mx-2 mt-1">
              <div className="border-l-2 border-indigo-500 pl-2">
                <span className="font-bold text-indigo-600">Editing Message</span>
                <p className="truncate text-indigo-500/80 max-w-[200px] sm:max-w-md">Update the text below and press Enter</p>
              </div>
              <button onClick={() => { setEditingMessage(null); setInputText(''); }} className="p-1 hover:bg-indigo-100 dark:hover:bg-indigo-800 rounded-full transition-colors">
                <X size={14} />
              </button>
            </div>
          )}

          {/* Reply Preview Bar */}
          {replyTarget && (
            <div className="bg-slate-50/50 dark:bg-slate-800/50 px-4 py-2 rounded-xl flex items-center justify-between text-xs text-slate-600 dark:text-slate-300 animate-slide-up mx-2 mt-1">
              <div className="border-l-2 border-emerald-500 pl-2">
                <span className="font-bold text-emerald-600">Replying to {replyTarget.profiles?.name || 'User'}</span>
                <p className="truncate text-slate-500 max-w-[200px] sm:max-w-md">{replyTarget.content}</p>
              </div>
              <button onClick={() => setReplyTarget(null)} className="p-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full transition-colors">
                <X size={14} />
              </button>
            </div>
          )}

          {pendingAttachment && (
            <div className="relative self-start mt-2 ml-2 mb-1">
              {pendingAttachment.type.startsWith('image/') ? (
                <img src={URL.createObjectURL(pendingAttachment)} alt="Preview" className="h-20 w-auto rounded border" />
              ) : (
                <div className="flex items-center gap-2 p-3 bg-slate-100 rounded border">
                  <FileText size={24} className="text-emerald-600" />
                  <span className="text-sm font-medium">{pendingAttachment.name}</span>
                </div>
              )}
              <button type="button" onClick={() => setPendingAttachment(null)} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow hover:bg-red-600 transition-colors">
                <X size={12} />
              </button>
            </div>
          )}

          <div className="flex items-center gap-2 w-full">
            {/* Autocomplete Overlay */}
            {showAutocomplete && autocompleteSuggestions.length > 0 && (
              <div className="absolute bottom-full left-4 mb-3 w-64 bg-white dark:bg-slate-800 shadow-xl border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden z-50">
                {autocompleteSuggestions.map((suggestion, idx) => {
                  const isUser = typeof suggestion !== 'string';
                  const key = isUser ? suggestion.id : suggestion;
                  const display = isUser ? suggestion.name : suggestion;
                  return (
                    <div
                      key={key}
                      className={`px-4 py-2.5 cursor-pointer flex items-center gap-3 text-sm transition-colors ${idx === autocompleteIndex ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400' : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700'
                        }`}
                      onClick={() => handleAutocompleteSelect(suggestion)}
                    >
                      {isUser && (
                        <img src={suggestion.avatar_url || generateAvatar(suggestion.name)} alt="" className="w-6 h-6 rounded-full" />
                      )}
                      <span className="font-medium">{display}</span>
                      {isUser && <span className="text-[10px] text-slate-400 ml-auto">{suggestion.role}</span>}
                    </div>
                  );
                })}
              </div>
            )}

            <div className="flex items-center gap-1 pl-2 shrink-0">

              <button className="p-2 text-slate-400 hover:text-primary-500 hover:bg-primary-50 rounded-full transition-all" onClick={() => fileInputRef.current?.click()} title="Attach File">
                <Paperclip size={22} />
              </button>
            </div>
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
                    onPaste={handlePaste}
                    onFocus={() => setIsInputFocused(true)}
                    onBlur={() => setTimeout(() => setIsInputFocused(false), 200)}
                    placeholder="Type a message..."
                    className="w-full bg-transparent text-slate-800 dark:text-white px-2 py-2 text-[15px] focus:outline-none placeholder:text-slate-400"
                  />
                  {inputText.trim() ? (
                    <button
                      type="submit"
                      onMouseDown={(e) => e.preventDefault()}
                      onTouchStart={(e) => e.preventDefault()}
                      className="p-3 bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-700 hover:to-primary-600 text-white rounded-full transition-all shadow-md shrink-0 transform hover:scale-105"
                    >
                      <Send size={18} className="ml-0.5" />
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={startRecording}
                      className="p-3 bg-slate-100 hover:bg-primary-50 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-500 hover:text-primary-600 rounded-full transition-all shrink-0"
                    >
                      <Mic size={18} />
                    </button>
                  )}
                </>
              )}
            </form>
          </div>
        </div>
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
              className={`flex-1 py-3 text-sm font-medium text-center border-b-2 transition-colors ${mediaTabType === 'media' ? 'border-emerald-600 text-emerald-600' : 'border-transparent text-slate-500 hover:text-slate-700'
                }`}
            >
              Media
            </button>
            <button
              onClick={() => setMediaTabType('docs')}
              className={`flex-1 py-3 text-sm font-medium text-center border-b-2 transition-colors ${mediaTabType === 'docs' ? 'border-emerald-600 text-emerald-600' : 'border-transparent text-slate-500 hover:text-slate-700'
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

      {showEditGroupModal && (
        <EditGroupModal
          channel={activeChannel}
          members={members}
          currentUser={profile}
          onClose={() => setShowEditGroupModal(false)}
          onSave={async (name, selectedMembers, avatarUrl) => {
            try {
              const { error: updateErr } = await supabase
                .from('channels')
                .update({ name, avatar_url: avatarUrl })
                .eq('id', activeChannel.id);

              if (updateErr) throw updateErr;

              await supabase.from('conversation_members').delete().eq('conversation_id', activeChannel.id);

              const memberships = [...selectedMembers, profile.id].map(uid => ({
                conversation_id: activeChannel.id,
                user_id: toUUID(uid)
              }));
              await supabase.from('conversation_members').upsert(memberships);

              toast.success("Group updated successfully!");
              setShowEditGroupModal(false);
              setActiveChannel(prev => ({ ...prev, name, avatar_url: avatarUrl }));
            } catch (e) {
              toast.error("Failed to update group: " + e.message);
            }
          }}
        />
      )}

      {/* Fullscreen Image Preview Modal */}
      {previewImage && (
        <div
          className="fixed inset-0 bg-black/90 backdrop-blur-sm z-[9999] flex flex-col items-center justify-center p-4 animate-in fade-in duration-200"
          onClick={() => setPreviewImage(null)}
        >
          {/* Close button top right */}
          <button
            onClick={() => setPreviewImage(null)}
            className="absolute top-4 right-4 p-2 bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors z-[10000]"
            title="Close Preview"
          >
            <X size={24} />
          </button>

          {/* Download button top right next to close */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleDownloadImage(previewImage, `preview-image-${Date.now()}.png`);
            }}
            className="absolute top-4 right-16 p-2 bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors z-[10000] flex items-center justify-center"
            title="Download Image"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg>
          </button>

          {/* Centered Large Image */}
          <div
            className="relative max-w-full max-h-[85vh] flex items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={previewImage}
              alt="Fullscreen Preview"
              className="max-w-full max-h-[85vh] object-contain rounded-lg shadow-2xl select-none"
            />
          </div>
        </div>
      )}
    </div>
  );
}
