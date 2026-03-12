import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import clsx from 'clsx';

interface PositionsListProps {
  positions: string | undefined;
  className?: string;
  itemClassName?: string;
}

export const PositionsList: React.FC<PositionsListProps> = ({ 
  positions, 
  className = "flex flex-wrap gap-1.5",
  itemClassName = "px-2 py-0.5 bg-white text-slate-600 rounded-md text-[9px] font-bold border border-slate-200 shadow-sm"
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!positions || positions === 'N/A') return null;

  const allPositions = positions
    .split(/[,;]/)
    .map(p => p.trim())
    .filter(p => !!p);

  if (allPositions.length === 0) return null;

  const visiblePositions = isExpanded ? allPositions : allPositions.slice(0, 5);
  const hiddenCount = allPositions.length - 5;

  return (
    <div className="space-y-2">
      <div className={className}>
        {visiblePositions.map((pos, i) => (
          <span key={i} className={itemClassName}>
            {pos}
          </span>
        ))}
      </div>
      
      {allPositions.length > 5 && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            setIsExpanded(!isExpanded);
          }}
          className="flex items-center gap-1 text-[10px] font-bold text-indigo-600 hover:text-indigo-700 transition-colors"
        >
          {isExpanded ? (
            <>
              <ChevronUp size={12} />
              <span>Ver menos</span>
            </>
          ) : (
            <>
              <ChevronDown size={12} />
              <span>+ {hiddenCount} cargos</span>
            </>
          )}
        </button>
      )}
    </div>
  );
};
