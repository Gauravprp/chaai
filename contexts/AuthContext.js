'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

const AuthContext = createContext({});
const DYZO_API_KEY = 'dyzo_dev_8wczpjcvwyjztc8omzzhhfp176p950mwovvkp80v';
const DYZO_BASE_URL = 'https://api.dyzo.ai';

const toUUID = (str) => {
  if (!str) return '00000000-0000-0000-0000-000000000000';
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (uuidRegex.test(str)) return str;
  const clean = str.toString().replace(/[^0-9a-f]/gi, '').toLowerCase();
  const padded = clean.padEnd(32, '0').slice(0, 32);
  return `${padded.slice(0, 8)}-${padded.slice(8, 12)}-${padded.slice(12, 16)}-${padded.slice(16, 20)}-${padded.slice(20, 32)}`;
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Session state fetch using local storage
    const getSession = async () => {
      try {
        const storedUser = localStorage.getItem('dyzo_user');
        if (storedUser) {
          const u = JSON.parse(storedUser);
          
          // Ensure user ID is converted to UUID format
          const userUuid = toUUID(u.id || u.dyzoId);
          u.id = userUuid;

          // Sign in client-side mock Supabase instance
          try {
            const { error } = await supabase.auth.signInWithPassword({
              email: u.email,
              password: `DyzoAuthSync_${userUuid}`
            });
            if (error) {
              await supabase.auth.signUp({
                email: u.email,
                password: `DyzoAuthSync_${userUuid}`,
                options: { data: { name: u.name } }
              });
            }
          } catch (authErr) {
            console.warn("Silent Supabase sign in failed:", authErr);
          }

          setUser(u);
          setProfile({
            id: u.id,
            name: u.name,
            role: u.role,
            department: u.department || 'Tech',
            avatar_url: u.avatar_url || null,
          });
        }
      } catch (err) {
        console.error("Failed to parse stored session:", err);
      }
      setLoading(false);
    };

    getSession();
  }, []);

  const login = async (email, password, companyId = null) => {
    const payload = { email, password };
    if (companyId) {
      payload.company_id = companyId;
    }
    const response = await fetch(`${DYZO_BASE_URL}/login/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': DYZO_API_KEY,
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();
    if (data.status !== 1) {
      throw new Error(data.message || 'Login failed');
    }

    const employee = data.employee || data.user || {};
    const rawId = employee._id || employee.id || 'unknown';
    const resolvedCompanyId = companyId || employee.company_id || employee.companyId || (data.company && (data.company._id || data.company.id || data.company.company_id)) || 1;
    
    const userUuid = toUUID(rawId);
    const sessionUser = {
      id: userUuid,
      dyzoId: rawId.toString(),
      email: employee.email || email,
      name: `${employee.first_name || 'User'} ${employee.last_name || ''}`.trim(),
      role: employee.designation || 'Member',
      department: 'Tech',
      companyId: resolvedCompanyId,
    };

    // Sign in client-side mock Supabase instance
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: sessionUser.email,
        password: `DyzoAuthSync_${userUuid}`
      });
      if (error) {
        await supabase.auth.signUp({
          email: sessionUser.email,
          password: `DyzoAuthSync_${userUuid}`,
          options: { data: { name: sessionUser.name } }
        });
      }
    } catch (authErr) {
      console.warn("Failed to sync auth with Supabase:", authErr);
    }

    setUser(sessionUser);

    const localProfile = {
      id: sessionUser.id,
      name: sessionUser.name,
      role: sessionUser.role,
      department: sessionUser.department,
      avatar_url: null,
    };
    setProfile(localProfile);

    localStorage.setItem('dyzo_user', JSON.stringify(sessionUser));
    return data;
  };

  const loginWithGoogle = async (googleToken) => {
    try {
      const response = await fetch(`${DYZO_BASE_URL}/api/google-login/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': DYZO_API_KEY,
        },
        body: JSON.stringify({ token: googleToken || 'google_mock_token', email: 'google.user@company.com' }),
      });

      const data = await response.json();
      let employee = data.employee || data.user || {};
      
      if (data.status !== 1) {
        throw new Error(data.message || 'OAuth failed');
      }

      const companyId = employee.companyId || (data.company && (data.company._id || data.company.id)) || 1;
      const sessionUser = {
        id: (employee._id || employee.id).toString(),
        email: employee.email,
        name: `${employee.first_name || 'Google'} ${employee.last_name || 'User'}`.trim(),
        role: employee.designation || 'Member',
        department: 'Product',
        companyId: companyId,
      };

      setUser(sessionUser);
      const localProfile = {
        id: sessionUser.id,
        name: sessionUser.name,
        role: sessionUser.role,
        department: sessionUser.department,
        avatar_url: null,
      };
      setProfile(localProfile);

      await supabase.from('profiles').upsert(localProfile);
      localStorage.setItem('dyzo_user', JSON.stringify(sessionUser));
      return data;
    } catch (err) {
      // Fallback local simulation for Google login in development environments
      console.warn("Dyzo Google login error, using local simulation:", err.message);
      const mockGoogleUser = {
        id: 'dyzo-google-101',
        email: 'google.user@company.com',
        name: 'Google User',
        role: 'Designer',
        department: 'UI/UX',
      };
      setUser(mockGoogleUser);
      const localProfile = {
        id: mockGoogleUser.id,
        name: mockGoogleUser.name,
        role: mockGoogleUser.role,
        department: mockGoogleUser.department,
        avatar_url: null,
      };
      setProfile(localProfile);
      await supabase.from('profiles').upsert(localProfile);
      localStorage.setItem('dyzo_user', JSON.stringify(mockGoogleUser));
      return { status: 1, user: mockGoogleUser };
    }
  };

  const signup = async (email, password, name, role, department) => {
    // Since Auth flows via Dyzo APIs, we mock signup to login or local simulation
    const mockUser = {
      id: `dyzo-mock-${Date.now()}`,
      email,
      name,
      role: role || 'Member',
      department: department || 'Tech',
    };

    setUser(mockUser);
    const localProfile = {
      id: mockUser.id,
      name: mockUser.name,
      role: mockUser.role,
      department: mockUser.department,
      avatar_url: null,
    };
    setProfile(localProfile);

    try {
      await supabase.from('profiles').upsert(localProfile);
    } catch (err) {
      console.warn("Could not sync mock signup to supabase:", err);
    }

    localStorage.setItem('dyzo_user', JSON.stringify(mockUser));
    return { status: 1, user: mockUser };
  };

  const logout = async () => {
    setUser(null);
    setProfile(null);
    localStorage.removeItem('dyzo_user');
  };

  const updateProfile = async (updates) => {
    if (!user) return;
    const updatedUser = { ...user, ...updates };
    setUser(updatedUser);
    setProfile(prev => ({ ...prev, ...updates }));
    localStorage.setItem('dyzo_user', JSON.stringify(updatedUser));
    
    try {
      await supabase.from('profiles').upsert({
        id: user.id,
        name: updatedUser.name,
        role: updatedUser.role,
        department: updatedUser.department || 'Tech',
        avatar_url: updatedUser.avatar_url || null,
      });
    } catch (err) {
      console.warn("Could not update profile on supabase:", err);
    }
  };

  return (
    <AuthContext.Provider value={{ user, profile, loading, login, loginWithGoogle, signup, logout, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
