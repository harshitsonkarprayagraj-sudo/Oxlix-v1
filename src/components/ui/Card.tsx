import type { HTMLAttributes, ReactNode } from 'react';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  hover?: boolean;
  className?: string;
}

export function Card({
  children,
  hover = false,
  className = '',
  ...rest
}: CardProps) {
  return (
    <div
      className={[
        'rounded-3xl bg-ox-card border border-white/[0.06] shadow-premium',
        hover
          ? 'transition-all duration-300 hover:border-ox-gold/25 hover:-translate-y-0.5'
          : '',
        className,
      ].join(' ')}
      {...rest}
    >
      {children}
    </div>
  );
}
