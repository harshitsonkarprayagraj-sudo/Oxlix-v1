interface AvatarProps {
  name: string;
  src?: string;
  size?: number;
  ring?: boolean;
  className?: string;
}

const initials = (name: string) =>
  name
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

export function Avatar({
  name,
  src,
  size = 44,
  ring = false,
  className = '',
}: AvatarProps) {
  return (
    <div
      className={[
        'relative shrink-0 overflow-hidden rounded-full bg-gradient-to-br from-[#2a2a2a] to-[#111] flex items-center justify-center',
        ring ? 'ring-2 ring-ox-gold/60 ring-offset-2 ring-offset-ox-black' : '',
        className,
      ].join(' ')}
      style={{ width: size, height: size }}
    >
      {src ? (
        <img
          src={src}
          alt={name}
          className="h-full w-full object-cover"
          loading="lazy"
        />
      ) : (
        <span
          className="font-semibold text-white/80"
          style={{ fontSize: size * 0.36 }}
        >
          {initials(name)}
        </span>
      )}
    </div>
  );
}
