interface OrbProps {
  size?: number;
  active?: boolean;
  className?: string;
}

export function AIOrb({ size = 220, active = true, className = '' }: OrbProps) {
  return (
    <div
      className={['relative flex items-center justify-center', className].join(' ')}
      style={{ width: size, height: size }}
    >
      {/* Outer glow */}
      <div
        className="absolute inset-0 rounded-full blur-2xl"
        style={{
          background:
            'radial-gradient(circle, rgba(212,175,55,0.45) 0%, rgba(212,175,55,0) 70%)',
        }}
      />
      {/* Rotating ring */}
      {active && (
        <div
          className="absolute anim-orb-rotate rounded-full"
          style={{
            inset: size * 0.08,
            background:
              'conic-gradient(from 0deg, transparent 0deg, rgba(212,175,55,0.7) 90deg, transparent 180deg, rgba(232,200,98,0.5) 270deg, transparent 360deg)',
            maskImage: 'radial-gradient(transparent 62%, #000 64%)',
            WebkitMaskImage: 'radial-gradient(transparent 62%, #000 64%)',
          }}
        />
      )}
      {/* Breathing core */}
      <div
        className="relative anim-orb-breathe rounded-full"
        style={{
          width: size * 0.62,
          height: size * 0.62,
          background:
            'radial-gradient(circle at 35% 30%, #f7e9b6 0%, #d4af37 35%, #6e5316 75%, #2a1f08 100%)',
          boxShadow:
            '0 0 50px -4px rgba(212,175,55,0.55), inset 0 0 40px rgba(0,0,0,0.5)',
        }}
      >
        {/* Specular highlight */}
        <div
          className="absolute rounded-full"
          style={{
            top: '18%',
            left: '22%',
            width: '38%',
            height: '26%',
            background:
              'radial-gradient(circle, rgba(255,255,255,0.55) 0%, transparent 70%)',
            filter: 'blur(2px)',
          }}
        />
        {/* Inner orbit dot */}
        <div
          className="absolute anim-orb-rotate"
          style={{
            inset: 0,
            animationDuration: '7s',
          }}
        >
          <div
            className="absolute rounded-full bg-ox-gold-soft"
            style={{
              top: '-4px',
              left: '50%',
              width: 8,
              height: 8,
              transform: 'translateX(-50%)',
              boxShadow: '0 0 10px rgba(232,200,98,0.9)',
            }}
          />
        </div>
      </div>
    </div>
  );
}
