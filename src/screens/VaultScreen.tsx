import { useState, useEffect, useMemo } from 'react';
import {
  ChevronLeft,
  Search,
  Plus,
  FileText,
  Bookmark,
  Folder,
  Star,
  Clock,
  X,
  Trash2,
  type LucideIcon,
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { haptic } from '@/lib/haptics';
import { useAuth } from '@/lib/auth/AuthContext';
import { savedItemsRepository } from '@/lib/repositories';
import type { SavedItem } from '@/lib/types';

interface VaultScreenProps {
  onBack: () => void;
}

type Category = 'all' | 'notes' | 'bookmarks' | 'collections' | 'favorites';

const categories: { key: Category; label: string; icon: LucideIcon }[] = [
  { key: 'all', label: 'All', icon: FileText },
  { key: 'notes', label: 'Notes', icon: FileText },
  { key: 'bookmarks', label: 'Bookmarks', icon: Bookmark },
  { key: 'collections', label: 'Collections', icon: Folder },
  { key: 'favorites', label: 'Favorites', icon: Star },
];

export function VaultScreen({ onBack }: VaultScreenProps) {
  const { user } = useAuth();
  const [items, setItems] = useState<SavedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState<Category>('all');
  const [search, setSearch] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const data = await savedItemsRepository.fetch(user.id);
        if (!cancelled) setItems(data);
      } catch { /* no-op */ } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [user]);

  const filtered = useMemo(() => {
    let result = items;
    if (category === 'favorites') {
      result = items.filter((i) => (i.metadata as { favorite?: boolean }).favorite);
    } else if (category === 'notes') {
      result = items.filter((i) => i.item_type === 'article');
    } else if (category === 'bookmarks') {
      result = items.filter((i) => i.item_type === 'post');
    } else if (category === 'collections') {
      result = items.filter((i) => (i.metadata as { collection?: boolean }).collection);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter((i) => i.title.toLowerCase().includes(q));
    }
    return result;
  }, [items, category, search]);

  const handleAdd = async () => {
    if (!user || !newTitle.trim()) return;
    setAdding(true);
    haptic('medium');
    try {
      await savedItemsRepository.add(user.id, {
        item_type: 'article',
        item_id: crypto.randomUUID(),
        title: newTitle.trim(),
        metadata: { content: newContent.trim(), favorite: false },
      });
      const data = await savedItemsRepository.fetch(user.id);
      setItems(data);
      setNewTitle('');
      setNewContent('');
      setShowAdd(false);
    } catch { /* no-op */ } finally {
      setAdding(false);
    }
  };

  const handleDelete = async (id: string) => {
    haptic('warning');
    try {
      await savedItemsRepository.remove(id);
      setItems((prev) => prev.filter((i) => i.id !== id));
    } catch { /* no-op */ }
  };

  const toggleFavorite = async (item: SavedItem) => {
    haptic('tick');
    const meta = item.metadata as { favorite?: boolean; content?: string };
    const newMeta = { ...meta, favorite: !meta.favorite };
    setItems((prev) => prev.map((i) => (i.id === item.id ? { ...i, metadata: newMeta } : i)));
    try {
      await savedItemsRepository.update(item.id, { metadata: newMeta });
    } catch {
      setItems((prev) => prev.map((i) => (i.id === item.id ? { ...i, metadata: meta } : i)));
    }
  };

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <header className="flex items-center gap-3 px-5 pt-5 pb-3">
        <button
          onClick={() => { haptic('light'); onBack(); }}
          aria-label="Back"
          className="pressable flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-white/70 transition-all hover:border-ox-gold/30 hover:text-ox-gold-soft"
        >
          <ChevronLeft size={20} />
        </button>
        <h1 className="text-xl font-semibold text-white">Knowledge Vault</h1>
        <button
          onClick={() => { haptic('light'); setShowAdd(true); }}
          aria-label="Add item"
          className="pressable ml-auto flex h-10 w-10 items-center justify-center rounded-full border border-ox-gold/30 bg-ox-gold/10 text-ox-gold-soft transition-all hover:bg-ox-gold/20"
        >
          <Plus size={20} />
        </button>
      </header>

      {/* Search */}
      <div className="px-5 pb-3">
        <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-2.5 transition-colors focus-within:border-ox-gold/40">
          <Search size={17} className="text-white/40" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search vault..."
            className="w-full bg-transparent text-[14px] text-white placeholder:text-white/30 outline-none"
          />
          {search && (
            <button onClick={() => setSearch('')} className="pressable text-white/30 hover:text-white">
              <X size={16} />
            </button>
          )}
        </div>
      </div>

      {/* Category chips */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar px-5 pb-3">
        {categories.map((c) => {
          const Icon = c.icon;
          const active = category === c.key;
          return (
            <button
              key={c.key}
              onClick={() => { haptic('tick'); setCategory(c.key); }}
              className={[
                'pressable flex items-center gap-1.5 rounded-full border px-3.5 py-2 text-[12px] font-medium transition-all whitespace-nowrap',
                active
                  ? 'border-ox-gold/40 bg-ox-gold/15 text-ox-gold-soft'
                  : 'border-white/10 bg-white/[0.03] text-white/50 hover:text-white/70',
              ].join(' ')}
            >
              <Icon size={14} />
              {c.label}
            </button>
          );
        })}
      </div>

      {/* Items */}
      <div className="flex-1 overflow-y-auto no-scrollbar px-5 pb-28">
        {loading ? (
          <div className="space-y-3">
            {[0, 1, 2, 3].map((i) => <Skeleton key={i} className="h-20 w-full" />)}
          </div>
        ) : filtered.length === 0 ? (
          <Card>
            <EmptyState
              icon={<Folder size={28} />}
              title={search ? 'No results found' : 'Vault is empty'}
              subtitle={search ? 'Try a different search term' : 'Save notes, bookmarks, and intelligence here'}
              action={
                !search ? (
                  <button onClick={() => { haptic('light'); setShowAdd(true); }} className="pressable mt-1 rounded-xl border border-ox-gold/30 bg-ox-gold/10 px-4 py-2 text-[12px] font-medium text-ox-gold-soft">
                    Add your first item
                  </button>
                ) : undefined
              }
            />
          </Card>
        ) : (
          <div className="space-y-3">
            {filtered.map((item, i) => {
              const meta = item.metadata as { favorite?: boolean; content?: string };
              return (
                <Card key={item.id} className="anim-fade-up p-4" >
                  <div style={{ animationDelay: `${i * 0.04}s` }}>
                    <div className="flex items-start gap-3">
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/[0.04] text-white/50">
                        {item.item_type === 'post' ? <Bookmark size={17} /> : <FileText size={17} />}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="text-[14px] font-medium text-white/90 line-clamp-1">{item.title}</p>
                        {meta.content && (
                          <p className="mt-1 text-[12px] text-white/40 line-clamp-2">{meta.content}</p>
                        )}
                        <p className="mt-1.5 flex items-center gap-1 text-[10px] text-white/30">
                          <Clock size={11} /> {new Date(item.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex flex-col gap-2">
                        <button
                          onClick={() => toggleFavorite(item)}
                          className={[
                            'pressable transition-colors',
                            meta.favorite ? 'text-ox-gold-soft' : 'text-white/25 hover:text-white/50',
                          ].join(' ')}
                        >
                          <Star size={16} fill={meta.favorite ? 'currentColor' : 'none'} />
                        </button>
                        <button
                          onClick={() => handleDelete(item.id)}
                          className="pressable text-white/25 transition-colors hover:text-rose-400"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Add modal */}
      {showAdd && (
        <div className="absolute inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm" onClick={() => setShowAdd(false)}>
          <div className="anim-slide-in-right w-full max-w-[440px] rounded-t-3xl border border-white/10 bg-ox-card p-6 pb-8" onClick={(e) => e.stopPropagation()}>
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-white">New Note</h3>
              <button onClick={() => setShowAdd(false)} className="pressable text-white/40 hover:text-white">
                <X size={20} />
              </button>
            </div>
            <div className="space-y-3">
              <input
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="Title"
                className="w-full rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-[15px] text-white placeholder:text-white/30 outline-none focus:border-ox-gold/40"
              />
              <textarea
                value={newContent}
                onChange={(e) => setNewContent(e.target.value)}
                placeholder="Write something..."
                rows={4}
                className="w-full resize-none rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-[14px] text-white placeholder:text-white/30 outline-none focus:border-ox-gold/40"
              />
            </div>
            <div className="mt-5 flex gap-3">
              <Button variant="ghost" fullWidth onClick={() => setShowAdd(false)}>Cancel</Button>
              <Button fullWidth onClick={handleAdd} disabled={adding || !newTitle.trim()}>
                {adding ? 'Saving…' : 'Save Note'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
