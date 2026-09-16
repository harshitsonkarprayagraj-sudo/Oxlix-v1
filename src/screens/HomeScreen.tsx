import { useEffect, useState, useMemo } from 'react';
import {
  Newspaper,
  Users,
  ArrowUpRight,
  Search,
  Sparkles,
  TrendingUp,
  Bookmark,
  Activity,
  Zap,
  type LucideIcon,
} from 'lucide-react';
import { Logo } from '@/components/ui/Logo';
import { Card } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { haptic } from '@/lib/haptics';
import { useAuth } from '@/lib/auth/AuthContext';
import { activityRepository, savedItemsRepository } from '@/lib/repositories';
import type { ActivityLog, SavedItem } from '@/lib/types';

interface HomeScreenProps {
  onOpenAlerts: () => void;
  onOpenOx: () => void;
  onOpenNews: () => void;
  onOpenCreators: () => void;
  onOpenProfile: () => void;
  onOpenVault: () => void;
  onOpenSearch: () => void;
}

type CardKey = 'news' | 'creators';

const cards: {
  key: CardKey;
  title: string;
  subtitle: string;
  description: string;
  icon: LucideIcon;
  gradient: string;
  glow: string;
  stat: string;
}[] = [
  {
    key: 'news',
    title: 'Oxlix News',
    subtitle: 'Verified intelligence',
    description: 'Today signals across world, business and AI — curated and fact-reviewed by Ox.',
    icon: Newspaper,
    gradient: 'from-sky-500/20 via-sky-500/5 to-transparent',
    glow: 'rgba(56,189,248,0.25)',
    stat: '12 new today',
  },
  {
    key: 'creators',
    title: 'Oxlix Creators',
    subtitle: 'Trusted voices',
    description: 'Follow verified creators publishing sourced intelligence — no noise, just signal.',
    icon: Users,
    gradient: 'from-ox-gold/25 via-ox-gold/5 to-transparent',
    glow: 'rgba(212,175,55,0.3)',
    stat: '8 active now',
  },
];

const quickActions = [
  { label: 'Ask Ox', icon: Sparkles, tint: 'text-ox-gold-soft bg-ox-gold/10', action: 'ox' },
  { label: 'News', icon: Newspaper, tint: 'text-sky-300 bg-sky-500/10', action: 'news' },
  { label: 'Vault', icon: Bookmark, tint: 'text-emerald-300 bg-emerald-500/10', action: 'vault' },
  { label: 'Trending', icon: TrendingUp, tint: 'text-rose-300 bg-rose-500/10', action: 'trending' },
] as const;

const trendingTopics = [
  { tag: 'AI Regulation', mentions: '2.4k', change: '+18%' },
  { tag: 'Market Signals', mentions: '1.8k', change: '+12%' },
  { tag: 'Climate Tech', mentions: '940', change: '+7%' },
  { tag: 'Cybersecurity', mentions: '1.2k', change: '+5%' },
];

const productivityMetrics = [
  { label: 'Signals Read', value: 47, max: 60, tint: 'bg-sky-500' },
  { label: 'Vault Items', value: 23, max: 30, tint: 'bg-emerald-500' },
  { label: 'AI Chats', value: 12, max: 20, tint: 'bg-ox-gold' },
];

function getGreeting(name: string): string {
  const hour = new Date().getHours();
  const firstName = name.split(' ')[0] || 'there';
  if (hour < 12) return `Good morning, ${firstName}`;
  if (hour < 18) return `Good afternoon, ${firstName}`;
  return `Good evening, ${firstName}`;
}

