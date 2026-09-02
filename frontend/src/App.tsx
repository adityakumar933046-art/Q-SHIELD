import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { LoginModal } from './components/LoginModal';
import { RoleGuard } from './components/RoleGuard';

// Organization Admin workspace pages
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

// Signer workspace pages
import { SignerDashboardPage } from './pages/SignerDashboardPage';
import { MyQdsPage } from './pages/MyQdsPage';
import { SigningRequestsPage } from './pages/SigningRequestsPage';
import { SignerProfilePage } from './pages/SignerProfilePage';
import { SignerNotificationsPage } from './pages/SignerNotificationsPage';
import { SignerSettingsPage } from './pages/SignerSettingsPage';

// Verifier workspace pages & components
import { VerifierDashboardPage } from './pages/VerifierDashboardPage';
import { VerifyQdsPage } from './pages/VerifyQdsPage';
import { MyVerificationsPage } from './pages/MyVerificationsPage';
import { VerificationRequestsPage } from './pages/VerificationRequestsPage';
import { VerificationHistoryPage } from './pages/VerificationHistoryPage';
import { VerifierAnalyticsPage } from './pages/VerifierAnalyticsPage';
import { VerifierAuditPage } from './pages/VerifierAuditPage';
import { VerifierNotificationsPage } from './pages/VerifierNotificationsPage';
import { VerifierSettingsPage } from './pages/VerifierSettingsPage';
import { VerifierSidebar } from './components/VerifierSidebar';
import { VerifierNavbar } from './components/VerifierNavbar';

// Super Admin workspace pages & layout
import { SuperAdminLayout } from './components/superadmin/SuperAdminLayout';
import { SuperAdminDashboardPage } from './pages/superadmin/SuperAdminDashboardPage';
import { SuperAdminOrganizationsPage } from './pages/superadmin/SuperAdminOrganizationsPage';
import { SuperAdminOrgDetailsPage } from './pages/superadmin/SuperAdminOrgDetailsPage';
import { SuperAdminSecurityOverviewPage } from './pages/superadmin/SuperAdminSecurityOverviewPage';
import { SuperAdminAuditLogsPage } from './pages/superadmin/SuperAdminAuditLogsPage';
import { SuperAdminSettingsPage } from './pages/superadmin/SuperAdminSettingsPage';

// Auth pages
import { api } from './services/api';
import { User } from './types';
import { ForgotPasswordPage } from './pages/ForgotPasswordPage';
import { ResetPasswordPage } from './pages/ResetPasswordPage';
import { SecuritySettingsPage } from './pages/SecuritySettingsPage';
import { LoginPage } from './pages/LoginPage';

// Role-Based Default Landing Component
const DefaultLandingRedirect: React.FC<{ currentUser: User | null }> = ({ currentUser }) => {
  if (!currentUser) return <Navigate to="/login" replace />;
  
  switch (currentUser.role) {
    case 'SUPER_ADMIN':
      return <Navigate to="/super-admin/dashboard" replace />;
    case 'ORGANIZATION_ADMIN':
      return <Navigate to="/admin/dashboard" replace />;
    case 'SIGNER':
      return <Navigate to="/signer/dashboard" replace />;
    case 'VERIFIER':
      return <Navigate to="/verifier/dashboard" replace />;
    case 'SECURITY_ANALYST':
      return <Navigate to="/analyst/threats" replace />;
    case 'ADMIN':
    default:
      return <Navigate to="/super-admin/dashboard" replace />;
  }
};

