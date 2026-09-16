import { useEffect, useState } from 'react';
import { ChevronLeft, BadgeCheck, TrendingUp, Users, Eye, Heart, Sparkles, ArrowUpRight } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Avatar } from '@/components/ui/Avatar';
import { Skeleton } from '@/components/ui/Skeleton';
import { haptic } from '@/lib/haptics';

interface CreatorsScreenProps {
  onBack: () => void;
}

interface Creator {
  name: string;
  handle: string;
  avatar: string;
  category: string;
  trustLevel: number;
  followers: string;
  trustScore: number;
  trending?: boolean;
}

const topCreators: Creator[] = [
  {
    name: 'Marcus Vale',
    handle: 'marcusvale',
    avatar: 'https://images.unsplash.com/photo-1500648766898-688d69a7d6e4?w=200&h=200&fit=crop',
    category: 'World Intelligence',
    trustLevel: 5,
    followers: '12.4k',
    trustScore: 98,
    trending: true,
  },
  {
    name: 'Lena Park',
    handle: 'lenapark',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop',
    category: 'Business',
    trustLevel: 4,
    followers: '8.2k',
    trustScore: 95,
  },
  {
    name: 'Idris Cole',
    handle: 'idrisc',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2e?w=200&h=200&fit=crop',
    category: 'AI Research',
    trustLevel: 4,
    followers: '6.7k',
    trustScore: 92,
  },
];

const dashboardStats = [
  { icon: Eye, label: 'Reach', value: '48.2k', change: '+12%', tint: 'text-sky-300' },
  { icon: Heart, label: 'Engagement', value: '3.1k', change: '+8%', tint: 'text-rose-300' },
  { icon: Users, label: 'Followers', value: '4.2k', change: '+5%', tint: 'text-emerald-300' },
  { icon: Sparkles, label: 'Trust Score', value: '96', change: '+2', tint: 'text-ox-gold-soft' },
];

export function CreatorsScreen({ onBack }: CreatorsScreenProps) {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 800);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <header className="flex items-center gap-3 px-5 pt-5 pb-3">
        <button
          onClick={() => {
            haptic('light');
            onBack();
          }}
          aria-label="Back"
          className="pressable flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-white/70 transition-all hover:border-ox-gold/30 hover:text-ox-gold-soft"
        >
          <ChevronLeft size={20} />
        </button>
        <div className="flex-1">
          <h1 className="text-xl font-semibold text-white">Oxlix Creators</h1>
          <p className="text-[11px] text-white/40">Your creator dashboard</p>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto no-scrollbar px-5 pb-28">
        {loading ? (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="rounded-2xl border border-white/[0.06] bg-ox-card p-4">
                  <Skeleton rounded="rounded-xl" className="h-9 w-9" />
                  <Skeleton className="mt-3 h-5 w-16" />
                  <Skeleton className="mt-1 h-3 w-12" />
                </div>
              ))}
            </div>
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="rounded-3xl border border-white/[0.06] bg-ox-card p-4">
                <div className="flex items-center gap-3">
                  <Skeleton rounded="rounded-full" className="h-12 w-12" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-3 w-28" />
                    <Skeleton className="h-2.5 w-20" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <>
            {/* Dashboard stats */}
            <div className="stagger grid grid-cols-2 gap-3">
              {dashboardStats.map((s) => {
                const Icon = s.icon;
                return (
                  <Card key={s.label} hover className="p-4">
                    <div className="flex items-center justify-between">
                      <span className={['flex h-9 w-9 items-center justify-center rounded-xl bg-white/5', s.tint].join(' ')}>
                        <Icon size={17} />
                      </span>
                      <span className="text-[10px] font-medium text-emerald-400">{s.change}</span>
                    </div>
                    <p className="mt-3 text-xl font-semibold text-white">{s.value}</p>
                    <p className="text-[11px] text-white/40">{s.label}</p>
                  </Card>
                );
              })}
            </div>

            {/* Section header */}
            <div className="mt-7 flex items-center justify-between">
              <h2 className="text-[15px] font-semibold tracking-wide text-white">Top Creators</h2>
              <button className="text-[11px] font-medium text-ox-gold-soft">See all</button>
            </div>

            {/* Creator cards */}
            <div className="stagger mt-3 space-y-3">
              {topCreators.map((c, i) => (
                <Card key={c.handle} hover className="sheen p-4">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <Avatar name={c.name} src={c.avatar} size={52} ring={i === 0} />
                      {i === 0 && (
                        <span className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-ox-gold text-[9px] font-bold text-black">
                          1
                        </span>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <span className="truncate text-[15px] font-semibold text-white">{c.name}</span>
                        <BadgeCheck size={15} className="shrink-0 text-ox-gold" />
                        {c.trending && (
                          <span className="flex items-center gap-0.5 rounded-full bg-emerald-500/10 px-1.5 py-0.5 text-[9px] font-medium text-emerald-300">
                            <TrendingUp size={9} /> Hot
                          </span>
                        )}
                      </div>
                      <p className="truncate text-xs text-white/40">@{c.handle} · {c.category}</p>
                      <div className="mt-1.5 flex items-center gap-3 text-[11px] text-white/50">
                        <span>L{c.trustLevel} Trust</span>
                        <span>·</span>
                        <span>{c.followers} followers</span>
                      </div>
                    </div>
                    <button
                      onClick={() => haptic('tick')}
                      className="pressable shrink-0 rounded-full border border-ox-gold/30 px-3.5 py-1.5 text-xs font-medium text-ox-gold-soft transition-colors hover:bg-ox-gold/10"
                    >
                      Follow
                    </button>
                  </div>

                  {/* Trust score bar */}
                  <div className="mt-3.5">
                    <div className="flex items-center justify-between text-[10px] text-white/35">
                      <span>Trust Score</span>
                      <span className="text-ox-gold-soft">{c.trustScore}</span>
                    </div>
                    <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-white/5">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-ox-gold-dim via-ox-gold to-ox-gold-soft transition-all duration-700"
                        style={{ width: `${c.trustScore}%` }}
                      />
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            {/* Become a creator CTA */}
            <Card className="mt-5 overflow-hidden border-ox-gold/15 p-5">
              <div className="flex items-center gap-3">
                <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-ox-gold/15 text-ox-gold-soft anim-float">
                  <Sparkles size={20} />
                </span>
                <div className="flex-1">
                  <p className="text-[14px] font-semibold text-white">Become a verified creator</p>
                  <p className="text-[12px] text-white/45">Publish sourced intelligence and build your trust score.</p>
                </div>
                <ArrowUpRight size={18} className="text-ox-gold-soft" />
              </div>
            </Card>
          </>
        )}
      </div>
    </div>
  );
}
