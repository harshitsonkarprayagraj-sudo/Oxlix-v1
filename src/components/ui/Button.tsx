import { useRef, type ButtonHTMLAttributes, type ReactNode } from 'react';
import { haptic } from '@/lib/haptics';

type Variant = 'primary' | 'ghost' | 'outline';
type Size = 'sm' | 'md' | 'lg';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  fullWidth?: boolean;
  children: ReactNode;
}

const variantClasses: Record<Variant, string> = {
  primary:
    'bg-gradient-to-br from-[#f4e09c] via-[#d4af37] to-[#9c7b1f] text-black font-semibold shadow-gold hover:brightness-110',
  ghost: 'bg-white/5 text-white hover:bg-white/10 border border-white/5',
  outline:
    'bg-transparent text-ox-gold border border-ox-gold/40 hover:border-ox-gold hover:bg-ox-gold/5',
};

const sizeClasses: Record<Size, string> = {
  sm: 'h-9 px-4 text-sm rounded-xl',
  md: 'h-12 px-5 text-[15px] rounded-2xl',
  lg: 'h-14 px-6 text-base rounded-2xl',
};

export function Button({
  variant = 'primary',
  size = 'md',
  leftIcon,
  rightIcon,
  fullWidth,
  className = '',
  children,
  onClick,
  ...rest
}: ButtonProps) {
  const ref = useRef<HTMLButtonElement>(null);

  const handleRipple = (e: React.MouseEvent<HTMLButtonElement>) => {
    const btn = ref.current;
    if (!btn) return;
    const rect = btn.getBoundingClientRect();
    const span = document.createElement('span');
    const size = Math.max(rect.width, rect.height);
    span.className = 'ripple-span';
    span.style.width = span.style.height = `${size}px`;
    span.style.left = `${e.clientX - rect.left - size / 2}px`;
    span.style.top = `${e.clientY - rect.top - size / 2}px`;
    btn.appendChild(span);
    setTimeout(() => span.remove(), 600);
  };

  return (
    <button
      ref={ref}
      onClick={(e) => {
        haptic(variant === 'primary' ? 'medium' : 'light');
        handleRipple(e);
        onClick?.(e);
      }}
      className={[
        'ripple inline-flex items-center justify-center gap-2 transition-all duration-200 active:scale-[0.96] select-none',
        variantClasses[variant],
        sizeClasses[size],
        fullWidth ? 'w-full' : '',
        className,
      ].join(' ')}
      {...rest}
    >
      {leftIcon}
      {children}
      {rightIcon}
    </button>
  );
}
