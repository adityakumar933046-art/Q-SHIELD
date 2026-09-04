import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { LoginModal } from './components/LoginModal';
import { RoleGuard } from './components/RoleGuard';
import { ThemeProvider } from './context/ThemeContext';

// Legacy Admin workspace pages
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

// Signer workspace pages & layout
import { SignerLayout } from './components/signer/SignerLayout';
import { SignerDashboardPage } from './pages/signer/SignerDashboardPage';
import { CreateSignaturePage } from './pages/signer/CreateSignaturePage';
import { MySignaturesPage } from './pages/signer/MySignaturesPage';
import { SignatureDetailsPage } from './pages/signer/SignatureDetailsPage';
import { SignerProfilePage } from './pages/signer/SignerProfilePage';

// Verifier workspace pages & layout
import { VerifierLayout } from './components/verifier/VerifierLayout';
import { VerifierDashboardPage } from './pages/verifier/VerifierDashboardPage';
import { PendingVerificationPage } from './pages/verifier/PendingVerificationPage';
import { SignatureVerificationPage } from './pages/verifier/SignatureVerificationPage';
import { VerificationHistoryPage } from './pages/verifier/VerificationHistoryPage';
import { VerifierProfilePage } from './pages/verifier/VerifierProfilePage';

// Super Admin workspace pages & layout
import { SuperAdminLayout } from './components/superadmin/SuperAdminLayout';
import { SuperAdminDashboardPage } from './pages/superadmin/SuperAdminDashboardPage';
import { SuperAdminOrganizationsPage } from './pages/superadmin/SuperAdminOrganizationsPage';
import { SuperAdminOrgDetailsPage } from './pages/superadmin/SuperAdminOrgDetailsPage';
import { SuperAdminSecurityOverviewPage } from './pages/superadmin/SuperAdminSecurityOverviewPage';
import { SuperAdminAuditLogsPage } from './pages/superadmin/SuperAdminAuditLogsPage';
import { SuperAdminSettingsPage } from './pages/superadmin/SuperAdminSettingsPage';

// Organization Admin workspace pages & layout
import { OrgAdminLayout } from './components/orgadmin/OrgAdminLayout';
import { OrgAdminDashboardPage } from './pages/orgadmin/OrgAdminDashboardPage';
import { OrgAdminTeamPage } from './pages/orgadmin/OrgAdminTeamPage';
import { OrgAdminActivityPage } from './pages/orgadmin/OrgAdminActivityPage';
import { OrgAdminSecurityOverviewPage } from './pages/orgadmin/OrgAdminSecurityOverviewPage';
import { OrgAdminAuditLogsPage } from './pages/orgadmin/OrgAdminAuditLogsPage';
import { OrgAdminSettingsPage } from './pages/orgadmin/OrgAdminSettingsPage';

// Security Analyst workspace pages & layout
import { SecurityAnalystLayout } from './components/analyst/SecurityAnalystLayout';
import { SecurityAnalystDashboardPage } from './pages/analyst/SecurityAnalystDashboardPage';
import { ThreatMonitoringPage } from './pages/analyst/ThreatMonitoringPage';
import { ThreatDetailsPage } from './pages/analyst/ThreatDetailsPage';
import { InvestigationsPage } from './pages/analyst/InvestigationsPage';
import { InvestigationDetailsPage } from './pages/analyst/InvestigationDetailsPage';
import { SecurityAnalyticsPage } from './pages/analyst/SecurityAnalyticsPage';
import { SecurityAnalystProfilePage } from './pages/analyst/SecurityAnalystProfilePage';

// Auth pages
import { api } from './services/api';
import { User } from './types';
import { ForgotPasswordPage } from './pages/ForgotPasswordPage';
import { ResetPasswordPage } from './pages/ResetPasswordPage';
import { SecuritySettingsPage } from './pages/SecuritySettingsPage';
import { LoginPage } from './pages/LoginPage';

// Role-Based Default Landing Component
const DefaultLandingRedirect: React.FC<{ currentUser: User | null }> = ({ currentUser }) => {
  if (!currentUser) return <Navigate to="/super-admin/dashboard" replace />;
  
  switch (currentUser.role) {
    case 'SUPER_ADMIN':
      return <Navigate to="/super-admin/dashboard" replace />;
    case 'ORGANIZATION_ADMIN':
      return <Navigate to="/org-admin/dashboard" replace />;
    case 'SIGNER':
      return <Navigate to="/signer/dashboard" replace />;
    case 'VERIFIER':
      return <Navigate to="/verifier/dashboard" replace />;
    case 'SECURITY_ANALYST':
      return <Navigate to="/security-analyst/dashboard" replace />;
    case 'ADMIN':
    default:
      return <Navigate to="/org-admin/dashboard" replace />;
  }
};

