import React from 'react';
import { Search, Bell, Sun, Moon } from 'lucide-react';
import { User as UserType } from '../../types';
import { useTheme } from '../../context/ThemeContext';

interface OrgAdminNavbarProps {
  currentUser: UserType | null;
}

export const OrgAdminNavbar: React.FC<OrgAdminNavbarProps> = ({ currentUser }) => {
  const { theme, toggleTheme } = useTheme();
  const initial = (currentUser?.username?.[0] || 'A').toUpperCase();

  return (
    <header className="h-18 bg-white dark:bg-[#0E1526] border-b border-slate-200/80 dark:border-slate-800/80 px-6 lg:px-8 flex items-center justify-between sticky top-0 z-20 transition-colors duration-200 font-sans">
      {/* Search Bar */}
      <div className="flex-1 max-w-lg">
        <div className="relative">
          <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Search..."
            className="w-full bg-slate-100/90 dark:bg-slate-800/90 border border-transparent dark:border-slate-700/60 rounded-xl pl-11 pr-4 py-2.5 text-sm text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:bg-white dark:focus:bg-slate-800 focus:border-[#6366F1] dark:focus:border-[#6366F1] transition shadow-inner"
          />
        </div>
      </div>

      {/* Right Actions: Dark Mode Toggle, Notifications, User Avatar */}
      <div className="flex items-center space-x-3 sm:space-x-4 ml-4">
        {/* Dark/Light Mode Switcher */}
        <button
          onClick={toggleTheme}
          title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          className="p-2.5 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition flex items-center justify-center"
        >
          {theme === 'dark' ? (
            <Sun className="w-5 h-5 text-amber-400 hover:rotate-45 transition-transform" />
          ) : (
            <Moon className="w-5 h-5 text-slate-600 hover:-rotate-12 transition-transform" />
          )}
        </button>

        {/* Notification Bell */}
        <button
          title="Notifications"
          className="p-2.5 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition relative flex items-center justify-center"
        >
          <Bell className="w-5 h-5" />
          <span className="w-2 h-2 bg-[#6366F1] rounded-full absolute top-2.5 right-2.5 ring-2 ring-white dark:ring-[#0E1526]" />
        </button>

        {/* User Identity Avatar */}
        <div
          title={`Signed in as ${currentUser?.username || 'admin'}`}
          className="w-9 h-9 rounded-full bg-[#6366F1] text-white flex items-center justify-center font-bold text-sm shadow-sm ring-2 ring-indigo-50 dark:ring-indigo-950/60 cursor-pointer hover:opacity-90 transition"
        >
          {initial}
        </div>
      </div>
    </header>
  );
};
