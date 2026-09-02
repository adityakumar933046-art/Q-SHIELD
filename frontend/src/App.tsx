import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { LoginModal } from './components/LoginModal';
import { RoleGuard } from './components/RoleGuard';
import { DashboardPage } from './pages/DashboardPage';
import { UserManagementPage } from './pages/UserManagementPage';
import { OrganizationsPage } from './pages/OrganizationsPage';
import { SecurityRulesPage } from './pages/SecurityRulesPage';
import { QdsStudioPage } from './pages/QdsStudioPage';
import { AttackSimulatorPage } from './pages/AttackSimulatorPage';
import { ThreatsPage } from './pages/ThreatsPage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { AuditPage } from './pages/AuditPage';
import { UnauthorizedPage } from './pages/UnauthorizedPage';
import { SignerDashboardPage } from './pages/SignerDashboardPage';
import { MyQdsPage } from './pages/MyQdsPage';
import { SigningRequestsPage } from './pages/SigningRequestsPage';
import { SignerProfilePage } from './pages/SignerProfilePage';
import { SignerNotificationsPage } from './pages/SignerNotificationsPage';
import { SignerSettingsPage } from './pages/SignerSettingsPage';

// Verifier workspace pages
import { VerifierDashboardPage } from './pages/VerifierDashboardPage';
import { VerifyQdsPage } from './pages/VerifyQdsPage';
import { MyVerificationsPage } from './pages/MyVerificationsPage';
import { VerificationRequestsPage } from './pages/VerificationRequestsPage';
import { VerificationHistoryPage } from './pages/VerificationHistoryPage';
import { VerifierAnalyticsPage } from './pages/VerifierAnalyticsPage';
import { VerifierAuditPage } from './pages/VerifierAuditPage';
import { VerifierNotificationsPage } from './pages/VerifierNotificationsPage';
import { VerifierSettingsPage } from './pages/VerifierSettingsPage';

// Verifier layout components
import { VerifierSidebar } from './components/VerifierSidebar';
import { VerifierNavbar } from './components/VerifierNavbar';

import { api } from './services/api';
import { User } from './types';
import { ForgotPasswordPage } from './pages/ForgotPasswordPage';
import { ResetPasswordPage } from './pages/ResetPasswordPage';
import { SecuritySettingsPage } from './pages/SecuritySettingsPage';
import { LoginPage } from './pages/LoginPage';
import { LandingPage } from './pages/LandingPage';

// Role-Based Default Landing Component
const DefaultLandingRedirect: React.FC<{ currentUser: User | null }> = ({ currentUser }) => {
  if (!currentUser) return <Navigate to="/login" replace />;
  
  switch (currentUser.role) {
    case 'SIGNER':
      return <Navigate to="/signer/dashboard" replace />;
    case 'VERIFIER':
      return <Navigate to="/verifier/dashboard" replace />;
    case 'SECURITY_ANALYST':
      return <Navigate to="/analyst/threats" replace />;
    case 'ORGANIZATION_ADMIN':
      return <Navigate to="/admin/dashboard" replace />;
    case 'SUPER_ADMIN':
    case 'ADMIN':
    default:
      return <Navigate to="/admin/dashboard" replace />;
  }
};

import { LeftIconRail } from './components/LeftIconRail';

