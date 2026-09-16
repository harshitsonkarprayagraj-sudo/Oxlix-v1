import { useState, useMemo, useEffect, useRef } from 'react';
import { Search, X, ArrowRight, Clock, FileText, Bookmark, LayoutDashboard, Sparkles, TrendingUp } from 'lucide-react';
import { haptic } from '@/lib/haptics';

interface SearchResult {
  id: string;
  title: string;
  subtitle: string;
  category: 'Dashboard' | 'Vault' | 'Chats' | 'Files';
  icon: typeof FileText;
}

interface GlobalSearchProps {
  open: boolean;
  onClose: () => void;
  onNavigate: (category: string, id: string) => void;
}

const RECENT_KEY = 'oxlix-search-recent';

export function GlobalSearch({ open, onClose, onNavigate }: GlobalSearchProps) {
  const [query, setQuery] = useState('');
  const [recent, setRecent] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      try {
        const stored = localStorage.getItem(RECENT_KEY);
        if (stored) setRecent(JSON.parse(stored));
      } catch { /* no-op */ }
      setTimeout(() => inputRef.current?.focus(), 100);
    } else {
      setQuery('');
    }
  }, [open]);

  const results = useMemo<SearchResult[]>(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase();
    const all: SearchResult[] = [
      { id: 'dash-welcome', title: 'Welcome Section', subtitle: 'Dashboard', category: 'Dashboard', icon: LayoutDashboard },
      { id: 'dash-ai', title: 'AI Assistant', subtitle: 'Dashboard', category: 'Dashboard', icon: Sparkles },
      { id: 'dash-analytics', title: 'Analytics', subtitle: 'Dashboard', category: 'Dashboard', icon: TrendingUp },
      { id: 'vault-notes', title: 'Notes', subtitle: 'Knowledge Vault', category: 'Vault', icon: FileText },
      { id: 'vault-bookmarks', title: 'Bookmarks', subtitle: 'Knowledge Vault', category: 'Vault', icon: Bookmark },
      { id: 'vault-collections', title: 'Collections', subtitle: 'Knowledge Vault', category: 'Vault', icon: FileText },
      { id: 'ox-chat', title: 'Ox AI Chat', subtitle: 'Recent conversation', category: 'Chats', icon: Sparkles },
      { id: 'ox-history', title: 'Conversation History', subtitle: 'AI memory', category: 'Chats', icon: Clock },
    ];
    return all.filter(
      (r) => r.title.toLowerCase().includes(q) || r.subtitle.toLowerCase().includes(q) || r.category.toLowerCase().includes(q)
    );
  }, [query]);

  const saveRecent = (term: string) => {
    const next = [term, ...recent.filter((r) => r !== term)].slice(0, 5);
    setRecent(next);
    try { localStorage.setItem(RECENT_KEY, JSON.stringify(next)); } catch { /* no-op */ }
  };

  const handleSelect = (r: SearchResult) => {
    haptic('tick');
    saveRecent(r.title);
    onNavigate(r.category, r.id);
    onClose();
  };

  if (!open) return null;

  return (
    <div className="absolute inset-0 z-[60] flex flex-col bg-ox-black/95 backdrop-blur-xl anim-fade-up" onClick={onClose}>
      <div className="flex items-center gap-3 px-5 pt-5 pb-3" onClick={(e) => e.stopPropagation()}>
        <div className="flex flex-1 items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 transition-colors focus-within:border-ox-gold/40">
          <Search size={18} className="text-white/40" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search everything..."
            className="w-full bg-transparent text-[15px] text-white placeholder:text-white/30 outline-none"
          />
        </div>
        <button onClick={() => { haptic('light'); onClose(); }} className="pressable text-white/40 hover:text-white">
          <X size={22} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar px-5 pb-10" onClick={(e) => e.stopPropagation()}>
        {!query.trim() && recent.length > 0 && (
          <>
            <p className="mb-2 px-1 text-[11px] font-semibold uppercase tracking-wider text-white/30">Recent</p>
            <div className="space-y-1">
              {recent.map((term) => (
                <button
                  key={term}
                  onClick={() => { haptic('tick'); setQuery(term); }}
                  className="pressable flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors hover:bg-white/[0.04]"
                >
                  <Clock size={16} className="text-white/30" />
                  <span className="text-[14px] text-white/70">{term}</span>
                </button>
              ))}
            </div>
          </>
        )}

        {!query.trim() && recent.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <Search size={32} className="text-white/15" />
            <p className="mt-3 text-[13px] text-white/30">Search chats, vault, files, and dashboard</p>
          </div>
        )}

        {query.trim() && results.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <p className="text-[14px] text-white/40">No results for "{query}"</p>
            <p className="mt-1 text-[12px] text-white/25">Try a different search term</p>
          </div>
        )}

        {query.trim() && results.length > 0 && (
          <>
            <p className="mb-2 px-1 text-[11px] font-semibold uppercase tracking-wider text-white/30">
              {results.length} result{results.length !== 1 ? 's' : ''}
            </p>
            <div className="space-y-1">
              {results.map((r) => {
                const Icon = r.icon;
                return (
                  <button
                    key={r.id}
                    onClick={() => handleSelect(r)}
                    className="pressable flex w-full items-center gap-3 rounded-xl border border-transparent px-3 py-3 text-left transition-all hover:border-white/[0.06] hover:bg-white/[0.03]"
                  >
                    <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/[0.04] text-white/50">
                      <Icon size={16} />
                    </span>
                    <div className="flex-1">
                      <p className="text-[14px] font-medium text-white/90">{r.title}</p>
                      <p className="text-[11px] text-white/35">{r.subtitle} · {r.category}</p>
                    </div>
                    <ArrowRight size={15} className="text-white/20" />
                  </button>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
