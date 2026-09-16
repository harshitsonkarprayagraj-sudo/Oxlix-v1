import { Heart, MessageCircle, Share2, Bookmark, BadgeCheck } from 'lucide-react';
import { Card } from './Card';
import { Avatar } from './Avatar';

interface CreatorCardProps {
  name: string;
  handle: string;
  avatar: string;
  verified?: boolean;
  timeAgo: string;
  body: string;
  image?: string;
  likes: number;
  comments: number;
}

function compact(n: number) {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
  return `${n}`;
}

export function CreatorCard({
  name,
  handle,
  avatar,
  verified = false,
  timeAgo,
  body,
  image,
  likes,
  comments,
}: CreatorCardProps) {
  return (
    <Card className="p-5">
      <div className="flex items-center gap-3">
        <Avatar name={name} src={avatar} size={48} />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <span className="truncate text-[15px] font-semibold text-white">
              {name}
            </span>
            {verified && (
              <BadgeCheck size={15} className="shrink-0 text-ox-gold" />
            )}
          </div>
          <div className="flex items-center gap-1.5 text-xs text-white/40">
            <span className="truncate">@{handle}</span>
            <span>·</span>
            <span className="shrink-0">{timeAgo}</span>
          </div>
        </div>
        <button
          aria-label="Follow"
          className="rounded-full border border-ox-gold/30 px-3.5 py-1.5 text-xs font-medium text-ox-gold-soft transition-colors hover:bg-ox-gold/10"
        >
          Follow
        </button>
      </div>

      <p className="mt-4 text-[14px] leading-relaxed text-white/80">{body}</p>

      {image && (
        <div className="mt-4 overflow-hidden rounded-2xl border border-white/[0.06]">
          <img
            src={image}
            alt=""
            className="aspect-[4/3] w-full object-cover"
            loading="lazy"
          />
        </div>
      )}

      <div className="mt-4 flex items-center gap-5 text-white/45">
        <button className="group flex items-center gap-1.5 text-sm transition-colors hover:text-ox-gold-soft">
          <Heart size={17} className="transition-transform group-active:scale-90" />
          {compact(likes)}
        </button>
        <button className="group flex items-center gap-1.5 text-sm transition-colors hover:text-white">
          <MessageCircle size={17} className="transition-transform group-active:scale-90" />
          {compact(comments)}
        </button>
        <button className="group flex items-center gap-1.5 text-sm transition-colors hover:text-white">
          <Share2 size={16} className="transition-transform group-active:scale-90" />
        </button>
        <button className="ml-auto group transition-colors hover:text-ox-gold-soft">
          <Bookmark size={16} className="transition-transform group-active:scale-90" />
        </button>
      </div>
    </Card>
  );
}
