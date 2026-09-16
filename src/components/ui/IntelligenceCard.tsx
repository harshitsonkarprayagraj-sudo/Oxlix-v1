import { Globe, Briefcase, Bot, type LucideIcon } from 'lucide-react';
import { Card } from './Card';

export type IntelligenceCategory = 'world' | 'business' | 'ai';

interface IntelligenceCardProps {
  category: IntelligenceCategory;
  headline: string;
  summary: string;
  importance: 'High' | 'Medium' | 'Rising';
}

const meta: Record<
  IntelligenceCategory,
  { icon: LucideIcon; label: string; tint: string; emoji: string }
> = {
  world: {
    icon: Globe,
    label: 'World',
    tint: 'from-sky-500/15 to-sky-500/0 text-sky-300',
    emoji: '🌍',
  },
  business: {
    icon: Briefcase,
    label: 'Business',
    tint: 'from-emerald-500/15 to-emerald-500/0 text-emerald-300',
    emoji: '💼',
  },
  ai: {
    icon: Bot,
    label: 'AI',
    tint: 'from-ox-gold/20 to-ox-gold/0 text-ox-gold-soft',
    emoji: '🤖',
  },
};

const importanceStyle: Record<string, string> = {
  High: 'bg-ox-gold/15 text-ox-gold-soft border-ox-gold/30',
  Medium: 'bg-white/5 text-white/70 border-white/10',
  Rising: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/25',
};

export function IntelligenceCard({
  category,
  headline,
  summary,
  importance,
}: IntelligenceCardProps) {
  const m = meta[category];
  const Icon = m.icon;
  return (
    <Card hover className="p-5">
      <div className="flex items-center justify-between">
        <div
          className={[
            'inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-medium bg-gradient-to-br border border-white/5',
            m.tint,
          ].join(' ')}
        >
          <Icon size={14} />
          {m.label}
        </div>
        <span
          className={[
            'rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider',
            importanceStyle[importance],
          ].join(' ')}
        >
          {importance}
        </span>
      </div>
      <h3 className="mt-4 text-[17px] font-semibold leading-snug text-white">
        {headline}
      </h3>
      <p className="mt-2 text-[13px] leading-relaxed text-white/55">{summary}</p>
    </Card>
  );
}
