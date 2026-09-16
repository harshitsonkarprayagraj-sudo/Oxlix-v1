import { useEffect, useState } from 'react';
import { ChevronLeft, Globe, Briefcase, Bot, Clock, Bookmark, Share2, Sparkles, type LucideIcon } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { haptic } from '@/lib/haptics';

interface NewsScreenProps {
  onBack: () => void;
}

type Category = 'intelligence' | 'world' | 'business' | 'ai';

interface Article {
  id: number;
  category: Category;
  title: string;
  summary: string;
  source: string;
  time: string;
  readTime: string;
  importance: 'High' | 'Medium' | 'Rising';
  image: string;
}

const catMeta: Record<Category, { icon: LucideIcon; label: string; tint: string }> = {
  intelligence: { icon: Sparkles, label: 'OX Intelligence', tint: 'text-ox-gold-soft bg-ox-gold/10' },
  world: { icon: Globe, label: 'World', tint: 'text-sky-300 bg-sky-500/10' },
  business: { icon: Briefcase, label: 'Business', tint: 'text-emerald-300 bg-emerald-500/10' },
  ai: { icon: Bot, label: 'AI', tint: 'text-ox-gold-soft bg-ox-gold/10' },
};

const importanceStyle: Record<string, string> = {
  High: 'bg-ox-gold/15 text-ox-gold-soft border-ox-gold/30',
  Medium: 'bg-white/5 text-white/70 border-white/10',
  Rising: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/25',
};

const filters: (Category | 'all')[] = ['all', 'intelligence', 'world', 'business', 'ai'];

// Static editorial content — no live API connected.
// OX Intelligence entries are editorial placeholders until an external
// intelligence API feed is connected. See docs/intelligence-feed.md.
const articles: Article[] = [
  {
    id: 1,
    category: 'intelligence',
    title: 'OX Intelligence: Global trust index shifts upward',
    summary:
      'Verified intelligence signals show a 12% increase in cross-source trust scores, driven by improved fact-review pipelines and source transparency.',
    source: 'OX Intelligence Desk',
    time: '1h ago',
    readTime: '5 min',
    importance: 'High',
    image: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&h=500&fit=crop',
  },
  {
    id: 2,
    category: 'intelligence',
    title: 'OX Intelligence: Misinformation velocity down 34% in verified channels',
    summary:
      'Fact-review infrastructure is reducing the spread of unverified claims across monitored intelligence networks.',
    source: 'OX Intelligence Desk',
    time: '2h ago',
    readTime: '4 min',
    importance: 'High',
    image: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7336a3?w=800&h=500&fit=crop',
  },
  {
    id: 3,
    category: 'world',
    title: 'Global supply chains reshape as new trade corridors open',
    summary:
      'Three major corridors shifted overnight, easing pressure on semiconductor and energy markets across Asia and Europe.',
    source: 'Oxlix World Desk',
    time: '2h ago',
    readTime: '4 min',
    importance: 'High',
    image: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&h=500&fit=crop',
  },
  {
    id: 4,
    category: 'ai',
    title: 'New reasoning models raise the bar for fact-grounded output',
    summary:
      'Frontier models now cite sources inline, reshaping how teams evaluate generated content and trust signals.',
    source: 'Oxlix AI Lab',
    time: '3h ago',
    readTime: '6 min',
    importance: 'Medium',
    image: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&h=500&fit=crop',
  },
  {
    id: 5,
    category: 'business',
    title: 'Private capital pivots toward verified intelligence startups',
    summary:
      'Funding flows into trust-layer tooling as investors prioritize verifiable signals over hype-driven metrics.',
    source: 'Oxlix Business',
    time: '5h ago',
    readTime: '3 min',
    importance: 'Rising',
    image: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7336a3?w=800&h=500&fit=crop',
  },
  {
    id: 6,
    category: 'world',
    title: 'Climate policy shifts signal new era of cross-border cooperation',
    summary:
      'A coalition of 24 nations agreed on shared verification standards for emissions reporting, effective Q1.',
    source: 'Oxlix World Desk',
    time: '8h ago',
    readTime: '5 min',
    importance: 'Medium',
    image: 'https://images.unsplash.com/photo-1569163139599-0a45b3a1554f?w=800&h=500&fit=crop',
  },
];

async function shareArticle(title: string, source: string) {
  haptic('tick');
  const shareData = {
    title: `${title} — ${source}`,
    text: title,
    url: window.location.href,
  };
  if (navigator.share) {
    try {
      await navigator.share(shareData);
    } catch {
      // User cancelled — no action needed
    }
  } else if (navigator.clipboard) {
    try {
      await navigator.clipboard.writeText(`${title} — ${source}`);
    } catch {
      // Clipboard not available — no action needed
    }
  }
}

