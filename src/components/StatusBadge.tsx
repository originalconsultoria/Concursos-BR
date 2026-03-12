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
        "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider border ring-4 ring-offset-0 transition-all duration-300 cursor-help",
        config.className,
        className
      )}
      title={config.description}
    >
      <span className={clsx("w-1.5 h-1.5 rounded-full animate-pulse", config.dotClassName)} />
      {config.label}
    </span>
  );
};