// Standard dark-themed layout for Admin
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

export const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  const fetchUser = async () => {
    try {
      const u = await api.getCurrentUser();
      setCurrentUser(u);
    } catch (err) {
      setCurrentUser(null);
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
    <ThemeProvider>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<LoginPage onLoginSuccess={(u) => setCurrentUser(u)} currentUser={currentUser} />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />

          {/* Default Landing */}
          <Route path="/" element={<DefaultLandingRedirect currentUser={currentUser} />} />

          {/* SECURITY ANALYST WORKSPACE ROUTES (Dedicated Red/Dark Theme Layout & Sidebar) */}
          <Route element={<SecurityAnalystLayout currentUser={currentUser} onLogout={handleLogout} />}>
            <Route path="/security-analyst/dashboard" element={<RoleGuard currentUser={currentUser} allowedRoles={['SUPER_ADMIN', 'ADMIN', 'ORGANIZATION_ADMIN', 'SECURITY_ANALYST']}><SecurityAnalystDashboardPage currentUser={currentUser} /></RoleGuard>} />
            <Route path="/security-analyst/threats" element={<RoleGuard currentUser={currentUser} allowedRoles={['SUPER_ADMIN', 'ADMIN', 'ORGANIZATION_ADMIN', 'SECURITY_ANALYST']}><ThreatMonitoringPage currentUser={currentUser} /></RoleGuard>} />
            <Route path="/security-analyst/threats/:id" element={<RoleGuard currentUser={currentUser} allowedRoles={['SUPER_ADMIN', 'ADMIN', 'ORGANIZATION_ADMIN', 'SECURITY_ANALYST']}><ThreatDetailsPage currentUser={currentUser} /></RoleGuard>} />
            <Route path="/security-analyst/investigations" element={<RoleGuard currentUser={currentUser} allowedRoles={['SUPER_ADMIN', 'ADMIN', 'ORGANIZATION_ADMIN', 'SECURITY_ANALYST']}><InvestigationsPage currentUser={currentUser} /></RoleGuard>} />
            <Route path="/security-analyst/investigations/:id" element={<RoleGuard currentUser={currentUser} allowedRoles={['SUPER_ADMIN', 'ADMIN', 'ORGANIZATION_ADMIN', 'SECURITY_ANALYST']}><InvestigationDetailsPage currentUser={currentUser} /></RoleGuard>} />
            <Route path="/security-analyst/analytics" element={<RoleGuard currentUser={currentUser} allowedRoles={['SUPER_ADMIN', 'ADMIN', 'ORGANIZATION_ADMIN', 'SECURITY_ANALYST']}><SecurityAnalyticsPage currentUser={currentUser} /></RoleGuard>} />
            <Route path="/security-analyst/profile" element={<RoleGuard currentUser={currentUser} allowedRoles={['SUPER_ADMIN', 'ADMIN', 'ORGANIZATION_ADMIN', 'SECURITY_ANALYST']}><SecurityAnalystProfilePage currentUser={currentUser} /></RoleGuard>} />
            <Route path="/security-analyst" element={<Navigate to="/security-analyst/dashboard" replace />} />
            <Route path="/analyst/threats" element={<Navigate to="/security-analyst/threats" replace />} />
            <Route path="/analyst/dashboard" element={<Navigate to="/security-analyst/dashboard" replace />} />
            <Route path="/analyst" element={<Navigate to="/security-analyst/dashboard" replace />} />
          </Route>

          {/* SIGNER WORKSPACE ROUTES (Dedicated Signer Layout & Sidebar) */}
          <Route element={<SignerLayout currentUser={currentUser} onLogout={handleLogout} />}>
            <Route path="/signer/dashboard" element={<RoleGuard currentUser={currentUser} allowedRoles={['SUPER_ADMIN', 'ADMIN', 'ORGANIZATION_ADMIN', 'SIGNER']}><SignerDashboardPage currentUser={currentUser} /></RoleGuard>} />
            <Route path="/signer/create-signature" element={<RoleGuard currentUser={currentUser} allowedRoles={['SUPER_ADMIN', 'ADMIN', 'ORGANIZATION_ADMIN', 'SIGNER']}><CreateSignaturePage currentUser={currentUser} /></RoleGuard>} />
            <Route path="/signer/create" element={<Navigate to="/signer/create-signature" replace />} />
            <Route path="/signer/my-signatures" element={<RoleGuard currentUser={currentUser} allowedRoles={['SUPER_ADMIN', 'ADMIN', 'ORGANIZATION_ADMIN', 'SIGNER']}><MySignaturesPage currentUser={currentUser} /></RoleGuard>} />
            <Route path="/signer/my-qds" element={<Navigate to="/signer/my-signatures" replace />} />
            <Route path="/signer/signatures/:id" element={<RoleGuard currentUser={currentUser} allowedRoles={['SUPER_ADMIN', 'ADMIN', 'ORGANIZATION_ADMIN', 'SIGNER']}><SignatureDetailsPage currentUser={currentUser} /></RoleGuard>} />
            <Route path="/signer/profile" element={<RoleGuard currentUser={currentUser} allowedRoles={['SUPER_ADMIN', 'ADMIN', 'ORGANIZATION_ADMIN', 'SIGNER']}><SignerProfilePage currentUser={currentUser} /></RoleGuard>} />
            <Route path="/signer" element={<Navigate to="/signer/dashboard" replace />} />
          </Route>

          {/* VERIFIER WORKSPACE ROUTES (Dedicated Verifier Layout & Sidebar) */}
          <Route element={<VerifierLayout currentUser={currentUser} onLogout={handleLogout} />}>
            <Route path="/verifier/dashboard" element={<RoleGuard currentUser={currentUser} allowedRoles={['SUPER_ADMIN', 'ADMIN', 'ORGANIZATION_ADMIN', 'VERIFIER']}><VerifierDashboardPage currentUser={currentUser} /></RoleGuard>} />
            <Route path="/verifier/pending" element={<RoleGuard currentUser={currentUser} allowedRoles={['SUPER_ADMIN', 'ADMIN', 'ORGANIZATION_ADMIN', 'VERIFIER']}><PendingVerificationPage currentUser={currentUser} /></RoleGuard>} />
            <Route path="/verifier/signatures/:id/verify" element={<RoleGuard currentUser={currentUser} allowedRoles={['SUPER_ADMIN', 'ADMIN', 'ORGANIZATION_ADMIN', 'VERIFIER']}><SignatureVerificationPage currentUser={currentUser} /></RoleGuard>} />
            <Route path="/verifier/history" element={<RoleGuard currentUser={currentUser} allowedRoles={['SUPER_ADMIN', 'ADMIN', 'ORGANIZATION_ADMIN', 'VERIFIER']}><VerificationHistoryPage currentUser={currentUser} /></RoleGuard>} />
            <Route path="/verifier/profile" element={<RoleGuard currentUser={currentUser} allowedRoles={['SUPER_ADMIN', 'ADMIN', 'ORGANIZATION_ADMIN', 'VERIFIER']}><VerifierProfilePage currentUser={currentUser} /></RoleGuard>} />
            <Route path="/verifier" element={<Navigate to="/verifier/dashboard" replace />} />
          </Route>

          {/* SUPER ADMIN WORKSPACE ROUTES (Dedicated Global Platform Layout & Sidebar) */}
          <Route element={<SuperAdminLayout currentUser={currentUser} onLogout={handleLogout} />}>
            <Route path="/super-admin/dashboard" element={<RoleGuard currentUser={currentUser} allowedRoles={['SUPER_ADMIN']}><SuperAdminDashboardPage /></RoleGuard>} />
            <Route path="/super-admin/organizations" element={<RoleGuard currentUser={currentUser} allowedRoles={['SUPER_ADMIN']}><SuperAdminOrganizationsPage /></RoleGuard>} />
            <Route path="/super-admin/organizations/:id" element={<RoleGuard currentUser={currentUser} allowedRoles={['SUPER_ADMIN']}><SuperAdminOrgDetailsPage /></RoleGuard>} />
            <Route path="/super-admin/security-overview" element={<RoleGuard currentUser={currentUser} allowedRoles={['SUPER_ADMIN']}><SuperAdminSecurityOverviewPage /></RoleGuard>} />
            <Route path="/super-admin/audit-logs" element={<RoleGuard currentUser={currentUser} allowedRoles={['SUPER_ADMIN']}><SuperAdminAuditLogsPage /></RoleGuard>} />
            <Route path="/super-admin/settings" element={<RoleGuard currentUser={currentUser} allowedRoles={['SUPER_ADMIN']}><SuperAdminSettingsPage currentUser={currentUser} /></RoleGuard>} />
            <Route path="/super-admin" element={<Navigate to="/super-admin/dashboard" replace />} />
          </Route>

          {/* ORGANIZATION ADMIN WORKSPACE ROUTES (Dedicated Organization Layout & Sidebar) */}
          <Route element={<OrgAdminLayout currentUser={currentUser} onLogout={handleLogout} />}>
            <Route path="/org-admin/dashboard" element={<RoleGuard currentUser={currentUser} allowedRoles={['SUPER_ADMIN', 'ORGANIZATION_ADMIN', 'ADMIN']}><OrgAdminDashboardPage currentUser={currentUser} /></RoleGuard>} />
            <Route path="/org-admin/team" element={<RoleGuard currentUser={currentUser} allowedRoles={['SUPER_ADMIN', 'ORGANIZATION_ADMIN', 'ADMIN']}><OrgAdminTeamPage currentUser={currentUser} /></RoleGuard>} />
            <Route path="/org-admin/activity" element={<RoleGuard currentUser={currentUser} allowedRoles={['SUPER_ADMIN', 'ORGANIZATION_ADMIN', 'ADMIN']}><OrgAdminActivityPage currentUser={currentUser} /></RoleGuard>} />
            <Route path="/org-admin/security-overview" element={<RoleGuard currentUser={currentUser} allowedRoles={['SUPER_ADMIN', 'ORGANIZATION_ADMIN', 'ADMIN']}><OrgAdminSecurityOverviewPage currentUser={currentUser} /></RoleGuard>} />
            <Route path="/org-admin/audit-logs" element={<RoleGuard currentUser={currentUser} allowedRoles={['SUPER_ADMIN', 'ORGANIZATION_ADMIN', 'ADMIN']}><OrgAdminAuditLogsPage currentUser={currentUser} /></RoleGuard>} />
            <Route path="/org-admin/settings" element={<RoleGuard currentUser={currentUser} allowedRoles={['SUPER_ADMIN', 'ORGANIZATION_ADMIN', 'ADMIN']}><OrgAdminSettingsPage currentUser={currentUser} /></RoleGuard>} />
            <Route path="/org-admin" element={<Navigate to="/org-admin/dashboard" replace />} />
          </Route>

          {/* OTHER WORKSPACE ROUTES (Standard cyber-bg theme layout) */}
          <Route element={<StandardLayout currentUser={currentUser} onLogout={handleLogout} onLoginClick={() => setIsLoginModalOpen(true)} />}>
            {/* LEGACY ADMIN ALIASES */}
            <Route path="/admin/dashboard" element={<Navigate to="/org-admin/dashboard" replace />} />
            <Route path="/admin/users" element={<Navigate to="/org-admin/team" replace />} />
            <Route path="/admin/orgs" element={<Navigate to="/org-admin/dashboard" replace />} />
            <Route path="/admin/threats" element={<RoleGuard currentUser={currentUser} allowedRoles={['SUPER_ADMIN', 'ORGANIZATION_ADMIN', 'ADMIN']}><ThreatsPage /></RoleGuard>} />
            <Route path="/admin/attack-simulator" element={<RoleGuard currentUser={currentUser} allowedRoles={['SUPER_ADMIN', 'ORGANIZATION_ADMIN', 'ADMIN']}><AttackSimulatorPage /></RoleGuard>} />
            <Route path="/admin/qds" element={<RoleGuard currentUser={currentUser} allowedRoles={['SUPER_ADMIN', 'ORGANIZATION_ADMIN', 'ADMIN']}><QdsStudioPage /></RoleGuard>} />
            <Route path="/admin/analytics" element={<RoleGuard currentUser={currentUser} allowedRoles={['SUPER_ADMIN', 'ORGANIZATION_ADMIN', 'ADMIN']}><AnalyticsPage /></RoleGuard>} />
            <Route path="/admin/rules" element={<RoleGuard currentUser={currentUser} allowedRoles={['SUPER_ADMIN', 'ORGANIZATION_ADMIN', 'ADMIN']}><SecurityRulesPage /></RoleGuard>} />
            <Route path="/admin/audit" element={<RoleGuard currentUser={currentUser} allowedRoles={['SUPER_ADMIN', 'ORGANIZATION_ADMIN', 'ADMIN']}><AuditPage /></RoleGuard>} />
            <Route path="/admin/settings" element={<RoleGuard currentUser={currentUser} allowedRoles={['SUPER_ADMIN', 'ORGANIZATION_ADMIN', 'ADMIN']}><SecuritySettingsPage currentUser={currentUser} /></RoleGuard>} />
            <Route path="/settings" element={<SecuritySettingsPage currentUser={currentUser} />} />
            <Route path="/admin" element={<Navigate to="/org-admin/dashboard" replace />} />

            {/* LEGACY ROUTE ALIASES FOR COMPATIBILITY */}
            <Route path="/qds-studio" element={<DefaultLandingRedirect currentUser={currentUser} />} />
            <Route path="/attack-simulator" element={<DefaultLandingRedirect currentUser={currentUser} />} />
            <Route path="/threats" element={<DefaultLandingRedirect currentUser={currentUser} />} />
            <Route path="/analytics" element={<DefaultLandingRedirect currentUser={currentUser} />} />
            <Route path="/audit" element={<DefaultLandingRedirect currentUser={currentUser} />} />
            <Route path="/users" element={<Navigate to="/org-admin/team" replace />} />

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
    </ThemeProvider>
  );
};

export default App;
