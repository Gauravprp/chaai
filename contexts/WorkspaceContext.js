'use client';

import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from './AuthContext';

const WorkspaceContext = createContext({});

// Deterministic UUID converter for MongoDB ObjectIds and integer IDs to satisfy Postgres UUID type constraints
const toUUID = (str) => {
  if (!str) return '00000000-0000-0000-0000-000000000000';
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (uuidRegex.test(str)) return str;
  const clean = str.toString().replace(/[^0-9a-f]/gi, '').toLowerCase();
  const padded = clean.padEnd(32, '0').slice(0, 32);
  return `${padded.slice(0, 8)}-${padded.slice(8, 12)}-${padded.slice(12, 16)}-${padded.slice(16, 20)}-${padded.slice(20, 32)}`;
};

export function WorkspaceProvider({ children }) {
  const { user } = useAuth();
  const [workspaces, setWorkspaces] = useState([]);
  const [activeWorkspace, setActiveWorkspace] = useState(null);
  const [projects, setProjects] = useState([]);
  const [activeProject, setActiveProject] = useState({ id: 'all', name: 'All Projects' });
  const [teams, setTeams] = useState([]);
  const [activeTeam, setActiveTeam] = useState(null);
  const [channels, setChannels] = useState([]);
  const [activeChannel, setActiveChannel] = useState(null);
  const [messages, setMessages] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [leaves, setLeaves] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(false);

  // WhatsApp-style unified states
  const [conversations, setConversations] = useState([]);
  const [activeConversation, setActiveConversation] = useState(null);
  const [blockedUsers, setBlockedUsers] = useState([]);
  const [starredMessages, setStarredMessages] = useState([]);
  const [presenceList, setPresenceList] = useState({});
  const [typingUsers, setTypingUsers] = useState({});
  const [archivedConversations, setArchivedConversations] = useState([]);

  const activeChannelRef = useRef(activeChannel);
  const userRef = useRef(user);
  const membersRef = useRef(members);

  useEffect(() => {
    activeChannelRef.current = activeChannel;
  }, [activeChannel]);

  useEffect(() => {
    userRef.current = user;
  }, [user]);

  useEffect(() => {
    membersRef.current = members;
  }, [members]);

  // Load cache on mount to prevent hydration mismatch
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const cachedProj = localStorage.getItem('tf_active_project');
      if (cachedProj) {
        try {
          const parsed = JSON.parse(cachedProj);
          if (parsed && !parsed.id?.toString().startsWith('mock-')) {
            setActiveProject(parsed);
          } else {
            localStorage.removeItem('tf_active_project');
          }
        } catch (e) {}
      }
      const cachedChan = localStorage.getItem('tf_active_channel');
      if (cachedChan) {
        try {
          const parsed = JSON.parse(cachedChan);
          if (parsed && !parsed.id?.toString().startsWith('mock-')) {
            setActiveChannel(parsed);
          } else {
            localStorage.removeItem('tf_active_channel');
          }
        } catch (e) {}
      }
    }
  }, []);

  // Load workspaces when authenticated
  useEffect(() => {
    if (!user) {
      setWorkspaces([]);
      setActiveWorkspace(null);
      return;
    }
    loadWorkspaces();
  }, [user]);

  // Load sub-resources when workspace changes
  useEffect(() => {
    if (!activeWorkspace) {
      setProjects([]);
      setTeams([]);
      setChannels([]);
      setTasks([]);
      setLeaves([]);
      setMembers([]);
      return;
    }
    loadWorkspaceDetails();
    const cleanup = setupRealtimeSubscriptions();
    return () => {
      if (cleanup) cleanup();
    };
  }, [activeWorkspace, user]);

  const initMockWorkspaces = () => {
    const mockWs = { id: toUUID('mock-ws-id'), name: 'TeamFlow AI Workspace', slug: 'teamflow-ai-workspace' };
    setWorkspaces([mockWs]);
    setActiveWorkspace(mockWs);
  };

  const initMockProjects = () => {
    const mockProj = { id: toUUID('mock-proj-id'), name: 'Main Development', description: 'Dyzo and TeamFlow Collaboration' };
    setProjects([mockProj]);
    setActiveProject({ id: 'all', name: 'All Projects' });
  };

  const initMockTeams = () => {
    const mockTeam = { id: toUUID('mock-team-id'), name: 'Core Team', project_id: toUUID('mock-proj-id') };
    setTeams([mockTeam]);
    setActiveTeam(mockTeam);
  };

  const initMockChannels = () => {
    if (user?.id) {
      getOrCreateDMChannel(user.id);
    }
  };

  const loadWorkspaces = async () => {
    setLoading(true);
    try {
      if (!process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL.includes('placeholder')) {
        throw new Error("Placeholder Supabase URL detected");
      }
      
      const userUuid = toUUID(user.id);
      
      // Ensure current user's profile is registered with their UUID in Supabase
      try {
        await supabase.from('profiles').upsert({
          id: userUuid,
          name: user.name || 'User',
          role: user.role || 'Member',
          department: user.department || 'Tech'
        });
      } catch (profErr) {
        console.warn("Failed to register profile UUID:", profErr.message);
      }

      const { data, error } = await supabase
        .from('workspaces')
        .select('*, workspace_members!inner(user_id)')
        .eq('workspace_members.user_id', userUuid);

      if (error) throw error;
      
      if (data && data.length > 0) {
        setWorkspaces(data);
        if (!activeWorkspace) setActiveWorkspace(data[0]);
      } else {
        // Auto-seed a real workspace in the database for this user so they don't stay in mock fallback mode
        try {
          const wsSlug = `workspace-${user.id}-${Date.now().toString().slice(-4)}`;
          const wsId = toUUID(`ws-${user.id}-${Date.now()}`);

          const { data: newWs, error: wsErr } = await supabase
            .from('workspaces')
            .insert({
              id: wsId,
              name: 'TeamFlow AI Workspace',
              slug: wsSlug,
              owner_id: userUuid
            })
            .select()
            .single();

          if (wsErr) throw wsErr;

          const { error: memErr } = await supabase
            .from('workspace_members')
            .insert({
              workspace_id: newWs.id,
              user_id: userUuid,
              role: 'owner'
            });

          if (memErr) throw memErr;

          setWorkspaces([newWs]);
          setActiveWorkspace(newWs);
        } catch (seedErr) {
          console.warn("Auto-seeding workspace failed, using mock:", seedErr.message);
          initMockWorkspaces();
        }
      }
    } catch (err) {
      console.warn("Supabase loadWorkspaces failed, using mock data:", err.message);
      initMockWorkspaces();
    }
    setLoading(false);
  };

  const loadWorkspaceDetails = async () => {
    if (!activeWorkspace) return;
    
    // Create/Ensure General Chat project and team exist in Supabase for Direct Messages
    try {
      const wsUuid = toUUID(activeWorkspace.id);
      const genProjUuid = toUUID(`general-proj-${activeWorkspace.id}`);
      const genTeamUuid = toUUID(`general-team-${activeWorkspace.id}`);
      
      // 1. Ensure project exists
      const { data: genProj } = await supabase
        .from('projects')
        .select('id')
        .eq('id', genProjUuid)
        .maybeSingle();
        
      if (!genProj) {
        await supabase.from('projects').insert({
          id: genProjUuid,
          workspace_id: wsUuid,
          name: 'General Chat',
          description: 'Default project for workspace-wide chats and direct messages'
        });
      }
      
      // 2. Ensure team exists
      const { data: genTeam } = await supabase
        .from('teams')
        .select('id')
        .eq('id', genTeamUuid)
        .maybeSingle();
        
      if (!genTeam) {
        await supabase.from('teams').insert({
          id: genTeamUuid,
          project_id: genProjUuid,
          name: 'General Chat Team'
        });
      }
    } catch (e) {
      console.warn("Failed to create general project/team for DMs:", e);
    }

    // 1. Fetch workspace members from Dyzo API (via proxy)
    try {
      const companyId = user?.companyId || 1;
      const response = await fetch(`/api/employees?companyId=${companyId}`);
      const resData = await response.json();
      if (resData.status === 1 && (resData.employees || resData.results || resData.data)) {
        const list = resData.employees || resData.results || resData.data;
        const mappedEmployees = list
          .filter(emp => emp.isActive !== false)
          .map(emp => ({
            id: (emp._id || emp.id).toString(),
            name: `${emp.first_name || 'User'} ${emp.last_name || ''}`.trim(),
            avatar_url: emp.profilePicture || null,
            role: emp.designation || 'Member',
            department: emp.department || 'Tech',
          }));
        setMembers(mappedEmployees);

        // Sync with Supabase profiles in the background using mapped UUIDs
        for (const emp of mappedEmployees) {
          try {
            await supabase.from('profiles').upsert({
              id: toUUID(emp.id),
              name: emp.name,
              avatar_url: emp.avatar_url,
              role: emp.role,
              department: emp.department
            });
          } catch (e) {
            console.warn("Profile sync warning:", e);
          }
        }
      } else {
        throw new Error("No employees found or status error");
      }
    } catch (err) {
      console.warn("Failed to fetch Dyzo employees list, using local fallback:", err.message);
      setMembers([
        { id: '1', name: 'Rahul Kumar', role: 'Software Engineer', department: 'Engineering' },
        { id: '2', name: 'Amit Sharma', role: 'Product Manager', department: 'Product' }
      ]);
    }

    // 2. Fetch Projects
    try {
      const companyId = user?.companyId || 1;
      const employeeId = user?.dyzoId || user?.id || '';
      const response = await fetch(`/api/projects?companyId=${companyId}&employeeId=${employeeId}`);
      const projData = await response.json();
      if (projData.status === 1 && (projData.projects || projData.results || projData.data)) {
        const list = projData.projects || projData.results || projData.data || [];
        const mappedProjects = list.map(p => ({
          id: (p._id || p.id).toString(),
          name: p.name,
          description: p.description || '',
          employees: p.assignee || p.employees || p.members || [],
        }));
        // Filter projects strictly assigned to the current user and not named 'General Chat'
        const myProjects = mappedProjects.filter(p => {
          return p.name !== 'General Chat' && p.employees.some(empId => empId.toString() === employeeId.toString());
        });
        setProjects(myProjects);

        // Sync projects to Supabase
        for (const proj of myProjects) {
          try {
            await supabase.from('projects').upsert({
              id: toUUID(proj.id),
              workspace_id: toUUID(activeWorkspace.id),
              name: proj.name,
              description: proj.description
            });
          } catch (e) {
            console.warn("Supabase project upsert error:", e);
          }
        }

        if (activeProject && activeProject.id !== 'all') {
          const freshProj = myProjects.find(p => p.id === activeProject.id);
          if (freshProj) {
            setActiveProject(freshProj);
          }
        } else if (!activeProject) {
          setActiveProject({ id: 'all', name: 'All Projects' });
        }
      } else {
        throw new Error("No projects found");
      }
    } catch (err) {
      console.warn("Failed to fetch Dyzo projects, using mock:", err.message);
      initMockProjects();
      if (!activeProject) {
        setActiveProject({ id: 'all', name: 'All Projects' });
      }
    }

    // 3. Fetch Leave requests
    try {
      const { data: leaveData } = await supabase
        .from('leave_requests')
        .select('*, profiles(*)');
      if (leaveData) setLeaves(leaveData);
    } catch (err) {
      console.warn("Could not load leaves from Supabase:", err.message);
    }

    // 4. Fetch Notifications
    try {
      const { data: notifData } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', toUUID(user.id))
        .order('created_at', { ascending: false });
      if (notifData) setNotifications(notifData);
    } catch (err) {
      console.warn("Could not load notifications from Supabase:", err.message);
    }
  };

  // Load channels and tasks for active project
  useEffect(() => {
    if (!activeProject || activeProject.id === 'all') {
      setTeams([]);
      setChannels([]);
      setTasks([]);
      initMockChannels();
      return;
    }
    loadProjectDetails();
  }, [activeProject]);

  const loadProjectDetails = async () => {
    try {
      const projUuid = toUUID(activeProject.id);
      
      let { data: teamData, error } = await supabase
        .from('teams')
        .select('*')
        .eq('project_id', projUuid);
      if (error) throw error;
      
      if (!teamData || teamData.length === 0) {
        // Auto-create core team for this project if not already present in Supabase
        const { data: newTeam, error: teamErr } = await supabase
          .from('teams')
          .insert({
            project_id: projUuid,
            name: `${activeProject.name} Core`
          })
          .select()
          .single();
        if (teamErr) throw teamErr;
        teamData = [newTeam];
      }

      // Add current user to team_members to ensure they have channel access
      const userUuid = toUUID(user.id);
      for (const t of teamData) {
        try {
          await supabase.from('team_members').upsert({
            team_id: toUUID(t.id),
            user_id: userUuid
          });
        } catch (memErr) {
          console.warn("Could not register user to team:", memErr);
        }
      }

      setTeams(teamData);
      setActiveTeam(teamData[0]);
    } catch (err) {
      initMockTeams();
    }
  };

  useEffect(() => {
    if (!activeTeam) {
      setChannels([]);
      setTasks([]);
      return;
    }
    loadTeamDetails();
  }, [activeTeam]);

  const loadTeamDetails = async () => {
    try {
      const teamUuid = toUUID(activeTeam.id);
      
      let { data: chanData, error: chanError } = await supabase
        .from('channels')
        .select('*')
        .eq('team_id', teamUuid);
      if (chanError) throw chanError;
      
      if (!chanData || chanData.length === 0) {
        // Auto-create general channel for this team if not already present in Supabase
        const { data: newChan, error: chanErr } = await supabase
          .from('channels')
          .insert({
            team_id: teamUuid,
            name: 'general',
            is_private: false
          })
          .select()
          .single();
        if (chanErr) throw chanErr;
        // Sync to conversations table for WhatsApp compatibility
        for (const c of chanData) {
          try {
            await supabase.from('conversations').upsert({
              id: toUUID(c.id),
              name: c.name,
              conversation_type: 'group'
            });
          } catch (e) {}
        }

        chanData = [newChan];
      } else {
        // Sync existing to conversations table
        for (const c of chanData) {
          try {
            await supabase.from('conversations').upsert({
              id: toUUID(c.id),
              name: c.name,
              conversation_type: 'group'
            });
          } catch (e) {}
        }
      }

      const isDM = activeChannel?.is_private || activeChannel?.name?.startsWith('dm_') || activeChannel?.name?.startsWith('dm-');
      const filteredChanData = chanData.filter(c => c.name !== 'general');
      if (isDM && activeChannel && !filteredChanData.some(c => c.id === activeChannel.id)) {
        setChannels([...filteredChanData, activeChannel]);
      } else {
        setChannels(filteredChanData);
      }
      const hasActiveInTeam = filteredChanData.some(c => c.id === activeChannel?.id);
      if (!activeChannel || (!isDM && !hasActiveInTeam) || activeChannel?.name === 'general') {
        if (user?.id) {
          getOrCreateDMChannel(user.id);
        }
      }

      const { data: taskData, error: taskError } = await supabase
        .from('tasks')
        .select('*')
        .eq('team_id', teamUuid);
      if (taskError) throw taskError;
      if (taskData) setTasks(taskData);
    } catch (err) {
      initMockChannels();
      setTasks([
        { id: 't1', title: 'Configure Supabase Database', description: 'Replace placeholder Supabase URL in your project configuration.', status: 'Todo', assignee_id: '1' },
        { id: 't2', title: 'Verify Dyzo API Integrations', description: 'Complete login testing and verify active employees lists.', status: 'In Progress', assignee_id: '2' }
      ]);
    }
  };

  const [directChatSummary, setDirectChatSummary] = useState({});

  // Load messages when channel changes
  useEffect(() => {
    if (!activeChannel) {
      setMessages([]);
      return;
    }
    loadMessages();
  }, [activeChannel]);

  const loadDirectChatSummary = async () => {
    if (!user) return;
    try {
      const userUuid = toUUID(user.id);
      
      // 1. Get all conversations the user is a member of
      const { data: userConvs, error: convErr } = await supabase
        .from('conversation_members')
        .select('conversation_id')
        .eq('user_id', userUuid);

      if (convErr) throw convErr;
      const convIds = userConvs?.map(c => c.conversation_id) || [];
      if (convIds.length === 0) {
        setDirectChatSummary({});
        return;
      }

      // 2. Fetch all members of these conversations to find the "other" user
      const { data: membersData, error: memErr } = await supabase
        .from('conversation_members')
        .select('conversation_id, user_id')
        .in('conversation_id', convIds);

      if (memErr) throw memErr;

      // Map conversation_id -> other user_id
      const convToOtherUser = {};
      membersData.forEach(m => {
        if (toUUID(m.user_id) !== userUuid) {
          convToOtherUser[m.conversation_id] = toUUID(m.user_id);
        }
      });

      // 3. Fetch messages from the unified messages table
      const { data: dbMsgs, error: msgErr } = await supabase
        .from('messages')
        .select('*')
        .in('conversation_id', convIds)
        .order('created_at', { ascending: false });

      if (msgErr) throw msgErr;

      const summary = {};
      dbMsgs.forEach((msg) => {
        const otherId = convToOtherUser[msg.conversation_id];
        if (!otherId) return;

        if (!summary[otherId]) {
          summary[otherId] = {
            lastMessage: msg,
            unreadCount: 0,
          };
        }
        if (toUUID(msg.sender_id) === otherId && !msg.metadata?.is_read) {
          summary[otherId].unreadCount += 1;
        }
      });
      setDirectChatSummary(summary);
    } catch (err) {
      console.warn("Could not load direct chat summary:", err.message);
    }
  };

  const loadMessages = async () => {
    if (!activeChannel) return;

    // Ensure active channel exists as a valid conversation in the conversations table
    try {
      await supabase.from('conversations').upsert({
        id: toUUID(activeChannel.id),
        name: activeChannel.name || 'General Channel',
        conversation_type: (activeChannel.is_private || activeChannel.name?.startsWith('dm')) ? 'direct' : 'group'
      });
    } catch (cErr) {
      console.warn("Silent conversation sync failed:", cErr.message);
    }

    try {
      const { data, error } = await supabase
        .from('messages')
        .select('*, profiles:profiles!sender_id(*)')
        .eq('conversation_id', toUUID(activeChannel.id))
        .order('created_at', { ascending: true });
      if (error) throw error;
      if (data) {
        setMessages(data.map(m => ({ ...m, user_id: m.sender_id })));
        // After loading messages for the active channel, mark them as read for this channel only.
        // This ensures read receipts are set only when the user actually views the conversation.
        // The marking is performed asynchronously; any errors are logged but do not block UI.
        const markMessagesAsRead = async () => {
          try {
            const userUuid = toUUID(user?.id);
            await supabase
              .from('messages')
              .update({ metadata: { is_read: true } })
              .eq('conversation_id', toUUID(activeChannel.id))
              .neq('sender_id', userUuid);
            // Refresh direct chat summary to update unread badges
            loadDirectChatSummary();
          } catch (e) {
            console.warn('Could not mark messages as read:', e);
          }
        };
        // Fire-and-forget; no await to avoid blocking UI rendering.
        markMessagesAsRead();
      }
    } catch (err) {
      console.warn("Could not load messages from Supabase, loading local cache:", err.message);
      
      let cachedMsgs = [];
      if (typeof window !== 'undefined') {
        const stored = localStorage.getItem(`tf_fallback_msgs_${activeChannel.id}`);
        if (stored) {
          try {
            cachedMsgs = JSON.parse(stored);
          } catch (e) {}
        }
      }

      const projName = activeProject ? activeProject.name : 'project';
      const welcomeMsg = { 
        id: 'welcome-msg', 
        content: `Welcome to the general channel of project: ${projName}! You are currently running in local fallback mode because Supabase database is not configured.`, 
        message_type: 'system', 
        created_at: new Date(Date.now() - 3600000).toISOString(), 
        profiles: { name: 'System' } 
      };

      setMessages([welcomeMsg, ...cachedMsgs]);
    }
  };

  // Setup Supabase Realtime subscriptions
  const setupRealtimeSubscriptions = () => {
    const currentUser = userRef.current;
    if (!activeWorkspace || !currentUser) return;

    console.log("Setting up Supabase Realtime subscriptions. Current User ID:", currentUser.id);

    const channel = supabase
      .channel('workspace_realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'messages' },
        (payload) => {
          const currentChan = activeChannelRef.current;
          console.log("Realtime event on table 'messages':", payload, "Active Channel:", currentChan?.id);
          if (payload.eventType === 'INSERT') {
            loadDirectChatSummary();
            if (currentChan && toUUID(payload.new.conversation_id) === toUUID(currentChan.id)) {
              const userProfile = membersRef.current.find(m => toUUID(m.id) === toUUID(payload.new.sender_id)) || {};
              setMessages(prev => {
                if (prev.some(msg => msg.id === payload.new.id)) return prev;
                return [...prev, { ...payload.new, user_id: payload.new.sender_id, profiles: userProfile }];
              });
            }
          } else if (payload.eventType === 'UPDATE') {
            loadDirectChatSummary();
            setMessages(prev =>
              prev.map(msg => (msg.id === payload.new.id ? { ...msg, ...payload.new } : msg))
            );
          } else if (payload.eventType === 'DELETE') {
            loadDirectChatSummary();
            setMessages(prev => prev.filter(msg => msg.id !== payload.old.id));
          }
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'tasks' },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setTasks(prev => {
              if (prev.some(t => t.id === payload.new.id)) return prev;
              return [...prev, payload.new];
            });
          } else if (payload.eventType === 'UPDATE') {
            setTasks(prev =>
              prev.map(t => (t.id === payload.new.id ? { ...t, ...payload.new } : t))
            );
          } else if (payload.eventType === 'DELETE') {
            setTasks(prev => prev.filter(t => t.id !== payload.old.id));
          }
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'leave_requests' },
        (payload) => {
          if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
            loadWorkspaceDetails();
          }
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'notifications' },
        (payload) => {
          const freshUser = userRef.current;
          if (payload.eventType === 'INSERT' && freshUser && toUUID(payload.new.user_id) === toUUID(freshUser.id)) {
            setNotifications(prev => [payload.new, ...prev]);
          }
        }
      )
      .subscribe((status) => {
        console.log("Supabase Realtime subscription status:", status);
      });

    return () => {
      console.log("Cleaning up Realtime channel.");
      supabase.removeChannel(channel);
    };
  };

  useEffect(() => {
    if (activeProject) {
      localStorage.setItem('tf_active_project', JSON.stringify(activeProject));
    }
  }, [activeProject]);

  useEffect(() => {
    if (activeChannel) {
      localStorage.setItem('tf_active_channel', JSON.stringify(activeChannel));
    }
  }, [activeChannel]);

  const createWorkspace = async (name, slug) => {
    const userUuid = toUUID(user.id);
    const wsId = toUUID(`ws-${slug}-${Date.now()}`);

    const { data: ws, error } = await supabase
      .from('workspaces')
      .insert({ id: wsId, name, slug, owner_id: userUuid })
      .select()
      .single();
    if (error) throw error;

    await supabase.from('workspace_members').insert({
      workspace_id: ws.id,
      user_id: userUuid,
      role: 'owner',
    });

    setWorkspaces(prev => [...prev, ws]);
    setActiveWorkspace(ws);
    return ws;
  };

  const createProject = async (name, description) => {
    if (!activeWorkspace) return;
    const { data, error } = await supabase
      .from('projects')
      .insert({ workspace_id: toUUID(activeWorkspace.id), name, description })
      .select()
      .single();
    if (error) throw error;
    setProjects(prev => [...prev, data]);
    setActiveProject(data);
    return data;
  };

  const getOrCreateDMChannel = async (recipientId) => {
    if (!user) return null;
    
    const userUuid = toUUID(user.id);
    const recipientUuid = toUUID(recipientId);
    const ids = [userUuid, recipientUuid].sort();
    const dmName = `dm_${ids[0]}_${ids[1]}`;

    // Generate deterministic UUID to avoid mismatches
    const clean1 = ids[0].replace(/[^0-9a-f]/gi, '').slice(0, 15);
    const clean2 = ids[1].replace(/[^0-9a-f]/gi, '').slice(0, 15);
    const hex = `d0${clean1}${clean2}`.padEnd(32, '0').slice(0, 32);
    const dmUuid = `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20, 32)}`;

    const existing = channels.find(c => c.name === dmName);
    if (existing) {
      setActiveChannel(existing);
      return existing;
    }

    const genTeamUuid = toUUID(`general-team-${activeWorkspace.id}`);
    const teamIdToUse = activeTeam?.id ? toUUID(activeTeam.id) : genTeamUuid;

    try {
      // 1. Ensure conversation exists in conversations table
      await supabase.from('conversations').upsert({
        id: dmUuid,
        name: dmName,
        conversation_type: 'direct'
      });

      // 2. Ensure both members are registered in conversation_members
      await supabase.from('conversation_members').upsert([
        { conversation_id: dmUuid, user_id: userUuid },
        { conversation_id: dmUuid, user_id: recipientUuid }
      ]);

      // 3. Get or insert channel with the deterministic UUID
      const { data: dbChan, error } = await supabase
        .from('channels')
        .select('*')
        .eq('id', dmUuid)
        .maybeSingle();

      if (dbChan) {
        setChannels(prev => {
          if (prev.some(c => c.id === dbChan.id)) return prev;
          return [...prev, dbChan];
        });
        setActiveChannel(dbChan);
        return dbChan;
      }

      const { data: newChan, error: insertError } = await supabase
        .from('channels')
        .insert({
          id: dmUuid,
          team_id: teamIdToUse,
          name: dmName,
          is_private: true
        })
        .select()
        .single();

      if (insertError) throw insertError;

      setChannels(prev => [...prev, newChan]);
      setActiveChannel(newChan);
      return newChan;
    } catch (err) {
      console.warn("Failed to get/create DM channel from Supabase, using mock fallback:", err.message);
      const mockDmChan = {
        id: dmUuid,
        team_id: teamIdToUse,
        name: dmName,
        is_private: true
      };
      setChannels(prev => [...prev, mockDmChan]);
      setActiveChannel(mockDmChan);
      return mockDmChan;
    }
  };

  // Polling loop for database updates (multi-browser sync)
  useEffect(() => {
    loadDirectChatSummary();
    const interval = setInterval(() => {
      loadDirectChatSummary();
      if (activeChannel) {
        loadMessages();
      }
    }, 3000); // 3 seconds is more stable

    return () => clearInterval(interval);
  }, [activeChannel?.id, user?.id]);

  return (
    <WorkspaceContext.Provider
      value={{
        workspaces,
        activeWorkspace,
        setActiveWorkspace,
        projects,
        activeProject,
        setActiveProject,
        teams,
        activeTeam,
        setActiveTeam,
        channels,
        activeChannel,
        setActiveChannel,
        messages,
        setMessages,
        tasks,
        setTasks,
        leaves,
        setLeaves,
        notifications,
        setNotifications,
        members,
        loading,
        createWorkspace,
        createProject,
        getOrCreateDMChannel,
        loadWorkspaceDetails,
        loadProjectDetails,
        loadTeamDetails,
        loadMessages,
        directChatSummary,
        conversations,
        setConversations,
        activeConversation,
        setActiveConversation,
        blockedUsers,
        setBlockedUsers,
        starredMessages,
        setStarredMessages,
        presenceList,
        setPresenceList,
        typingUsers,
        setTypingUsers,
        archivedConversations,
        setArchivedConversations,
      }}
    >
      {children}
    </WorkspaceContext.Provider>
  );
}

export const useWorkspace = () => useContext(WorkspaceContext);