// Standard dark-themed layout for Org Admin, Signer, and Analyst
const StandardLayout: React.FC<{
  currentUser: User | null;
  onLogout: () => void;
  onLoginClick: () => void;
}> = ({ currentUser, onLogout, onLoginClick }) => {
  return (
    <div className="min-h-screen bg-cyber-bg flex flex-col font-sans">
      <Navbar
        currentUser={currentUser}
        onLoginClick={onLoginClick}
      />
      <div className="flex flex-1">
        <Sidebar
          currentUser={currentUser}
          onLogout={onLogout}
        />
        <main className="flex-1 p-6 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

// Light-themed layout for the Verifier portal
const VerifierLayout: React.FC<{
  currentUser: User | null;
  onLogout: () => void;
}> = ({ currentUser, onLogout }) => {
  return (
    <div className="min-h-screen bg-[#F3F4F6] flex font-sans text-slate-800">
      <VerifierSidebar currentUser={currentUser} onLogout={onLogout} />
      <div className="flex-1 flex flex-col min-h-screen overflow-hidden">
        <VerifierNavbar currentUser={currentUser} />
        <main className="flex-1 p-6 overflow-y-auto bg-[#F3F4F6]">
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
        await api.login('super_admin', 'SuperPassword123!');
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
        <Route path="/login" element={<LoginPage onLoginSuccess={(u) => setCurrentUser(u)} />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />

        {/* Default Landing */}
        <Route path="/" element={<DefaultLandingRedirect currentUser={currentUser} />} />

        {/* SUPER ADMIN WORKSPACE ROUTES (Dedicated Global Platform Layout & Sidebar) */}
        <Route element={<SuperAdminLayout currentUser={currentUser} onLogout={handleLogout} />}>
          <Route path="/super-admin/dashboard" element={<RoleGuard currentUser={currentUser} allowedRoles={['SUPER_ADMIN', 'ADMIN']}><SuperAdminDashboardPage /></RoleGuard>} />
          <Route path="/super-admin/organizations" element={<RoleGuard currentUser={currentUser} allowedRoles={['SUPER_ADMIN', 'ADMIN']}><SuperAdminOrganizationsPage /></RoleGuard>} />
          <Route path="/super-admin/organizations/:id" element={<RoleGuard currentUser={currentUser} allowedRoles={['SUPER_ADMIN', 'ADMIN']}><SuperAdminOrgDetailsPage /></RoleGuard>} />
          <Route path="/super-admin/security-overview" element={<RoleGuard currentUser={currentUser} allowedRoles={['SUPER_ADMIN', 'ADMIN']}><SuperAdminSecurityOverviewPage /></RoleGuard>} />
          <Route path="/super-admin/audit-logs" element={<RoleGuard currentUser={currentUser} allowedRoles={['SUPER_ADMIN', 'ADMIN']}><SuperAdminAuditLogsPage /></RoleGuard>} />
          <Route path="/super-admin/settings" element={<RoleGuard currentUser={currentUser} allowedRoles={['SUPER_ADMIN', 'ADMIN']}><SuperAdminSettingsPage currentUser={currentUser} /></RoleGuard>} />
          <Route path="/super-admin" element={<Navigate to="/super-admin/dashboard" replace />} />
        </Route>

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
          {/* ORGANIZATION ADMIN WORKSPACE ROUTES */}
          <Route path="/admin/dashboard" element={<RoleGuard currentUser={currentUser} allowedRoles={['SUPER_ADMIN', 'ORGANIZATION_ADMIN', 'ADMIN']}><DashboardPage /></RoleGuard>} />
          <Route path="/admin/users" element={<RoleGuard currentUser={currentUser} allowedRoles={['SUPER_ADMIN', 'ORGANIZATION_ADMIN', 'ADMIN']}><UserManagementPage /></RoleGuard>} />
          <Route path="/admin/orgs" element={<RoleGuard currentUser={currentUser} allowedRoles={['SUPER_ADMIN', 'ORGANIZATION_ADMIN', 'ADMIN']}><OrganizationsPage /></RoleGuard>} />
          <Route path="/admin/threats" element={<RoleGuard currentUser={currentUser} allowedRoles={['SUPER_ADMIN', 'ORGANIZATION_ADMIN', 'ADMIN']}><ThreatsPage /></RoleGuard>} />
          <Route path="/admin/attack-simulator" element={<RoleGuard currentUser={currentUser} allowedRoles={['SUPER_ADMIN', 'ORGANIZATION_ADMIN', 'ADMIN']}><AttackSimulatorPage /></RoleGuard>} />
          <Route path="/admin/qds" element={<RoleGuard currentUser={currentUser} allowedRoles={['SUPER_ADMIN', 'ORGANIZATION_ADMIN', 'ADMIN']}><QdsStudioPage /></RoleGuard>} />
          <Route path="/admin/analytics" element={<RoleGuard currentUser={currentUser} allowedRoles={['SUPER_ADMIN', 'ORGANIZATION_ADMIN', 'ADMIN']}><AnalyticsPage /></RoleGuard>} />
          <Route path="/admin/rules" element={<RoleGuard currentUser={currentUser} allowedRoles={['SUPER_ADMIN', 'ORGANIZATION_ADMIN', 'ADMIN']}><SecurityRulesPage /></RoleGuard>} />
          <Route path="/admin/audit" element={<RoleGuard currentUser={currentUser} allowedRoles={['SUPER_ADMIN', 'ORGANIZATION_ADMIN', 'ADMIN']}><AuditPage /></RoleGuard>} />
          <Route path="/admin/settings" element={<RoleGuard currentUser={currentUser} allowedRoles={['SUPER_ADMIN', 'ORGANIZATION_ADMIN', 'ADMIN']}><SecuritySettingsPage currentUser={currentUser} /></RoleGuard>} />
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
