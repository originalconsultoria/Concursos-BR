import React from 'react';
import { EditalStatus, getStatusConfig } from '../utils/concursoUtils';
import clsx from 'clsx';

interface StatusBadgeProps {
  status: EditalStatus;
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, className }) => {
  const config = getStatusConfig(status);

  return (
    <span 
      className={clsx(
        "inline-flex items-center gap-1 text-[11px] font-medium text-slate-500",
        className
      )}
      title={config.description}
    >
      <span className={clsx("w-1.5 h-1.5 rounded-full", config.dotClassName)} />
      {config.label}
    </span>
  );
};
