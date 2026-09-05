import { Navigate } from 'react-router-dom';
import { User, UserRole } from '../types';
import { UnauthorizedPage } from '../pages/UnauthorizedPage';

// Enable strict authentication & role guard checks across all workspace routes
const DEV_SECURITY_BYPASS = false;

interface RoleGuardProps {
  currentUser: User | null;
  allowedRoles: UserRole[];
  children: React.ReactNode;
}

export const RoleGuard: React.FC<RoleGuardProps> = ({ currentUser, allowedRoles, children }) => {
  // Redirect unauthenticated users directly to login page
  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  // Allow direct access if dev security bypass is toggled
  if (DEV_SECURITY_BYPASS) {
    return <>{children}</>;
  }

  const role = currentUser.role;

  // Handle Admin permission hierarchy
  const isMatch = allowedRoles.some((allowed) => {
    if (allowed === role) return true;
    if (allowed === 'ADMIN' && (role === 'SUPER_ADMIN' || role === 'ORGANIZATION_ADMIN' || role === 'ADMIN')) return true;
    if (allowed === 'SUPER_ADMIN' && (role === 'ADMIN' || role === 'SUPER_ADMIN')) return true;
    if (allowed === 'ORGANIZATION_ADMIN' && (role === 'ADMIN' || role === 'SUPER_ADMIN' || role === 'ORGANIZATION_ADMIN')) return true;
    return false;
  });

  if (isMatch) {
    return <>{children}</>;
  }

  return <UnauthorizedPage currentUser={currentUser} />;
};