export function NewsScreen({ onBack }: NewsScreenProps) {
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<Category | 'all'>('all');
  const [savedIds, setSavedIds] = useState<Set<number>>(new Set());

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 800);
    return () => clearTimeout(t);
  }, []);

  const intelligenceArticles = articles.filter((a) => a.category === 'intelligence');
  const otherArticles = articles.filter((a) => a.category !== 'intelligence');
  const filtered = filter === 'all' ? articles : articles.filter((a) => a.category === filter);

  const toggleSave = (id: number) => {
    haptic('tick');
    setSavedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const renderArticle = (a: Article, featured = false) => {
    const m = catMeta[a.category];
    const Icon = m.icon;
    return (
      <Card key={a.id} hover className="sheen overflow-hidden p-0">
        <div className={featured ? 'relative h-52 overflow-hidden' : 'relative h-44 overflow-hidden'}>
          <img
            src={a.image}
            alt=""
            className="h-full w-full object-cover transition-transform duration-500 hover:scale-105"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-ox-card via-ox-card/20 to-transparent" />
          <div className="absolute left-4 top-4 flex items-center gap-2">
            <span className={['flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-medium backdrop-blur-md', m.tint].join(' ')}>
              <Icon size={12} />
              {m.label}
            </span>
            <span className={['rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider backdrop-blur-md', importanceStyle[a.importance]].join(' ')}>
              {a.importance}
            </span>
          </div>
        </div>
        <div className="p-5">
          <h3 className="text-[17px] font-semibold leading-snug text-white">{a.title}</h3>
          <p className="mt-2 text-[13px] leading-relaxed text-white/55">{a.summary}</p>
          <div className="mt-4 flex items-center justify-between">
            <div className="flex items-center gap-3 text-[11px] text-white/35">
              <span>{a.source}</span>
              <span>·</span>
              <span>{a.time}</span>
              <span>·</span>
              <span className="flex items-center gap-1">
                <Clock size={11} /> {a.readTime}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => toggleSave(a.id)}
                className={[
                  'pressable flex h-8 w-8 items-center justify-center rounded-full transition-colors',
                  savedIds.has(a.id) ? 'text-ox-gold-soft' : 'text-white/40 hover:text-ox-gold-soft',
                ].join(' ')}
                aria-label={savedIds.has(a.id) ? 'Remove from saved' : 'Save article'}
              >
                <Bookmark size={15} fill={savedIds.has(a.id) ? 'currentColor' : 'none'} />
              </button>
              <button
                onClick={() => shareArticle(a.title, a.source)}
                className="pressable flex h-8 w-8 items-center justify-center rounded-full text-white/40 transition-colors hover:text-white"
                aria-label="Share article"
              >
                <Share2 size={14} />
              </button>
            </div>
          </div>
        </div>
      </Card>
    );
  };

  return (
    <div className="flex h-full flex-col">
      <header className="flex items-center gap-3 px-5 pt-5 pb-3">
        <button
          onClick={() => { haptic('light'); onBack(); }}
          aria-label="Back"
          className="pressable flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-white/70 transition-all hover:border-ox-gold/30 hover:text-ox-gold-soft"
        >
          <ChevronLeft size={20} />
        </button>
        <div className="flex-1">
          <h1 className="text-xl font-semibold text-white">Oxlix News</h1>
          <p className="text-[11px] text-white/40">Verified intelligence, curated daily</p>
        </div>
      </header>

      <div className="flex gap-2 overflow-x-auto no-scrollbar px-5 pb-3">
        {filters.map((f) => (
          <button
            key={f}
            onClick={() => { haptic('tick'); setFilter(f); }}
            className={[
              'shrink-0 rounded-full px-4 py-2 text-[13px] font-medium capitalize transition-all pressable',
              filter === f
                ? 'bg-ox-gold/15 text-ox-gold-soft border border-ox-gold/30'
                : 'bg-white/[0.04] text-white/50 border border-white/10 hover:text-white',
            ].join(' ')}
          >
            {f === 'all' ? 'All' : catMeta[f as Category].label}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar px-5 pb-28">
        {loading ? (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="overflow-hidden rounded-3xl border border-white/[0.06] bg-ox-card">
                <Skeleton rounded="rounded-none" className="h-44 w-full" />
                <div className="space-y-3 p-5">
                  <Skeleton className="h-3 w-20" />
                  <Skeleton className="h-5 w-5/6" />
                  <Skeleton className="h-3 w-4/6" />
                  <div className="flex gap-4">
                    <Skeleton rounded="rounded-full" className="h-6 w-16" />
                    <Skeleton rounded="rounded-full" className="h-6 w-16" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : filter === 'all' ? (
          <div className="stagger space-y-4">
            {/* OX Intelligence featured section — priority placement */}
            {intelligenceArticles.length > 0 && (
              <div>
                <div className="mb-3 flex items-center gap-2">
                  <Sparkles size={16} className="text-ox-gold-soft" />
                  <h2 className="text-[14px] font-semibold text-white">OX Intelligence</h2>
                  <span className="rounded-full bg-ox-gold/15 px-2 py-0.5 text-[10px] font-semibold text-ox-gold-soft">
                    Priority
                  </span>
                </div>
                {renderArticle(intelligenceArticles[0], true)}
                {intelligenceArticles.slice(1).map((a) => renderArticle(a))}
              </div>
            )}
            {/* Regular news */}
            {otherArticles.length > 0 && (
              <div>
                <h2 className="mb-3 mt-4 text-[14px] font-semibold text-white">Latest News</h2>
                {otherArticles.map((a) => renderArticle(a))}
              </div>
            )}
          </div>
        ) : filtered.length === 0 ? (
          <Card>
            <EmptyState
              icon={<Globe size={24} />}
              title="No articles in this category"
              subtitle="Check back soon for new content"
            />
          </Card>
        ) : (
          <div className="stagger space-y-4">
            {filtered.map((a) => renderArticle(a))}
          </div>
        )}
      </div>
    </div>
  );
}
