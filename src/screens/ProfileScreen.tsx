import { useEffect, useState } from 'react';
import {
  BadgeCheck,
  Grid3x3,
  Bookmark,
  ShieldCheck,
  Sparkles,
  Settings,
  Film,
  Video,
  Zap,
  Star,
  type LucideIcon,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Avatar } from '@/components/ui/Avatar';
import { Skeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { haptic } from '@/lib/haptics';
import { useAuth } from '@/lib/auth/AuthContext';
import { activityRepository, savedItemsRepository, postsRepository } from '@/lib/repositories';
import type { ActivityLog, SavedItem, Post, PostContentType } from '@/lib/types';

interface ProfileScreenProps {
  onOpenSettings: () => void;
  onOpenVault: () => void;
}

type ProfileTab = 'posts' | 'reels' | 'videos' | 'saved';

const tabConfig: { key: ProfileTab; label: string; icon: LucideIcon }[] = [
  { key: 'posts', label: 'Posts', icon: Grid3x3 },
  { key: 'reels', label: 'Reels', icon: Film },
  { key: 'videos', label: 'Videos', icon: Video },
  { key: 'saved', label: 'Saved', icon: Bookmark },
];

export function ProfileScreen({ onOpenSettings, onOpenVault }: ProfileScreenProps) {
  const { profile, user } = useAuth();
  const [tab, setTab] = useState<ProfileTab>('posts');
  const [loading, setLoading] = useState(true);
  const [activities, setActivities] = useState<ActivityLog[]>([]);
  const [savedItems, setSavedItems] = useState<SavedItem[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [reels, setReels] = useState<Post[]>([]);
  const [videos, setVideos] = useState<Post[]>([]);

  const displayName = profile?.name ?? 'Loading…';
  const username = profile?.username ?? 'user';
  const bio = profile?.bio ?? 'Building trust into every signal. I publish verified intelligence and teardowns — no noise, just sources.';
  const avatarUrl = profile?.avatar_url ?? 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=300&h=300&fit=crop';
  const joinDate = profile?.join_date ? new Date(profile.join_date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : '';

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const [acts, saved, userPosts, userReels, userVideos] = await Promise.all([
          activityRepository.fetch(user.id, 20).catch(() => []),
          savedItemsRepository.fetch(user.id).catch(() => []),
          postsRepository.fetchByUserAndType(user.id, 'post').catch(() => []),
          postsRepository.fetchByUserAndType(user.id, 'reel').catch(() => []),
          postsRepository.fetchByUserAndType(user.id, 'video').catch(() => []),
        ]);
        if (!cancelled) {
          setActivities(acts);
          setSavedItems(saved);
          setPosts(userPosts);
          setReels(userReels);
          setVideos(userVideos);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [user]);

  const postCount = posts.length + reels.length + videos.length;

  const stats = [
    { label: 'Posts', value: String(postCount) },
    { label: 'Saved', value: String(savedItems.length) },
    { label: 'Trust Level', value: profile?.trust_score ? `L${Math.min(Math.floor(profile.trust_score / 25) + 1, 5)}` : 'L1' },
  ];

  const renderContentGrid = (items: Post[], emptyTitle: string, emptySubtitle: string, emptyIcon: LucideIcon) => {
    if (items.length === 0) {
      const Icon = emptyIcon;
      return (
        <Card>
          <EmptyState
            icon={<Icon size={24} />}
            title={emptyTitle}
            subtitle={emptySubtitle}
          />
        </Card>
      );
    }
    return (
      <div className="grid grid-cols-3 gap-1.5">
        {items.map((p, i) => (
          <div
            key={p.id}
            className="anim-fade-up aspect-square overflow-hidden rounded-xl border border-white/[0.06] bg-white/[0.02] p-2"
            style={{ animationDelay: `${0.03 * i}s` }}
          >
            <div className="flex h-full w-full flex-col justify-between">
              <p className="text-[10px] leading-tight text-white/70 line-clamp-4">{p.caption}</p>
              <div className="flex items-center gap-1">
                {p.fact_review_status === 'verified' && <BadgeCheck size={12} className="text-ox-gold" />}
                <span className="text-[9px] text-white/30">{new Date(p.created_at).toLocaleDateString()}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="h-full overflow-y-auto no-scrollbar pb-28">
      <header className="sticky top-0 z-20 flex items-center justify-between glass-nav px-5 py-4">
        <h1 className="text-lg font-semibold text-white">Profile</h1>
        <button
          onClick={() => { haptic('light'); onOpenSettings(); }}
          aria-label="Settings"
          className="pressable flex h-10 w-10 items-center justify-center rounded-full bg-white/5 text-white/70 transition-colors hover:bg-white/10 hover:text-ox-gold-soft"
        >
          <Settings size={18} />
        </button>
      </header>

      <div className="px-5 pt-2">
        {/* Profile header */}
        <Card className="anim-scale-in sheen overflow-hidden p-0">
          <div className="relative h-28 bg-gradient-to-r from-ox-gold/20 via-ox-card to-ox-card">
            <div className="absolute inset-0 opacity-40" style={{ background: 'radial-gradient(circle at 30% 0%, rgba(212,175,55,0.4), transparent 60%)' }} />
            <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.5) 1px, transparent 0)', backgroundSize: '20px 20px' }} />
          </div>
          <div className="px-5 pb-5">
            <div className="-mt-14 flex items-end justify-between">
              <Avatar name={displayName} src={avatarUrl} size={100} ring />
              <Button size="sm" variant="outline" onClick={() => haptic('tick')}>Edit Profile</Button>
            </div>
            <div className="mt-3 flex items-center gap-2">
              <h2 className="text-xl font-semibold text-white">{displayName}</h2>
              <BadgeCheck size={18} className="text-ox-gold" />
            </div>
            <p className="text-sm text-white/45">@{username} · Intelligence creator{joinDate ? ` · Joined ${joinDate}` : ''}</p>
            <p className="mt-3 text-[14px] leading-relaxed text-white/70">{bio}</p>

            {/* Trust badge */}
            <div className="mt-4 flex items-center gap-2 rounded-2xl border border-ox-gold/20 bg-gradient-to-r from-ox-gold/10 to-transparent px-4 py-3">
              <ShieldCheck size={18} className="text-ox-gold-soft" />
              <div className="flex-1">
                <p className="text-[13px] font-semibold text-white">Verified Creator</p>
                <p className="text-[11px] text-white/45">Fact-review enabled</p>
              </div>
              <Sparkles size={16} className="text-ox-gold-soft" />
            </div>

            {/* Stats */}
            <div className="mt-4 grid grid-cols-3 gap-2">
              {stats.map((s) => (
                <div key={s.label} className="rounded-2xl border border-white/[0.06] bg-white/[0.02] py-3 text-center transition-colors hover:border-ox-gold/15">
                  <p className="text-lg font-semibold text-white">{s.value}</p>
                  <p className="text-[11px] text-white/40">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </Card>

        {/* Recent Activity */}
        <h2 className="mb-2 mt-6 px-1 text-[11px] font-semibold uppercase tracking-wider text-white/35">Recent Activity</h2>
        <Card className="overflow-hidden p-0">
          {loading ? (
            <div className="space-y-2 p-4">
              {[0, 1, 2].map((i) => <Skeleton key={i} className="h-10 w-full" />)}
            </div>
          ) : activities.length === 0 ? (
            <EmptyState icon={<Zap size={24} />} title="No activity yet" subtitle="Your actions will appear here" />
          ) : (
            <div>
              {activities.slice(0, 5).map((a, i) => (
                <div key={a.id}>
                  <div className="flex items-center gap-3 px-4 py-3">
                    <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/[0.04] text-white/50">
                      <Zap size={14} />
                    </span>
                    <div className="flex-1">
                      <p className="text-[13px] text-white/80">{a.action.replace(/_/g, ' ')}</p>
                      <p className="text-[10px] text-white/30">{new Date(a.created_at).toLocaleDateString()}</p>
                    </div>
                  </div>
                  {i < Math.min(activities.length, 5) - 1 && <div className="ml-16 h-px bg-white/[0.04]" />}
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Tabs */}
        <div className="mt-6 flex items-center gap-2 overflow-x-auto no-scrollbar">
          {tabConfig.map((t) => {
            const Icon = t.icon;
            return (
              <button
                key={t.key}
                onClick={() => { haptic('tick'); setTab(t.key); }}
                className={[
                  'pressable flex shrink-0 items-center gap-1.5 rounded-full px-4 py-2 text-[13px] font-medium transition-all',
                  tab === t.key ? 'bg-ox-gold/15 text-ox-gold-soft' : 'text-white/50 hover:text-white',
                ].join(' ')}
              >
                <Icon size={15} /> {t.label}
              </button>
            );
          })}
        </div>

        {/* Tab content */}
        <div className="mt-3">
          {tab === 'posts' && renderContentGrid(posts, 'No posts yet', 'Your published intelligence will appear here', Grid3x3)}
          {tab === 'reels' && renderContentGrid(reels, 'No reels yet', 'Your short video content will appear here', Film)}
          {tab === 'videos' && renderContentGrid(videos, 'No videos yet', 'Your video content will appear here', Video)}
          {tab === 'saved' && (
            loading ? (
              <div className="grid grid-cols-2 gap-2">
                {[0, 1, 2, 3].map((i) => <Skeleton key={i} className="h-20 w-full" />)}
              </div>
            ) : savedItems.length === 0 ? (
              <Card>
                <EmptyState
                  icon={<Star size={24} />}
                  title="Nothing saved yet"
                  subtitle="Bookmark intelligence to find it here"
                  action={
                    <button onClick={() => { haptic('tick'); onOpenVault(); }} className="pressable mt-1 rounded-xl border border-ox-gold/30 bg-ox-gold/10 px-4 py-2 text-[12px] font-medium text-ox-gold-soft">
                      Open vault
                    </button>
                  }
                />
              </Card>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                {savedItems.slice(0, 6).map((s) => (
                  <Card key={s.id} className="p-3">
                    <p className="text-[12px] font-medium text-white/80 line-clamp-2">{s.title}</p>
                    <p className="mt-1 text-[10px] text-white/35">{new Date(s.created_at).toLocaleDateString()}</p>
                  </Card>
                ))}
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
}
