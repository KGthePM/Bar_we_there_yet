import { clsx } from 'clsx';
import { CROWD_CONFIG } from '@/lib/constants';
import type { CrowdLevel } from '@/types/database';

interface CrowdIndicatorProps {
  level: CrowdLevel;
  count?: number;
  size?: 'sm' | 'md' | 'lg';
  showCount?: boolean;
}

export function CrowdIndicator({ level, count, size = 'md', showCount = false }: CrowdIndicatorProps) {
  const config = CROWD_CONFIG[level];

  return (
    <div
      className={clsx(
        'inline-flex items-center gap-2 rounded-full font-medium',
        config.bgColor,
        config.textColor,
        {
          'px-2.5 py-1 text-xs': size === 'sm',
          'px-3 py-1.5 text-sm': size === 'md',
          'px-4 py-2 text-base': size === 'lg',
        },
      )}
    >
      <span className={clsx({ 'text-base': size === 'sm', 'text-lg': size === 'md', 'text-2xl': size === 'lg' })}>
        {config.emoji}
      </span>
      <span>{config.label}</span>
      {showCount && count !== undefined && (
        <span className="opacity-70">({count})</span>
      )}
    </div>
  );
}
