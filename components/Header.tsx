import React, { useState } from 'react';
import { User, AppNotification } from '../types';

interface HeaderProps {
  user: User;
  onLogout: () => void;
  onOpenSettings: () => void;
  notifications?: AppNotification[];
  onMarkNotificationAsRead?: (id: string) => void;
}

const Header: React.FC<HeaderProps> = ({ user, onLogout, onOpenSettings, notifications = [], onMarkNotificationAsRead }) => {
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <div className="sticky top-0 z-40">
      {/* Decorative top bar inspired by the image */}
      <div className="h-1 bg-purple-600"></div>

      {/* Main navigation bar */}
      <nav className="bg-gray-950 px-4 sm:px-6 lg:px-8 shadow-lg">
        <div className="container mx-auto flex items-center justify-between h-16">
          {/* Brand/Logo on the left */}
          <div className="flex items-center gap-3">
            <span className="text-2xl" role="img" aria-label="bug icon">🐞</span>
            <span className="text-xl font-bold text-white tracking-tight">EduPlus SmartCampus ✨</span>
          </div>
          
          {/* Actions on the right */}
          <div className="flex items-center space-x-2 md:space-x-4">
            <span className="hidden sm:inline text-gray-300">
              Welcome, <span className="font-semibold text-white">{user.name}</span>
            </span>

            {/* Notification Bell */}
            <div className="relative">
              <button
                onClick={() => setIsNotifOpen(!isNotifOpen)}
                className="p-2 text-gray-300 rounded-full hover:bg-gray-700/50 hover:text-white transition-colors relative"
                aria-label="Notifications"
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 bg-red-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full border-2 border-gray-950">
                    {unreadCount}
                  </span>
                )}
              </button>

              {isNotifOpen && (
                <div className="absolute right-0 mt-3 w-80 bg-gray-900 border border-gray-700 rounded-2xl shadow-2xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-2">
                  <div className="p-4 border-b border-gray-700 bg-gray-800/50 flex justify-between items-center">
                    <h4 className="font-bold text-white">Notifications</h4>
                    <span className="text-xs text-indigo-400 font-bold">{unreadCount} Unread</span>
                  </div>
                  <div className="max-h-96 overflow-y-auto">
                    {notifications.length > 0 ? notifications.map(n => (
                      <div 
                        key={n.id} 
                        className={`p-4 border-b border-gray-800 hover:bg-gray-800 transition-colors cursor-pointer ${!n.isRead ? 'bg-indigo-600/5' : ''}`}
                        onClick={() => {
                          if (onMarkNotificationAsRead) onMarkNotificationAsRead(n.id);
                        }}
                      >
                        <p className={`text-sm ${!n.isRead ? 'text-white font-medium' : 'text-gray-400'}`}>{n.message}</p>
                        <p className="text-[10px] text-gray-500 mt-2 font-mono uppercase">{new Date(n.createdAt).toLocaleString()}</p>
                      </div>
                    )) : (
                      <div className="p-8 text-center text-gray-500 italic text-sm">No notifications yet.</div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Settings button */}
            <button
              onClick={onOpenSettings}
              className="p-2 text-gray-300 rounded-full hover:bg-gray-700/50 hover:text-white transition-colors"
              aria-label="Account Settings"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
            </button>
            {/* CTA-style Logout Button */}
            <button
              onClick={onLogout}
              className="px-5 py-2 text-sm font-medium text-white bg-purple-600 rounded-lg hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 focus:ring-offset-gray-950 transition-all duration-200 ease-in-out transform hover:scale-105"
            >
              Logout
            </button>
          </div>
        </div>
      </nav>
    </div>
  );
};

export default Header;