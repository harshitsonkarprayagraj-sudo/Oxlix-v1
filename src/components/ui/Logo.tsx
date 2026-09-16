interface LogoProps {
  size?: number;
  withWordmark?: boolean;
  className?: string;
}

export function Logo({ size = 36, withWordmark = false, className = '' }: LogoProps) {
  return (
    <div className={['flex items-center gap-2.5', className].join(' ')}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 64 64"
        fill="none"
        className="drop-shadow-[0_0_10px_rgba(212,175,55,0.45)]"
      >
        <rect width="64" height="64" rx="14" fill="#0c0c0c" />
        <rect
          x="0.5"
          y="0.5"
          width="63"
          height="63"
          rx="13.5"
          stroke="#D4AF37"
          strokeOpacity="0.35"
        />
        <path
          d="M20 22h24M20 42h24M22 22v20M42 22v20"
          stroke="#D4AF37"
          strokeWidth="4"
          strokeLinecap="round"
        />
        <circle cx="32" cy="32" r="3" fill="#D4AF37" />
      </svg>
      {withWordmark && (
        <span className="text-[22px] font-bold tracking-[0.18em] text-white">
          OXLIX
        </span>
      )}
    </div>
  );
}
