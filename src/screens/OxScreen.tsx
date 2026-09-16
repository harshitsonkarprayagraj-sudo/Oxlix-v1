import { useEffect, useRef, useState, useCallback } from 'react';
import {
  ArrowUp,
  FileText,
  PenLine,
  ListChecks,
  Lightbulb,
  ShieldCheck,
  Mic,
  Paperclip,
  Image as ImageIcon,
  History,
  X,
  Trash2,
  Sparkles,
} from 'lucide-react';
import { AIOrb } from '@/components/ui/AIOrb';
import { Card } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { haptic } from '@/lib/haptics';
import { useAuth } from '@/lib/auth/AuthContext';
import { aiHistoryRepository } from '@/lib/repositories';
import type { AiHistoryEntry } from '@/lib/types';

interface Message {
  id: string;
  from: 'ox' | 'me';
  text: string;
  pending?: boolean;
}

const suggestedPrompts = [
  { icon: FileText, label: 'Review my post' },
  { icon: PenLine, label: 'Improve caption' },
  { icon: ListChecks, label: 'Summarize article' },
  { icon: Lightbulb, label: 'Generate ideas' },
  { icon: ShieldCheck, label: 'Fact review' },
];

const cannedReply = (prompt: string): string => {
  const lower = prompt.toLowerCase();
  if (lower.includes('review'))
    return 'Your post is strong. I would tighten the opening line and add one verifiable source to lift trust.';
  if (lower.includes('caption'))
    return 'Here is a sharper caption: lead with the insight, end with a question that invites verification.';
  if (lower.includes('summar'))
    return 'In one line: verifiable intelligence outperforms polished opinion. Three sources, one claim, zero fluff.';
  if (lower.includes('idea'))
    return 'Three ideas: 1) A weekly trust-score digest. 2) A before/after caption teardown. 3) A sourced counterpoint series.';
  if (lower.includes('fact'))
    return 'Fact review: your core claim is supported. Two of three citations resolve to primary sources — one needs a stronger link.';
  return 'I am Ox, your CEO AI. I can review posts, refine captions, fact-check claims, and summarize intelligence. What would you like to explore?';
};

