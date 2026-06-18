'use client';

import React, { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { Compass } from 'lucide-react';

export default function EntryPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (user) {
        router.push('/workspace');
      } else {
        router.push('/login');
      }
    }
  }, [user, loading, router]);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center space-y-4">
      <Compass className="animate-spin text-indigo-600" size={32} />
      <span className="text-sm font-semibold text-slate-500">Redirecting to TeamFlow AI...</span>
    </div>
  );
}
