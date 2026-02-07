import { clsx } from 'clsx';
import type { HTMLAttributes, ReactNode } from 'react';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  padding?: boolean;
  hover?: boolean;
}

export function Card({ children, className, padding = true, hover = false, ...props }: CardProps) {
  return (
    <div
      className={clsx(
        'rounded-2xl bg-gray-900 border border-gray-800',
        hover && 'transition-all duration-200 hover:border-gray-700 hover:shadow-lg hover:shadow-black/20',
        padding && 'p-6',
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}
