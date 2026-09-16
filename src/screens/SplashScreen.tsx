import { useEffect, useState } from 'react';

interface SplashScreenProps {
  onDone: () => void;
}

export function SplashScreen({ onDone }: SplashScreenProps) {
  const [exiting, setExiting] = useState(false);

  useEffect(() => {
    const t1 = setTimeout(() => setExiting(true), 2100);
    const t2 = setTimeout(onDone, 2600);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [onDone]);

  return (
    <div
      className={[
        'absolute inset-0 z-50 flex flex-col items-center justify-center bg-ox-black transition-opacity duration-500',
        exiting ? 'opacity-0' : 'opacity-100',
      ].join(' ')}
    >
      {/* Expanding rings */}
      <div className="pointer-events-none absolute">
        {[0, 0.4, 0.8].map((delay, i) => (
          <div
            key={i}
            className="anim-splash-ring absolute left-1/2 top-1/2 h-40 w-40 -translate-x-1/2 -translate-y-1/2 rounded-full border border-ox-gold/30"
            style={{ animationDelay: `${delay}s` }}
          />
        ))}
      </div>

      {/* Soft gold glow */}
      <div
        className="absolute anim-glow rounded-full"
        style={{
          width: 340,
          height: 340,
          background:
            'radial-gradient(circle, rgba(212,175,55,0.35) 0%, rgba(212,175,55,0) 65%)',
          filter: 'blur(8px)',
        }}
      />

      <div className="relative flex flex-col items-center">
        {/* Animated logo with draw effect */}
        <div className="anim-scale-in">
          <svg
            width="92"
            height="92"
            viewBox="0 0 64 64"
            fill="none"
            className="drop-shadow-[0_0_16px_rgba(212,175,55,0.5)]"
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
              strokeDasharray="80"
              strokeDashoffset="80"
              style={{ animation: 'ox-logo-draw 1.2s ease-out 0.3s forwards' }}
            />
            <circle
              cx="32"
              cy="32"
              r="3"
              fill="#D4AF37"
              opacity="0"
              style={{ animation: 'ox-fade-in 0.4s ease 1.3s forwards' }}
            />
          </svg>
        </div>

        {/* Wordmark */}
        <div className="mt-7 overflow-hidden">
          <h1
            className="text-[34px] font-bold tracking-[0.34em] text-white"
            style={{
              animation: 'ox-fade-up 0.7s cubic-bezier(0.22,1,0.36,1) 0.5s both',
            }}
          >
            OXLix
          </h1>
        </div>
        <p
          className="mt-3 text-[13px] font-light tracking-[0.24em] text-ox-gold-soft/80"
          style={{ animation: 'ox-fade-up 0.6s ease 0.8s both' }}
        >
          Trusted Intelligence.
        </p>
      </div>

      {/* Loading indicator */}
      <div
        className="absolute bottom-16 flex items-center gap-2"
        style={{ animation: 'ox-fade-in 0.5s ease 1.4s both' }}
      >
        <div className="flex gap-1">
          {[0, 0.15, 0.3].map((d, i) => (
            <span
              key={i}
              className="h-1.5 w-1.5 rounded-full bg-ox-gold"
              style={{
                animation: 'ox-glow-pulse 1s ease-in-out infinite',
                animationDelay: `${d}s`,
              }}
            />
          ))}
        </div>
        <span className="text-[11px] font-light tracking-[0.2em] text-white/30">
          INITIALIZING
        </span>
      </div>
    </div>
  );
}
