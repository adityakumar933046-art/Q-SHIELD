import React from 'react';
import { Outlet } from 'react-router-dom';
import { SuperAdminSidebar } from './SuperAdminSidebar';
import { SuperAdminNavbar } from './SuperAdminNavbar';
import { User } from '../../types';

interface SuperAdminLayoutProps {
  currentUser: User | null;
  onLogout: () => void;
}

export const SuperAdminLayout: React.FC<SuperAdminLayoutProps> = ({ currentUser, onLogout }) => {
  return (
    <div className="min-h-screen bg-[#070C16] text-slate-100 flex font-sans">
      <SuperAdminSidebar currentUser={currentUser} onLogout={onLogout} />
      <div className="flex-1 flex flex-col min-h-screen overflow-hidden">
        <SuperAdminNavbar currentUser={currentUser} />
        <main className="flex-1 p-6 overflow-y-auto bg-gradient-to-b from-[#070C16] via-[#0B1220] to-[#070C16]">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
