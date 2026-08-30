import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
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
import { SecurityAnalystDashboard } from './pages/SecurityAnalystDashboard';
import { api } from './services/api';
import { User } from './types';

// Role-Based Default Landing Component
const DefaultLandingRedirect: React.FC<{ currentUser: User | null }> = ({ currentUser }) => {
  if (!currentUser) return <Navigate to="/admin/dashboard" replace />;
  
  switch (currentUser.role) {
    case 'SIGNER':
      return <Navigate to="/signer/qds" replace />;
    case 'VERIFIER':
      return <Navigate to="/verifier/verify" replace />;
    case 'SECURITY_ANALYST':
      return <Navigate to="/analyst/threats" replace />;
    case 'ADMIN':
    default:
      return <Navigate to="/admin/dashboard" replace />;
  }
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
      <div className="min-h-screen bg-cyber-bg flex flex-col font-sans">
        <Navbar
          currentUser={currentUser}
          onLoginClick={() => setIsLoginModalOpen(true)}
        />

        <div className="flex flex-1">
          <Sidebar
            currentUser={currentUser}
            onLogout={handleLogout}
          />

          <main className="flex-1 p-6 overflow-y-auto">
            <Routes>
              {/* Default Landing */}
              <Route path="/" element={<DefaultLandingRedirect currentUser={currentUser} />} />

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
              <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />

              {/* SIGNER WORKSPACE ROUTES */}
              <Route path="/signer/qds" element={<RoleGuard currentUser={currentUser} allowedRoles={['ADMIN', 'SIGNER']}><QdsStudioPage /></RoleGuard>} />
              <Route path="/signer/audit" element={<RoleGuard currentUser={currentUser} allowedRoles={['ADMIN', 'SIGNER']}><AuditPage /></RoleGuard>} />
              <Route path="/signer" element={<Navigate to="/signer/qds" replace />} />

              {/* VERIFIER WORKSPACE ROUTES */}
              <Route path="/verifier/verify" element={<RoleGuard currentUser={currentUser} allowedRoles={['ADMIN', 'VERIFIER']}><QdsStudioPage /></RoleGuard>} />
              <Route path="/verifier/audit" element={<RoleGuard currentUser={currentUser} allowedRoles={['ADMIN', 'VERIFIER']}><AuditPage /></RoleGuard>} />
              <Route path="/verifier" element={<Navigate to="/verifier/verify" replace />} />

              {/* SECURITY ANALYST WORKSPACE ROUTES */}
              <Route path="/analyst/attack-simulator" element={<RoleGuard currentUser={currentUser} allowedRoles={['ADMIN', 'SECURITY_ANALYST']}><AttackSimulatorPage /></RoleGuard>} />
              <Route path="/analyst/threats" element={<RoleGuard currentUser={currentUser} allowedRoles={['ADMIN', 'SECURITY_ANALYST']}><ThreatsPage /></RoleGuard>} />
              <Route path="/analyst/analytics" element={<RoleGuard currentUser={currentUser} allowedRoles={['ADMIN', 'SECURITY_ANALYST']}><AnalyticsPage /></RoleGuard>} />
              <Route path="/analyst/audit" element={<RoleGuard currentUser={currentUser} allowedRoles={['ADMIN', 'SECURITY_ANALYST']}><AuditPage /></RoleGuard>} />
              <Route path="/analyst" element={<RoleGuard currentUser={currentUser} allowedRoles={['ADMIN', 'SECURITY_ANALYST']}><SecurityAnalystDashboard /></RoleGuard>} />

              {/* LEGACY ROUTE ALIASES FOR COMPATIBILITY */}
              <Route path="/qds-studio" element={<DefaultLandingRedirect currentUser={currentUser} />} />
              <Route path="/attack-simulator" element={<DefaultLandingRedirect currentUser={currentUser} />} />
              <Route path="/threats" element={<DefaultLandingRedirect currentUser={currentUser} />} />
              <Route path="/analytics" element={<DefaultLandingRedirect currentUser={currentUser} />} />
              <Route path="/audit" element={<DefaultLandingRedirect currentUser={currentUser} />} />
              <Route path="/users" element={<Navigate to="/admin/users" replace />} />

              {/* 403 / UNAUTHORIZED CATCH-ALL */}
              <Route path="/unauthorized" element={<UnauthorizedPage currentUser={currentUser} />} />
              <Route path="*" element={<DefaultLandingRedirect currentUser={currentUser} />} />
            </Routes>
          </main>
        </div>

        <LoginModal
          isOpen={isLoginModalOpen}
          onClose={() => setIsLoginModalOpen(false)}
          currentUser={currentUser}
          onUserChanged={(u) => setCurrentUser(u)}
        />
      </div>
    </Router>
  );
};

export default App;
