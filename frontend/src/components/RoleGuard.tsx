import React from 'react';
import { User, UserRole } from '../types';
import { UnauthorizedPage } from '../pages/UnauthorizedPage';

interface RoleGuardProps {
  currentUser: User | null;
  allowedRoles: UserRole[];
  children: React.ReactNode;
}

export const RoleGuard: React.FC<RoleGuardProps> = ({ currentUser, allowedRoles, children }) => {
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
