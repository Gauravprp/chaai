import React from 'react';
import { Home, MessageSquare, Search, Bell, User } from 'lucide-react';

export default function BottomNav({ currentView, setCurrentView, unreadCount, toggleProjectsDrawer, setShowNotifications }) {
  const tabs = [
    { id: 'projects', icon: Home, label: 'Projects', action: toggleProjectsDrawer },
    { id: 'chat', icon: MessageSquare, label: 'Chats', action: () => setCurrentView('chat') },
    { id: 'search', icon: Search, label: 'Search', action: () => setCurrentView('search') },
    { id: 'notifications', icon: Bell, label: 'Alerts', action: setShowNotifications, badge: unreadCount },
    { id: 'profile', icon: User, label: 'Profile', action: () => setCurrentView('profile') },
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 glass-panel border-t border-slate-200 z-50 pb-safe">
      <div className="flex justify-around items-center h-16 px-2">
        {tabs.map((tab) => {
          const isActive = currentView === tab.id;
          const Icon = tab.icon;
          
          return (
            <button
              key={tab.id}
              onClick={tab.action}
              className={`relative flex flex-col items-center justify-center w-full h-full space-y-1 ${
                isActive ? 'text-primary-600' : 'text-slate-500'
              }`}
            >
              <div className="relative">
                <Icon size={24} className={`transition-colors duration-200 ${isActive ? 'stroke-[2.5px]' : 'stroke-2'}`} />
                {tab.badge > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-rose-500 text-[8px] font-bold text-white border border-white">
                    {tab.badge > 9 ? '9+' : tab.badge}
                  </span>
                )}
              </div>
              <span className={`text-[10px] font-medium ${isActive ? 'text-primary-600' : 'text-slate-500'}`}>
                {tab.label}
              </span>
              
              {isActive && (
                <div
                  className="absolute -top-[1px] w-8 h-[3px] bg-primary-600 rounded-b-full transition-all duration-300"
                />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
