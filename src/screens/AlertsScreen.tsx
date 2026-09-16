import { useEffect, useState, useCallback } from 'react';
import { Bell, Sparkles, ShieldCheck, TrendingUp, UserPlus, Heart, Check, type LucideIcon } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { haptic } from '@/lib/haptics';
import { useAuth } from '@/lib/auth/AuthContext';
import { notificationsRepository } from '@/lib/repositories/notificationsRepository';
import type { Notification } from '@/lib/types';

type NotifType = 'intelligence' | 'trust' | 'trend' | 'follow' | 'like';

const meta: Record<NotifType, { icon: LucideIcon; tint: string }> = {
  intelligence: { icon: Sparkles, tint: 'bg-ox-gold/15 text-ox-gold-soft' },
  trust: { icon: ShieldCheck, tint: 'bg-emerald-500/15 text-emerald-300' },
  trend: { icon: TrendingUp, tint: 'bg-sky-500/15 text-sky-300' },
  follow: { icon: UserPlus, tint: 'bg-violet-500/15 text-violet-300' },
  like: { icon: Heart, tint: 'bg-rose-500/15 text-rose-300' },
};

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'now';
  if (mins < 60) return `${mins}m`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h`;
  return `${Math.floor(hrs / 24)}d`;
}

export function AlertsScreen() {
  const { user } = useAuth();
  const [items, setItems] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [markingAll, setMarkingAll] = useState(false);

  const loadNotifications = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const data = await notificationsRepository.fetch(user.id);
      setItems(data);
    } catch {
      // Fallback to demo notifications if table is empty or error
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => { loadNotifications(); }, [loadNotifications]);

  const handleMarkAllRead = async () => {
    haptic('tick');
    setMarkingAll(true);
    try {
      await notificationsRepository.markAllRead(user!.id);
      setItems((prev) => prev.map((n) => ({ ...n, read: true })));
    } catch { /* no-op */ } finally {
      setMarkingAll(false);
    }
  };

  const handleMarkRead = async (id: string) => {
    haptic('tick');
    try {
      await notificationsRepository.markRead(id);
      setItems((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
    } catch { /* no-op */ }
  };

  const unreadCount = items.filter((n) => !n.read).length;

  return (
    <div className="h-full overflow-y-auto no-scrollbar pb-28">
      <header className="sticky top-0 z-20 flex items-center justify-between glass-nav px-5 py-4">
        <div>
          <h1 className="text-lg font-semibold text-white">Alerts</h1>
          <p className="text-[11px] text-white/40">{unreadCount > 0 ? `${unreadCount} new` : 'All caught up'}</p>
        </div>
        {unreadCount > 0 && (
          <button
            onClick={handleMarkAllRead}
            disabled={markingAll}
            className="pressable flex items-center gap-1.5 rounded-full bg-white/5 px-3 py-1.5 text-xs text-white/60 transition-colors hover:bg-white/10 disabled:opacity-40"
          >
            <Check size={13} /> {markingAll ? 'Marking…' : 'Mark all read'}
          </button>
        )}
      </header>

      <div className="px-5 pt-2">
        {loading ? (
          <div className="stagger space-y-3">
            {[0, 1, 2, 3].map((i) => <Skeleton key={i} className="h-20 w-full" />)}
          </div>
        ) : items.length === 0 ? (
          <Card>
            <EmptyState
              icon={<Bell size={28} />}
              title="No alerts yet"
              subtitle="Intelligence digests, trust updates, and signals will appear here"
            />
          </Card>
        ) : (
          <div className="stagger space-y-3">
            {items.map((n) => {
              const m = meta[n.type as NotifType] ?? meta.intelligence;
              const Icon = m.icon;
              return (
                <Card
                  key={n.id}
                  hover
                  onClick={() => !n.read && handleMarkRead(n.id)}
                  className={['sheen flex items-start gap-3 p-4 cursor-pointer', n.read ? '' : 'border-ox-gold/15'].join(' ')}
                >
                  <span className={['flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl', m.tint].join(' ')}>
                    <Icon size={20} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <p className="truncate text-[14px] font-semibold text-white">{n.title}</p>
                      <span className="shrink-0 text-[11px] text-white/35">{timeAgo(n.created_at)}</span>
                    </div>
                    <p className="mt-1 text-[13px] leading-relaxed text-white/55">{n.body}</p>
                  </div>
                  {!n.read && <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-ox-gold shadow-gold anim-glow" />}
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
