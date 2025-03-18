
import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface EmployeeAvatarProps {
  initials: string;
  color: string;
}

const EmployeeAvatar: React.FC<EmployeeAvatarProps> = ({ initials, color }) => {
  return (
    <Avatar>
      <AvatarImage src="" />
      <AvatarFallback className={color}>
        {initials}
      </AvatarFallback>
    </Avatar>
  );
};

export default EmployeeAvatar;
