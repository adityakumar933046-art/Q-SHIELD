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

  if (allowedRoles.includes(currentUser.role)) {
    return <>{children}</>;
  }

  return <UnauthorizedPage currentUser={currentUser} />;
};
