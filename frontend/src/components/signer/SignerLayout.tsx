import React from 'react';
import { Outlet } from 'react-router-dom';
import { SignerSidebar } from './SignerSidebar';
import { SignerNavbar } from './SignerNavbar';
import { User } from '../../types';

interface SignerLayoutProps {
  currentUser: User | null;
  onLogout: () => void;
}

export const SignerLayout: React.FC<SignerLayoutProps> = ({ currentUser, onLogout }) => {
  return (
    <div className="min-h-screen bg-[#070C16] text-slate-100 flex font-sans">
      <SignerSidebar currentUser={currentUser} onLogout={onLogout} />
      <div className="flex-1 flex flex-col min-h-screen overflow-hidden">
        <SignerNavbar currentUser={currentUser} />
        <main className="flex-1 p-6 overflow-y-auto bg-gradient-to-b from-[#070C16] via-[#0B1220] to-[#070C16]">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
