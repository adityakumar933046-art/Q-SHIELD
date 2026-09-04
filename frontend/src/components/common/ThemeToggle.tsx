import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

export const ThemeToggle: React.FC = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      type="button"
      title={theme === 'dark' ? 'Switch to Professional Light Mode' : 'Switch to Dark Mode'}
      className="p-2 rounded-xl bg-slate-800/20 dark:bg-[#131E33] border border-slate-300 dark:border-[#1F2E4D] text-slate-700 dark:text-[#00C2FF] hover:bg-slate-200 dark:hover:bg-[#1A263D] transition duration-200 shadow-sm flex items-center space-x-1.5 font-sans"
    >
      {theme === 'dark' ? (
        <>
          <Sun className="w-4 h-4 text-amber-400 animate-spin-slow" />
          <span className="text-xs font-medium text-slate-300">Light</span>
        </>
      ) : (
        <>
          <Moon className="w-4 h-4 text-slate-700" />
          <span className="text-xs font-semibold text-slate-700">Dark</span>
        </>
      )}
    </button>
  );
};
