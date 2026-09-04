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
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#0B0F19] text-slate-900 dark:text-slate-100 flex font-sans transition-colors duration-200">
      <OrgAdminSidebar currentUser={currentUser} onLogout={onLogout} />
      <div className="flex-1 flex flex-col min-h-screen overflow-hidden">
        <OrgAdminNavbar currentUser={currentUser} />
        <main className="flex-1 p-6 lg:p-8 overflow-y-auto bg-[#F8FAFC] dark:bg-[#0B0F19]">
          <div className="max-w-7xl mx-auto w-full">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};
