import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BrandPanel } from '../components/auth/BrandPanel';
import { LoginForm } from '../components/auth/LoginForm';
import { User } from '../types';

interface LoginPageProps {
  onLoginSuccess: (user: User) => void;
  currentUser?: User | null;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess, currentUser }) => {
  const navigate = useNavigate();

  // Redirect role mapping function
  const redirectUserByRole = (user: User) => {
    const role = (user.role || '').toUpperCase();
    if (role === 'SUPER_ADMIN') {
      navigate('/super-admin/dashboard', { replace: true });
    } else if (role === 'ORGANIZATION_ADMIN') {
      navigate('/org-admin/dashboard', { replace: true });
    } else if (role === 'SIGNER') {
      navigate('/signer/dashboard', { replace: true });
    } else if (role === 'VERIFIER') {
      navigate('/verifier/dashboard', { replace: true });
    } else if (role === 'SECURITY_ANALYST') {
      navigate('/security-analyst/dashboard', { replace: true });
    } else if (role === 'ADMIN') {
      navigate('/org-admin/dashboard', { replace: true });
    } else {
      navigate('/', { replace: true });
    }
  };

  // If user is already authenticated, redirect them automatically away from login
  useEffect(() => {
    if (currentUser) {
      redirectUserByRole(currentUser);
    }
  }, [currentUser]);

  return (
    <div className="min-h-screen bg-[#070C16] text-slate-100 font-sans flex flex-col lg:flex-row overflow-hidden relative">
      {/* Left Section: Brand Panel (Visible on Desktop LG+, Stacked on Mobile) */}
      <div className="hidden lg:block lg:w-1/2 h-screen sticky top-0">
        <BrandPanel />
      </div>

      {/* Right Section: Centered Login Form Area */}
      <div className="w-full lg:w-1/2 min-h-screen p-6 md:p-12 flex flex-col justify-between items-center relative z-10 overflow-y-auto">
        {/* Mobile Header Logo Banner */}
        <div className="w-full max-w-md lg:hidden mb-6 pt-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-xl bg-[#00C2FF]/10 border border-[#00C2FF]/30 flex items-center justify-center text-[#00C2FF] font-black font-mono">
              Q
            </div>
            <span className="text-base font-black text-white tracking-wider">Q-SHIELD</span>
          </div>
          <span className="text-[10px] font-mono text-[#10B981] px-2 py-0.5 bg-[#10B981]/10 rounded border border-[#10B981]/30">
            System Online
          </span>
        </div>

        {/* Centered Login Card Component */}
        <div className="w-full my-auto flex justify-center">
          <LoginForm
            onLoginSuccess={onLoginSuccess}
            onRedirectByRole={redirectUserByRole}
          />
        </div>

        {/* Mobile / Footer Copyright */}
        <div className="w-full max-w-md mt-6 pb-4 text-center text-[11px] font-mono text-slate-500">
          © {new Date().getFullYear()} Q-SHIELD Security Systems. All rights reserved.
        </div>
      </div>
    </div>
  );
};
