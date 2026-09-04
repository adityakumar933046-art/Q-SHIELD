import React from 'react';
import { User, UserRole } from '../types';
import { UnauthorizedPage } from '../pages/UnauthorizedPage';

// DEVELOPMENT SECURITY BYPASS
// Set to true so dashboards open freely during development without 403 / Unauthorized blocking.
// Can be toggled back to false when website development is complete to re-enable strict RBAC authentication.
const DEV_SECURITY_BYPASS = true;

interface RoleGuardProps {
  currentUser: User | null;
  allowedRoles: UserRole[];
  children: React.ReactNode;
}

export const RoleGuard: React.FC<RoleGuardProps> = ({ currentUser, allowedRoles, children }) => {
  // Allow direct access during development building mode
  if (DEV_SECURITY_BYPASS) {
    return <>{children}</>;
  }

  if (!currentUser) {
    return <UnauthorizedPage currentUser={currentUser} />;
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
