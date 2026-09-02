import React from 'react';
import { Outlet } from 'react-router-dom';
import { OrgAdminSidebar } from './OrgAdminSidebar';
import { OrgAdminNavbar } from './OrgAdminNavbar';
import { User } from '../../types';

interface OrgAdminLayoutProps {
  currentUser: User | null;
  onLogout: () => void;
}

export const OrgAdminLayout: React.FC<OrgAdminLayoutProps> = ({ currentUser, onLogout }) => {
  return (
    <div className="min-h-screen bg-[#070C16] text-slate-100 flex font-sans">
      <OrgAdminSidebar currentUser={currentUser} onLogout={onLogout} />
      <div className="flex-1 flex flex-col min-h-screen overflow-hidden">
        <OrgAdminNavbar currentUser={currentUser} />
        <main className="flex-1 p-6 overflow-y-auto bg-gradient-to-b from-[#070C16] via-[#0B1220] to-[#070C16]">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
