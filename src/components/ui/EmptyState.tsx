import type { ReactNode } from 'react';

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  subtitle?: string;
  action?: ReactNode;
}

export function EmptyState({ icon, title, subtitle, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 px-8 py-12 text-center anim-fade-up">
      {icon && (
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-white/[0.06] bg-white/[0.02] text-white/30">
          {icon}
        </div>
      )}
      <div>
        <p className="text-[15px] font-semibold text-white/80">{title}</p>
        {subtitle && <p className="mt-1 text-[13px] text-white/35">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}
