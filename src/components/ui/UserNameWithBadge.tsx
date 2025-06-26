import React from 'react';
import { Badge } from './badge';

interface UserNameWithBadgeProps {
  firstName: string;
  lastName: string;
  isDemo?: boolean;
  className?: string;
}

const UserNameWithBadge: React.FC<UserNameWithBadgeProps> = ({ firstName, lastName, isDemo, className }) => (
  <span className={`flex items-center gap-2 ${className || ''}`}>
    <span>{firstName} {lastName}</span>
    {isDemo && <Badge variant="secondary" className="ml-2 bg-yellow-200 text-yellow-800">آزمایشی</Badge>}
  </span>
);

export default UserNameWithBadge; 