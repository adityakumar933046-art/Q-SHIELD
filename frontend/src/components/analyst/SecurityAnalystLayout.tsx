import React from 'react';
import { Outlet } from 'react-router-dom';
import { SecurityAnalystSidebar } from './SecurityAnalystSidebar';
import { SecurityAnalystNavbar } from './SecurityAnalystNavbar';
import { User } from '../../types';

interface SecurityAnalystLayoutProps {
  currentUser: User | null;
  onLogout: () => void;
}

export const SecurityAnalystLayout: React.FC<SecurityAnalystLayoutProps> = ({ currentUser, onLogout }) => {
  return (
    <div className="min-h-screen bg-[#070C16] text-slate-100 flex font-sans">
      <SecurityAnalystSidebar currentUser={currentUser} onLogout={onLogout} />
      <div className="flex-1 flex flex-col min-h-screen overflow-hidden">
        <SecurityAnalystNavbar currentUser={currentUser} />
        <main className="flex-1 p-6 overflow-y-auto bg-gradient-to-b from-[#070C16] via-[#0B1220] to-[#070C16]">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