export function HomeScreen({
  onOpenAlerts,
  onOpenOx,
  onOpenNews,
  onOpenCreators,
  onOpenProfile,
  onOpenVault,
  onOpenSearch,
}: HomeScreenProps) {
  const { profile, user } = useAuth();
  const [pressed, setPressed] = useState<CardKey | null>(null);
  const [loading, setLoading] = useState(true);
  const [activities, setActivities] = useState<ActivityLog[]>([]);
  const [savedItems, setSavedItems] = useState<SavedItem[]>([]);

  const greeting = useMemo(
    () => getGreeting(profile?.name ?? user?.email?.split('@')[0] ?? 'there'),
    [profile?.name, user?.email]
  );

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const [acts, saved] = await Promise.all([
          activityRepository.fetch(user.id, 5).catch(() => []),
          savedItemsRepository.fetch(user.id).catch(() => []),
        ]);
        if (!cancelled) {
          setActivities(acts);
          setSavedItems(saved);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [user]);

  useEffect(() => {
    if (!pressed) return;
    const t = setTimeout(() => setPressed(null), 220);
    return () => clearTimeout(t);
  }, [pressed]);

  const handleTap = (key: CardKey) => {
    haptic('medium');
    setPressed(key);
    setTimeout(() => {
      if (key === 'news') onOpenNews();
      else onOpenCreators();
    }, 180);
  };

  const handleQuickAction = (action: string) => {
    haptic('tick');
    if (action === 'ox') onOpenOx();
    else if (action === 'news') onOpenNews();
    else if (action === 'vault') onOpenVault();
    else if (action === 'trending') onOpenAlerts();
  };

  return (
    <div className="flex h-full flex-col overflow-hidden">
      {/* Top bar */}
      <header className="flex items-center justify-between px-5 pt-5 pb-3">
        <Logo size={34} withWordmark />
        <div className="flex items-center gap-2">
          <button
            onClick={() => { haptic('tick'); onOpenSearch(); }}
            aria-label="Search"
            className="pressable flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-white/70 backdrop-blur-md transition-all hover:border-ox-gold/30 hover:text-ox-gold-soft"
          >
            <Search size={18} />
          </button>
          <button
            onClick={() => { haptic('tick'); onOpenProfile(); }}
            aria-label="Profile and settings"
            className="pressable flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-white/70 backdrop-blur-md transition-all hover:border-ox-gold/30 hover:text-ox-gold-soft"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="8" r="4" />
              <path d="M4 21v-1a8 8 0 0 1 16 0v1" />
            </svg>
          </button>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto no-scrollbar px-5 pb-28">
        {/* Welcome Section */}
        <div className="anim-fade-up">
          <p className="text-sm text-white/40">{greeting}</p>
          <h1 className="mt-1 text-[26px] font-semibold leading-tight text-white">
            Your <span className="text-gold-gradient">intelligence</span> hub.
          </h1>
        </div>

        {/* AI Assistant Card */}
        <button
          onClick={() => { haptic('light'); onOpenOx(); }}
          className="anim-fade-up pressable group relative mt-4 flex w-full items-center gap-4 overflow-hidden rounded-3xl border border-ox-gold/20 bg-gradient-to-r from-ox-gold/[0.1] via-ox-gold/[0.04] to-transparent p-4 text-left transition-all hover:border-ox-gold/40"
          style={{ animationDelay: '0.05s' }}
        >
          <div className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full opacity-50 blur-3xl" style={{ background: 'radial-gradient(circle, rgba(212,175,55,0.3), transparent 70%)' }} />
          <span className="relative flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-ox-gold/15 text-ox-gold-soft anim-float">
            <Sparkles size={24} />
          </span>
          <div className="relative flex-1">
            <p className="text-[15px] font-semibold text-white">Ask Ox, your CEO AI</p>
            <p className="text-[12px] text-white/45">Review posts, summarize, fact-check, and more</p>
          </div>
          <span className="relative flex h-9 w-9 items-center justify-center rounded-full border border-ox-gold/20 bg-white/[0.04] text-ox-gold-soft transition-all group-hover:translate-x-0.5">
            <ArrowUpRight size={17} />
          </span>
        </button>

        {/* Quick Actions */}
        <div className="anim-fade-up mt-5 grid grid-cols-4 gap-3" style={{ animationDelay: '0.1s' }}>
          {quickActions.map((a) => {
            const Icon = a.icon;
            return (
              <button
                key={a.label}
                onClick={() => handleQuickAction(a.action)}
                className="pressable flex flex-col items-center gap-2"
              >
                <span className={`flex h-12 w-12 items-center justify-center rounded-2xl border border-white/[0.06] ${a.tint} transition-transform hover:scale-105`}>
                  <Icon size={20} />
                </span>
                <span className="text-[11px] font-medium text-white/60">{a.label}</span>
              </button>
            );
          })}
        </div>

        {/* Two large cards */}
        <div className="mt-6 space-y-4">
          {cards.map((c, i) => {
            const Icon = c.icon;
            const isPressed = pressed === c.key;
            return (
              <button
                key={c.key}
                onClick={() => handleTap(c.key)}
                className={[
                  'group sheen relative overflow-hidden rounded-[28px] border border-white/10 p-6 text-left transition-all duration-300 anim-fade-up',
                  'bg-gradient-to-br',
                  c.gradient,
                  'hover:border-white/20 hover:-translate-y-1 hover:shadow-float',
                  isPressed ? 'scale-[0.97] brightness-110' : '',
                ].join(' ')}
                style={{
                  animationDelay: `${0.08 * i + 0.15}s`,
                  backdropFilter: 'blur(20px)',
                  WebkitBackdropFilter: 'blur(20px)',
                  boxShadow: '0 12px 40px -12px rgba(0,0,0,0.7), inset 0 1px 0 0 rgba(255,255,255,0.06)',
                }}
              >
                <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full opacity-60 blur-3xl transition-opacity duration-500 group-hover:opacity-100" style={{ background: `radial-gradient(circle, ${c.glow}, transparent 70%)` }} />
                <div className="relative flex items-center justify-between">
                  <span className="flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.06] text-white backdrop-blur-md transition-transform duration-300 group-hover:scale-110">
                    <Icon size={26} />
                  </span>
                  <span className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-white/60 transition-all duration-300 group-hover:border-ox-gold/40 group-hover:text-ox-gold-soft group-hover:translate-x-0.5">
                    <ArrowUpRight size={18} />
                  </span>
                </div>
                <div className="relative mt-5">
                  <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-white/45">{c.subtitle}</p>
                  <h2 className="mt-1.5 text-2xl font-semibold text-white">{c.title}</h2>
                  <p className="mt-2 text-[14px] leading-relaxed text-white/55">{c.description}</p>
                  <p className="mt-3 text-[11px] font-medium text-ox-gold-soft/70">{c.stat}</p>
                </div>
                <div className="relative mt-4 h-px w-full bg-gradient-to-r from-white/10 via-white/5 to-transparent" />
              </button>
            );
          })}
        </div>

        {/* Recent Activity */}
        <section className="mt-6">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="flex items-center gap-2 text-[14px] font-semibold text-white">
              <Activity size={16} className="text-ox-gold-soft" /> Recent Activity
            </h3>
            <button onClick={() => { haptic('tick'); onOpenProfile(); }} className="pressable text-[12px] text-ox-gold-soft/70 hover:text-ox-gold-soft">
              View all
            </button>
          </div>
          <Card className="overflow-hidden p-0">
            {loading ? (
              <div className="space-y-3 p-4">
                {[0, 1, 2].map((i) => <Skeleton key={i} className="h-12 w-full" />)}
              </div>
            ) : activities.length === 0 ? (
              <EmptyState
                icon={<Activity size={24} />}
                title="No recent activity"
                subtitle="Your actions will appear here"
              />
            ) : (
              <div>
                {activities.map((a, i) => (
                  <div key={a.id} className="flex items-center gap-3 px-4 py-3">
                    <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/[0.04] text-white/50">
                      <Zap size={15} />
                    </span>
                    <div className="flex-1">
                      <p className="text-[13px] text-white/80">{a.action.replace(/_/g, ' ')}</p>
                      <p className="text-[11px] text-white/35">{new Date(a.created_at).toLocaleString()}</p>
                    </div>
                    {i < activities.length - 1 && <div className="absolute" />}
                  </div>
                ))}
              </div>
            )}
          </Card>
        </section>

        {/* Saved Intelligence */}
        <section className="mt-6">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="flex items-center gap-2 text-[14px] font-semibold text-white">
              <Bookmark size={16} className="text-ox-gold-soft" /> Saved Intelligence
            </h3>
            <button onClick={() => { haptic('tick'); onOpenVault(); }} className="pressable text-[12px] text-ox-gold-soft/70 hover:text-ox-gold-soft">
              Open vault
            </button>
          </div>
          {loading ? (
            <div className="grid grid-cols-2 gap-3">
              {[0, 1].map((i) => <Skeleton key={i} className="h-24 w-full" />)}
            </div>
          ) : savedItems.length === 0 ? (
            <Card>
              <EmptyState
                icon={<Bookmark size={24} />}
                title="Nothing saved yet"
                subtitle="Bookmark intelligence to find it here"
                action={
                  <button onClick={() => { haptic('tick'); onOpenNews(); }} className="pressable mt-1 rounded-xl border border-ox-gold/30 bg-ox-gold/10 px-4 py-2 text-[12px] font-medium text-ox-gold-soft">
                    Browse news
                  </button>
                }
              />
            </Card>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {savedItems.slice(0, 4).map((s) => (
                <Card key={s.id} className="p-3">
                  <p className="text-[12px] font-medium text-white/80 line-clamp-2">{s.title}</p>
                  <p className="mt-1 text-[10px] text-white/35">{s.item_type}</p>
                </Card>
              ))}
            </div>
          )}
        </section>

        {/* Trending */}
        <section className="mt-6">
          <h3 className="mb-3 flex items-center gap-2 text-[14px] font-semibold text-white">
            <TrendingUp size={16} className="text-ox-gold-soft" /> Trending
          </h3>
          <Card className="overflow-hidden p-0">
            {trendingTopics.map((t, i) => (
              <div key={t.tag}>
                <button onClick={() => { haptic('tick'); onOpenNews(); }} className="pressable flex w-full items-center gap-3 px-4 py-3 text-left">
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-ox-gold/10 text-[12px] font-bold text-ox-gold-soft">
                    {i + 1}
                  </span>
                  <div className="flex-1">
                    <p className="text-[14px] font-medium text-white/90">{t.tag}</p>
                    <p className="text-[11px] text-white/35">{t.mentions} mentions</p>
                  </div>
                  <span className="text-[12px] font-medium text-emerald-400">{t.change}</span>
                </button>
                {i < trendingTopics.length - 1 && <div className="ml-16 h-px bg-white/[0.04]" />}
              </div>
            ))}
          </Card>
        </section>

        {/* Analytics + Productivity Summary */}
        <section className="mt-6">
          <h3 className="mb-3 flex items-center gap-2 text-[14px] font-semibold text-white">
            <Zap size={16} className="text-ox-gold-soft" /> Productivity Summary
          </h3>
          <Card className="space-y-4 p-4">
            {productivityMetrics.map((m) => (
              <div key={m.label}>
                <div className="mb-1.5 flex items-center justify-between">
                  <span className="text-[13px] text-white/70">{m.label}</span>
                  <span className="text-[12px] font-medium text-white/50">{m.value}/{m.max}</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-white/[0.06]">
                  <div
                    className={`h-full rounded-full ${m.tint} transition-all duration-700`}
                    style={{ width: `${(m.value / m.max) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </Card>
        </section>
      </div>
    </div>
  );
}
