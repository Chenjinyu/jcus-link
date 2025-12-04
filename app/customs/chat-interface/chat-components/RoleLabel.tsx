'use client';

import { MessageRole } from '@/app/types';

// =============================================================================
// ROLE LABEL COMPONENT
// =============================================================================
export interface RoleLabelProps {
  role: MessageRole;
}

export const RoleLabel = ({ role }: RoleLabelProps) => (
  <div className={`text-xs font-medium opacity-60 mb-1.5 ${role === 'user' ? 'text-right' : ''}`}>
    {role === 'user' ? 'You' : 'Assistant'}
  </div>
);