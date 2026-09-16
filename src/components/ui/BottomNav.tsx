import { Home, Sparkles, PlusCircle, Bell, User } from 'lucide-react';
import { haptic } from '@/lib/haptics';

export type TabKey = 'home' | 'ox' | 'create' | 'alerts' | 'profile';

interface NavBarProps {
  active: TabKey;
  onChange: (tab: TabKey) => void;
}

const tabs: { key: TabKey; label: string; icon: typeof Home }[] = [
  { key: 'home', label: 'Home', icon: Home },
  { key: 'ox', label: 'Ox', icon: Sparkles },
  { key: 'create', label: 'Create', icon: PlusCircle },
  { key: 'alerts', label: 'Alerts', icon: Bell },
  { key: 'profile', label: 'Profile', icon: User },
];

export function BottomNav({ active, onChange }: NavBarProps) {
  return (
    <nav className="absolute inset-x-0 bottom-0 z-30">
      <div className="mx-3 mb-3 rounded-[26px] border border-white/[0.08] glass-nav shadow-float">
        <div className="flex items-stretch justify-between px-2 py-2">
          {tabs.map((t) => {
            const isActive = active === t.key;
            const Icon = t.icon;
            const isCreate = t.key === 'create';
            return (
              <button
                key={t.key}
                onClick={() => {
                  haptic(isCreate ? 'medium' : 'tick');
                  onChange(t.key);
                }}
                className="relative flex flex-1 flex-col items-center gap-1 py-1.5 pressable"
              >
                {isCreate ? (
                  <span
                    className={[
                      'flex h-11 w-11 items-center justify-center rounded-2xl transition-all duration-300',
                      isActive
                        ? 'bg-gradient-to-br from-[#f4e09c] via-[#d4af37] to-[#9c7b1f] text-black shadow-gold scale-105'
                        : 'bg-white/5 text-white border border-white/10',
                    ].join(' ')}
                  >
                    <Icon size={22} />
                  </span>
                ) : (
                  <span
                    className={[
                      'flex h-9 w-9 items-center justify-center rounded-xl transition-all duration-300',
                      isActive
                        ? 'text-ox-gold-soft bg-ox-gold/10'
                        : 'text-white/40',
                    ].join(' ')}
                  >
                    <Icon
                      size={20}
                      className={isActive ? 'drop-shadow-[0_0_6px_rgba(212,175,55,0.6)]' : ''}
                    />
                  </span>
                )}
                <span
                  className={[
                    'text-[10px] font-medium tracking-wide transition-colors',
                    isActive ? 'text-ox-gold-soft' : 'text-white/35',
                  ].join(' ')}
                >
                  {t.label}
                </span>
                {/* Active indicator dot */}
                {isActive && !isCreate && (
                  <span className="absolute -top-0.5 h-1 w-1 rounded-full bg-ox-gold shadow-gold" />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