export function OxScreen() {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [thinking, setThinking] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [history, setHistory] = useState<AiHistoryEntry[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  // Load greeting
  useEffect(() => {
    const hour = new Date().getHours();
    const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';
    const name = user?.email?.split('@')[0] ?? 'there';
    setMessages([{
      id: 'greeting',
      from: 'ox',
      text: `${greeting}, ${name}. I am Ox — your CEO AI. Ask me to review, refine, or fact-check anything.`,
    }]);
  }, [user]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, thinking]);

  const persistMessage = useCallback(async (role: 'user' | 'assistant', content: string) => {
    if (!user) return;
    try {
      await aiHistoryRepository.add(user.id, role, content);
    } catch { /* non-fatal */ }
  }, [user]);

  const send = (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || thinking) return;
    haptic('light');
    const userMsg: Message = { id: `u-${Date.now()}`, from: 'me', text: trimmed };
    setMessages((m) => [...m, userMsg]);
    setInput('');
    setThinking(true);
    void persistMessage('user', trimmed);

    // Simulate streaming-ready response (placeholder for real AI provider)
    setTimeout(() => {
      setThinking(false);
      haptic('tick');
      const reply = cannedReply(trimmed);
      const oxMsg: Message = { id: `o-${Date.now()}`, from: 'ox', text: reply };
      setMessages((m) => [...m, oxMsg]);
      void persistMessage('assistant', reply);
    }, 1100);
  };

  const loadHistory = useCallback(async () => {
    if (!user) return;
    setHistoryLoading(true);
    setShowHistory(true);
    try {
      const data = await aiHistoryRepository.fetch(user.id, 50);
      setHistory(data);
    } catch { /* no-op */ } finally {
      setHistoryLoading(false);
    }
  }, [user]);

  const clearHistory = async () => {
    if (!user) return;
    haptic('warning');
    try {
      await aiHistoryRepository.clear(user.id);
      setHistory([]);
    } catch { /* no-op */ }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    haptic('tick');
    // File upload ready UI — actual upload would connect to storage
    setMessages((m) => [...m, {
      id: `f-${Date.now()}`,
      from: 'me',
      text: `[Attached: ${file.name}] — File analysis ready. Connect an AI provider to process.`,
    }]);
    e.target.value = '';
  };

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <header className="flex items-center justify-between px-5 py-4">
        <div>
          <h1 className="text-lg font-semibold text-white">Ox</h1>
          <p className="text-[11px] text-ox-gold-soft">CEO AI · Trusted Intelligence</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={loadHistory}
            aria-label="Conversation history"
            className="pressable flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-white/70 transition-all hover:border-ox-gold/30 hover:text-ox-gold-soft"
          >
            <History size={18} />
          </button>
          <span className="flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2.5 py-1 text-[10px] font-medium text-emerald-300">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 anim-glow" /> Online
          </span>
        </div>
      </header>

      {/* Orb */}
      <div className="flex justify-center py-2">
        <AIOrb size={130} active={thinking} />
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto no-scrollbar px-5 pb-2">
        <div className="space-y-3">
          {messages.map((m) => (
            <div
              key={m.id}
              className={[
                'anim-fade-up flex',
                m.from === 'me' ? 'justify-end' : 'justify-start',
              ].join(' ')}
            >
              <div
                className={[
                  'max-w-[80%] rounded-2xl px-4 py-2.5 text-[14px] leading-relaxed',
                  m.from === 'me'
                    ? 'bg-gradient-to-br from-[#f4e09c] via-[#d4af37] to-[#9c7b1f] text-black font-medium'
                    : 'glass border border-white/[0.06] text-white/85',
                ].join(' ')}
              >
                {m.text}
              </div>
            </div>
          ))}
          {thinking && (
            <div className="flex justify-start anim-fade-in">
              <div className="glass flex items-center gap-1.5 rounded-2xl border border-white/[0.06] px-4 py-3">
                <Dot /> <Dot delay={0.15} /> <Dot delay={0.3} />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Suggested prompts */}
      <div className="px-5 pb-2">
        <div className="flex gap-2 overflow-x-auto no-scrollbar">
          {suggestedPrompts.map((q) => {
            const Icon = q.icon;
            return (
              <button
                key={q.label}
                onClick={() => send(q.label)}
                disabled={thinking}
                className="pressable flex shrink-0 items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.04] px-3.5 py-2 text-[12px] font-medium text-white/75 transition-all hover:border-ox-gold/30 hover:text-ox-gold-soft disabled:opacity-40"
              >
                <Icon size={13} />
                {q.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Input with voice/file/image ready buttons */}
      <div className="px-3 pb-3">
        <div className="glass flex items-center gap-1.5 rounded-2xl border border-white/10 px-3 py-2 transition-colors focus-within:border-ox-gold/40">
          {/* File attach */}
          <button
            onClick={() => fileInputRef.current?.click()}
            aria-label="Attach file"
            className="pressable flex h-9 w-9 items-center justify-center rounded-lg text-white/40 transition-colors hover:text-ox-gold-soft"
          >
            <Paperclip size={18} />
          </button>
          <input ref={fileInputRef} type="file" className="hidden" onChange={handleFileSelect} />

          {/* Image attach */}
          <button
            onClick={() => imageInputRef.current?.click()}
            aria-label="Attach image"
            className="pressable flex h-9 w-9 items-center justify-center rounded-lg text-white/40 transition-colors hover:text-ox-gold-soft"
          >
            <ImageIcon size={18} />
          </button>
          <input ref={imageInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileSelect} />

          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && send(input)}
            placeholder="Ask Ox anything…"
            className="flex-1 bg-transparent px-2 py-2 text-[15px] text-white placeholder:text-white/30 outline-none"
          />

          {/* Voice input ready */}
          <button
            aria-label="Voice input"
            className="pressable flex h-9 w-9 items-center justify-center rounded-lg text-white/40 transition-colors hover:text-ox-gold-soft"
          >
            <Mic size={18} />
          </button>

          <button
            onClick={() => send(input)}
            disabled={!input.trim() || thinking}
            className="pressable flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#f4e09c] via-[#d4af37] to-[#9c7b1f] text-black transition-all hover:brightness-110 disabled:opacity-40 disabled:saturate-50"
          >
            <ArrowUp size={18} />
          </button>
        </div>
      </div>

      {/* History drawer */}
      {showHistory && (
        <div className="absolute inset-0 z-50 flex flex-col bg-ox-black/95 backdrop-blur-xl anim-fade-up" onClick={() => setShowHistory(false)}>
          <div className="flex items-center justify-between px-5 pt-5 pb-3" onClick={(e) => e.stopPropagation()}>
            <h2 className="flex items-center gap-2 text-lg font-semibold text-white">
              <History size={18} className="text-ox-gold-soft" /> Conversation History
            </h2>
            <div className="flex items-center gap-2">
              {history.length > 0 && (
                <button onClick={clearHistory} className="pressable flex items-center gap-1.5 rounded-lg border border-rose-500/20 bg-rose-500/5 px-3 py-1.5 text-[12px] text-rose-300 hover:bg-rose-500/10">
                  <Trash2 size={14} /> Clear
                </button>
              )}
              <button onClick={() => setShowHistory(false)} className="pressable text-white/40 hover:text-white">
                <X size={22} />
              </button>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto no-scrollbar px-5 pb-10" onClick={(e) => e.stopPropagation()}>
            {historyLoading ? (
              <div className="space-y-3">
                {[0, 1, 2, 3].map((i) => <div key={i} className="skeleton h-16 w-full rounded-2xl" />)}
              </div>
            ) : history.length === 0 ? (
              <Card>
                <EmptyState
                  icon={<Sparkles size={28} />}
                  title="No conversation history yet"
                  subtitle="Your AI chats will be saved here automatically"
                />
              </Card>
            ) : (
              <div className="space-y-2">
                {history.map((h) => (
                  <Card key={h.id} className="p-3">
                    <div className="flex items-start gap-3">
                      <span className={[
                        'flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-[10px] font-bold',
                        h.role === 'user' ? 'bg-ox-gold/10 text-ox-gold-soft' : 'bg-sky-500/10 text-sky-300',
                      ].join(' ')}>
                        {h.role === 'user' ? 'You' : 'Ox'}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="text-[13px] text-white/80 line-clamp-3">{h.content}</p>
                        <p className="mt-1 text-[10px] text-white/30">{new Date(h.created_at).toLocaleString()}</p>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function Dot({ delay = 0 }: { delay?: number }) {
  return (
    <span
      className="h-1.5 w-1.5 rounded-full bg-ox-gold/80"
      style={{ animation: 'ox-glow-pulse 1s ease-in-out infinite', animationDelay: `${delay}s` }}
    />
  );
}