// Standard dark-themed layout for Admin, Signer, and Analyst
const StandardLayout: React.FC<{
  currentUser: User | null;
  onLogout: () => void;
  onLoginClick: () => void;
}> = ({ currentUser, onLogout, onLoginClick }) => {
  return (
    <div className="min-h-screen bg-[#070B14] text-slate-100 flex flex-col font-sans relative selection:bg-cyan-400 selection:text-black overflow-x-hidden">
      {/* Ambient background cosmic nebula glow accents */}
      <div className="fixed top-0 right-1/4 w-[500px] h-[500px] bg-cyan-500/10 rounded-full blur-[120px] pointer-events-none -z-0" />
      <div className="fixed bottom-10 left-1/3 w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-[140px] pointer-events-none -z-0" />
      <div className="fixed top-1/3 left-10 w-96 h-96 bg-indigo-500/5 rounded-full blur-[100px] pointer-events-none -z-0" />
      
      <Navbar
        currentUser={currentUser}
        onLoginClick={onLoginClick}
      />
      <div className="flex flex-1 relative z-10">
        <div className="hidden lg:flex shrink-0">
          <LeftIconRail />
        </div>
        <Sidebar
          currentUser={currentUser}
          onLogout={onLogout}
        />
        <main className="flex-1 p-4 md:p-6 lg:p-7 overflow-y-auto max-w-[1750px] w-full mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

// Verifier layout updated to match the cohesive dark cyber-glassmorphism theme
const VerifierLayout: React.FC<{
  currentUser: User | null;
  onLogout: () => void;
}> = ({ currentUser, onLogout }) => {
  return (
    <div className="min-h-screen bg-[#070B14] text-slate-100 flex flex-col font-sans relative selection:bg-cyan-400 selection:text-black overflow-x-hidden">
      {/* Ambient background glow accents */}
      <div className="fixed top-0 right-1/4 w-[500px] h-[500px] bg-cyan-500/10 rounded-full blur-[120px] pointer-events-none -z-0" />
      <div className="fixed bottom-10 left-1/3 w-[600px] h-[600px] bg-emerald-500/10 rounded-full blur-[140px] pointer-events-none -z-0" />
      
      <VerifierNavbar currentUser={currentUser} />
      <div className="flex flex-1 relative z-10">
        <div className="hidden lg:flex shrink-0">
          <LeftIconRail />
        </div>
        <VerifierSidebar currentUser={currentUser} onLogout={onLogout} />
        <main className="flex-1 p-4 md:p-6 lg:p-7 overflow-y-auto max-w-[1750px] w-full mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  const fetchUser = async () => {
    try {
      const u = await api.getCurrentUser();
      setCurrentUser(u);
    } catch (err) {
      try {
        await api.login('admin', 'admin123');
        const u = await api.getCurrentUser();
        setCurrentUser(u);
      } catch (loginErr) {
        console.log("Login check failure:", loginErr);
      }
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  const handleLogout = async () => {
    await api.logout();
    setCurrentUser(null);
    setIsLoginModalOpen(true);
  };

  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/intro" element={<LandingPage />} />
        <Route path="/landing" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage onLoginSuccess={(u) => setCurrentUser(u)} />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />

        {/* Workspace redirect fallback */}
        <Route path="/app" element={<DefaultLandingRedirect currentUser={currentUser} />} />

        {/* VERIFIER WORKSPACE ROUTES (Custom green/light theme layout) */}
        <Route element={<VerifierLayout currentUser={currentUser} onLogout={handleLogout} />}>
          <Route path="/verifier/dashboard" element={<RoleGuard currentUser={currentUser} allowedRoles={['ADMIN', 'VERIFIER']}><VerifierDashboardPage /></RoleGuard>} />
          <Route path="/verifier/verify" element={<RoleGuard currentUser={currentUser} allowedRoles={['ADMIN', 'VERIFIER']}><VerifyQdsPage /></RoleGuard>} />
          <Route path="/verifier/my-verifications" element={<RoleGuard currentUser={currentUser} allowedRoles={['ADMIN', 'VERIFIER']}><MyVerificationsPage /></RoleGuard>} />
          <Route path="/verifier/requests" element={<RoleGuard currentUser={currentUser} allowedRoles={['ADMIN', 'VERIFIER']}><VerificationRequestsPage /></RoleGuard>} />
          <Route path="/verifier/history" element={<RoleGuard currentUser={currentUser} allowedRoles={['ADMIN', 'VERIFIER']}><VerificationHistoryPage /></RoleGuard>} />
          <Route path="/verifier/analytics" element={<RoleGuard currentUser={currentUser} allowedRoles={['ADMIN', 'VERIFIER']}><VerifierAnalyticsPage /></RoleGuard>} />
          <Route path="/verifier/audit" element={<RoleGuard currentUser={currentUser} allowedRoles={['ADMIN', 'VERIFIER']}><VerifierAuditPage /></RoleGuard>} />
          <Route path="/verifier/notifications" element={<RoleGuard currentUser={currentUser} allowedRoles={['ADMIN', 'VERIFIER']}><VerifierNotificationsPage /></RoleGuard>} />
          <Route path="/verifier/settings" element={<RoleGuard currentUser={currentUser} allowedRoles={['ADMIN', 'VERIFIER']}><VerifierSettingsPage /></RoleGuard>} />
          <Route path="/verifier" element={<Navigate to="/verifier/dashboard" replace />} />
        </Route>

        {/* OTHER WORKSPACE ROUTES (Standard cyber-bg theme layout) */}
        <Route element={<StandardLayout currentUser={currentUser} onLogout={handleLogout} onLoginClick={() => setIsLoginModalOpen(true)} />}>
          {/* ADMIN WORKSPACE ROUTES */}
          <Route path="/admin/dashboard" element={<RoleGuard currentUser={currentUser} allowedRoles={['ADMIN']}><DashboardPage /></RoleGuard>} />
          <Route path="/admin/users" element={<RoleGuard currentUser={currentUser} allowedRoles={['ADMIN']}><UserManagementPage /></RoleGuard>} />
          <Route path="/admin/orgs" element={<RoleGuard currentUser={currentUser} allowedRoles={['ADMIN']}><OrganizationsPage /></RoleGuard>} />
          <Route path="/admin/threats" element={<RoleGuard currentUser={currentUser} allowedRoles={['ADMIN']}><ThreatsPage /></RoleGuard>} />
          <Route path="/admin/attack-simulator" element={<RoleGuard currentUser={currentUser} allowedRoles={['ADMIN']}><AttackSimulatorPage /></RoleGuard>} />
          <Route path="/admin/qds" element={<RoleGuard currentUser={currentUser} allowedRoles={['ADMIN']}><QdsStudioPage /></RoleGuard>} />
          <Route path="/admin/analytics" element={<RoleGuard currentUser={currentUser} allowedRoles={['ADMIN']}><AnalyticsPage /></RoleGuard>} />
          <Route path="/admin/rules" element={<RoleGuard currentUser={currentUser} allowedRoles={['ADMIN']}><SecurityRulesPage /></RoleGuard>} />
          <Route path="/admin/audit" element={<RoleGuard currentUser={currentUser} allowedRoles={['ADMIN']}><AuditPage /></RoleGuard>} />
          <Route path="/admin/settings" element={<RoleGuard currentUser={currentUser} allowedRoles={['ADMIN']}><SecuritySettingsPage currentUser={currentUser} /></RoleGuard>} />
          <Route path="/settings" element={<SecuritySettingsPage currentUser={currentUser} />} />
          <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />

          {/* SIGNER WORKSPACE ROUTES */}
          <Route path="/signer/dashboard" element={<RoleGuard currentUser={currentUser} allowedRoles={['ADMIN', 'SIGNER']}><SignerDashboardPage /></RoleGuard>} />
          <Route path="/signer/create" element={<RoleGuard currentUser={currentUser} allowedRoles={['ADMIN', 'SIGNER']}><QdsStudioPage /></RoleGuard>} />
          <Route path="/signer/my-qds" element={<RoleGuard currentUser={currentUser} allowedRoles={['ADMIN', 'SIGNER']}><MyQdsPage /></RoleGuard>} />
          <Route path="/signer/requests" element={<RoleGuard currentUser={currentUser} allowedRoles={['ADMIN', 'SIGNER']}><SigningRequestsPage /></RoleGuard>} />
          <Route path="/signer/profile" element={<RoleGuard currentUser={currentUser} allowedRoles={['ADMIN', 'SIGNER']}><SignerProfilePage /></RoleGuard>} />
          <Route path="/signer/audit" element={<RoleGuard currentUser={currentUser} allowedRoles={['ADMIN', 'SIGNER']}><AuditPage /></RoleGuard>} />
          <Route path="/signer/notifications" element={<RoleGuard currentUser={currentUser} allowedRoles={['ADMIN', 'SIGNER']}><SignerNotificationsPage /></RoleGuard>} />
          <Route path="/signer/settings" element={<RoleGuard currentUser={currentUser} allowedRoles={['ADMIN', 'SIGNER']}><SignerSettingsPage /></RoleGuard>} />
          <Route path="/signer" element={<Navigate to="/signer/dashboard" replace />} />

          {/* SECURITY ANALYST WORKSPACE ROUTES */}
          <Route path="/analyst/attack-simulator" element={<RoleGuard currentUser={currentUser} allowedRoles={['ADMIN', 'SECURITY_ANALYST']}><AttackSimulatorPage /></RoleGuard>} />
          <Route path="/analyst/threats" element={<RoleGuard currentUser={currentUser} allowedRoles={['ADMIN', 'SECURITY_ANALYST']}><ThreatsPage /></RoleGuard>} />
          <Route path="/analyst/analytics" element={<RoleGuard currentUser={currentUser} allowedRoles={['ADMIN', 'SECURITY_ANALYST']}><AnalyticsPage /></RoleGuard>} />
          <Route path="/analyst/audit" element={<RoleGuard currentUser={currentUser} allowedRoles={['ADMIN', 'SECURITY_ANALYST']}><AuditPage /></RoleGuard>} />
          <Route path="/analyst" element={<Navigate to="/analyst/threats" replace />} />

          {/* LEGACY ROUTE ALIASES FOR COMPATIBILITY */}
          <Route path="/qds-studio" element={<DefaultLandingRedirect currentUser={currentUser} />} />
          <Route path="/attack-simulator" element={<DefaultLandingRedirect currentUser={currentUser} />} />
          <Route path="/threats" element={<DefaultLandingRedirect currentUser={currentUser} />} />
          <Route path="/analytics" element={<DefaultLandingRedirect currentUser={currentUser} />} />
          <Route path="/audit" element={<DefaultLandingRedirect currentUser={currentUser} />} />
          <Route path="/users" element={<Navigate to="/admin/users" replace />} />

          {/* 403 / UNAUTHORIZED CATCH-ALL */}
          <Route path="/unauthorized" element={<UnauthorizedPage currentUser={currentUser} />} />
        </Route>

        <Route path="*" element={<DefaultLandingRedirect currentUser={currentUser} />} />
      </Routes>

      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        currentUser={currentUser}
        onUserChanged={(u) => setCurrentUser(u)}
      />
    </Router>
  );
};

export default App;
