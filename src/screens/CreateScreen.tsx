import { useState, useRef } from 'react';
import { ImagePlus, Video, Film, Sparkles, Globe2, Lock, Users, Hash, X, Check, Loader2, FileText, type LucideIcon } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { haptic } from '@/lib/haptics';
import { useAuth } from '@/lib/auth/AuthContext';
import { supabase } from '@/lib/supabaseClient';
import { activityRepository } from '@/lib/repositories';
import type { PostContentType } from '@/lib/types';

type Visibility = 'public' | 'private' | 'followers';

type ContentType = PostContentType;

const contentTypeOptions: { key: ContentType; label: string; icon: LucideIcon; desc: string }[] = [
  { key: 'post', label: 'Post', icon: FileText, desc: 'Share intelligence with your network' },
  { key: 'reel', label: 'Reel', icon: Film, desc: 'Short vertical video content' },
  { key: 'video', label: 'Video', icon: Video, desc: 'Longer video content' },
];

const visibilityOptions: { key: Visibility; label: string; icon: typeof Globe2; desc: string }[] = [
  { key: 'public', label: 'Public', icon: Globe2, desc: 'Anyone can view this post' },
  { key: 'private', label: 'Private', icon: Lock, desc: 'Only you can view this post' },
  { key: 'followers', label: 'Followers', icon: Users, desc: 'Only your followers' },
];

export function CreateScreen() {
  const { user } = useAuth();
  const [contentType, setContentType] = useState<ContentType>('post');
  const [caption, setCaption] = useState('');
  const [tags, setTags] = useState<string[]>(['intelligence']);
  const [tagInput, setTagInput] = useState('');
  const [visibility, setVisibility] = useState<Visibility>('public');
  const [showVisibility, setShowVisibility] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [published, setPublished] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [media, setMedia] = useState<string[]>([]);
  const [mediaType, setMediaType] = useState<'image' | 'video'>('image');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isVideoContent = contentType === 'reel' || contentType === 'video';

  const addTag = () => {
    const t = tagInput.trim().replace(/^#/, '');
    if (t && !tags.includes(t)) setTags([...tags, t]);
    setTagInput('');
  };

  const handleMediaSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;
    haptic('tick');
    // Media preview only — actual storage upload requires Supabase Storage.
    // See docs/media-storage.md for setup instructions.
    const urls = files.map((f) => URL.createObjectURL(f));
    setMedia((prev) => [...prev, ...urls].slice(0, isVideoContent ? 1 : 4));
    if (isVideoContent) setMediaType('video');
    e.target.value = '';
  };

  const removeMedia = (idx: number) => {
    haptic('tick');
    setMedia((prev) => prev.filter((_, i) => i !== idx));
  };

  const handlePublish = async () => {
    if (!user) return;
    if (!caption.trim()) {
      haptic('warning');
      setError('Please write a caption before publishing.');
      return;
    }
    haptic('medium');
    setPublishing(true);
    setError(null);
    try {
      const { data: postData, error: insertError } = await supabase
        .from('posts')
        .insert({
          caption: caption.trim(),
          tags,
          visibility,
          media_urls: [],
          content_type: contentType,
          media_type: mediaType,
        })
        .select()
        .single();
      if (insertError) throw insertError;
      await activityRepository.log(user.id, 'publish_post', 'post', postData?.id).catch(() => {});
      setPublished(true);
      haptic('success');
      setTimeout(() => {
        setCaption('');
        setTags(['intelligence']);
        setMedia([]);
        setVisibility('public');
        setContentType('post');
        setMediaType('image');
        setPublished(false);
      }, 2000);
    } catch (err) {
      setError((err as Error).message);
      haptic('warning');
    } finally {
      setPublishing(false);
    }
  };

  const currentVis = visibilityOptions.find((v) => v.key === visibility)!;
  const VisIcon = currentVis.icon;

  return (
    <div className="h-full overflow-y-auto no-scrollbar pb-28">
      <header className="sticky top-0 z-20 flex items-center justify-between glass-nav px-5 py-4">
        <h1 className="text-lg font-semibold text-white">Create</h1>
        <button
          onClick={() => { haptic('tick'); setCaption(''); setTags(['intelligence']); setMedia([]); setContentType('post'); setMediaType('image'); }}
          className="pressable text-sm text-white/50 transition-colors hover:text-white"
        >
          Clear
        </button>
      </header>

      <div className="px-5 pt-2">
        {/* Content type selector */}
        <div className="mb-4 grid grid-cols-3 gap-2">
          {contentTypeOptions.map((opt) => {
            const Icon = opt.icon;
            const active = contentType === opt.key;
            return (
              <button
                key={opt.key}
                onClick={() => {
                  haptic('tick');
                  setContentType(opt.key);
                  setMedia([]);
                  setMediaType(opt.key === 'post' ? 'image' : 'video');
                }}
                className={[
                  'pressable flex flex-col items-center gap-2 rounded-2xl border px-3 py-3 transition-all',
                  active
                    ? 'border-ox-gold/40 bg-ox-gold/10 text-ox-gold-soft'
                    : 'border-white/10 bg-white/[0.03] text-white/50 hover:text-white',
                ].join(' ')}
              >
                <Icon size={20} />
                <span className="text-[12px] font-medium">{opt.label}</span>
              </button>
            );
          })}
        </div>

        <Card className="anim-scale-in sheen p-5">
          {/* Media grid */}
          {media.length > 0 && (
            <div className={isVideoContent ? 'mb-4' : 'mb-4 grid grid-cols-2 gap-2'}>
              {isVideoContent ? (
                <div className="relative aspect-[9/16] max-h-64 overflow-hidden rounded-xl border border-white/10">
                  <video src={media[0]} controls className="h-full w-full object-cover" />
                  <button
                    onClick={() => removeMedia(0)}
                    className="pressable absolute right-1.5 top-1.5 flex h-7 w-7 items-center justify-center rounded-full bg-black/60 text-white/80 backdrop-blur-sm hover:bg-black/80"
                  >
                    <X size={14} />
                  </button>
                </div>
              ) : (
                media.map((url, idx) => (
                  <div key={idx} className="relative aspect-square overflow-hidden rounded-xl border border-white/10">
                    <img src={url} alt="" className="h-full w-full object-cover" />
                    <button
                      onClick={() => removeMedia(idx)}
                      className="pressable absolute right-1.5 top-1.5 flex h-7 w-7 items-center justify-center rounded-full bg-black/60 text-white/80 backdrop-blur-sm hover:bg-black/80"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))
              )}
            </div>
          )}

          {/* Media placeholder */}
          {media.length < (isVideoContent ? 1 : 4) && (
            <button
              onClick={() => { haptic('light'); fileInputRef.current?.click(); }}
              className="group pressable relative flex aspect-[4/3] w-full items-center justify-center overflow-hidden rounded-2xl border border-dashed border-white/15 bg-gradient-to-br from-white/[0.03] to-transparent transition-colors hover:border-ox-gold/40"
            >
              <div className="flex flex-col items-center gap-2 text-white/40 transition-colors group-hover:text-ox-gold-soft">
                {isVideoContent ? <Video size={28} /> : <ImagePlus size={28} />}
                <span className="text-[13px] font-medium">
                  {isVideoContent
                    ? media.length > 0 ? 'Replace video' : 'Add a video'
                    : media.length > 0 ? 'Add more photos' : 'Add a photo'}
                </span>
                <span className="text-[11px] text-white/25">
                  {isVideoContent ? 'MP4 · Up to 1080p' : 'Up to 4 images · 1080p+'}
                </span>
              </div>
            </button>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept={isVideoContent ? 'video/*' : 'image/*'}
            multiple={!isVideoContent}
            className="hidden"
            onChange={handleMediaSelect}
          />

          {/* Caption */}
          <div className="mt-5">
            <label className="text-[11px] font-medium uppercase tracking-wider text-white/40">
              Caption
            </label>
            <textarea
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              rows={4}
              maxLength={500}
              placeholder={isVideoContent ? 'Describe your video…' : 'Share verified intelligence…'}
              className="mt-2 w-full resize-none rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-[15px] leading-relaxed text-white placeholder:text-white/25 outline-none transition-colors focus:border-ox-gold/40"
            />
            <div className="mt-1 flex items-center justify-between text-[11px] text-white/30">
              <span>Ox will fact-check before publish</span>
              <span className={caption.length > 450 ? 'text-rose-400' : ''}>{caption.length}/500</span>
            </div>
          </div>

          {/* AI Assist */}
          <button
            onClick={() => haptic('light')}
            className="pressable mt-4 flex w-full items-center gap-3 rounded-2xl border border-ox-gold/20 bg-gradient-to-r from-ox-gold/10 to-transparent px-4 py-3 text-left transition-all hover:border-ox-gold/40"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-ox-gold/15 text-ox-gold-soft anim-float">
              <Sparkles size={18} />
            </span>
            <div className="flex-1">
              <p className="text-[13px] font-medium text-white">AI Assist</p>
              <p className="text-[11px] text-white/40">Improve tone, add sources, suggest tags</p>
            </div>
            <span className="text-xs text-ox-gold-soft">Run</span>
          </button>

          {/* Tags */}
          <div className="mt-5">
            <label className="text-[11px] font-medium uppercase tracking-wider text-white/40">
              Tags
            </label>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              {tags.map((t) => (
                <span
                  key={t}
                  className="flex items-center gap-1.5 rounded-full border border-ox-gold/25 bg-ox-gold/10 px-3 py-1.5 text-xs text-ox-gold-soft"
                >
                  <Hash size={11} />
                  {t}
                  <button
                    onClick={() => { haptic('tick'); setTags(tags.filter((x) => x !== t)); }}
                    className="pressable ml-0.5 text-ox-gold-soft/60 hover:text-white"
                  >
                    <X size={12} />
                  </button>
                </span>
              ))}
              <div className="flex items-center gap-1 rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5">
                <Hash size={12} className="text-white/30" />
                <input
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addTag();
                    }
                  }}
                  placeholder="Add tag"
                  className="w-20 bg-transparent text-xs text-white placeholder:text-white/25 outline-none"
                />
              </div>
            </div>
          </div>

          {/* Visibility */}
          <div className="mt-5 flex items-center justify-between rounded-2xl border border-white/[0.06] bg-white/[0.02] px-4 py-3">
            <div className="flex items-center gap-3">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/5 text-white/70">
                <VisIcon size={18} />
              </span>
              <div>
                <p className="text-[13px] font-medium text-white">{currentVis.label}</p>
                <p className="text-[11px] text-white/40">{currentVis.desc}</p>
              </div>
            </div>
            <button onClick={() => { haptic('tick'); setShowVisibility(true); }} className="pressable text-xs text-ox-gold-soft">
              Change
            </button>
          </div>

          {/* Error */}
          {error && (
            <p className="mt-3 rounded-xl border border-rose-500/20 bg-rose-500/5 px-3 py-2 text-[12px] text-rose-300">
              {error}
            </p>
          )}

          {/* Publish */}
          <div className="mt-6">
            <Button fullWidth size="lg" onClick={handlePublish} disabled={publishing || published}>
              {published ? (
                <span className="flex items-center gap-2">
                  <Check size={18} /> Published!
                </span>
              ) : publishing ? (
                <span className="flex items-center gap-2">
                  <Loader2 size={18} className="animate-spin" /> Publishing…
                </span>
              ) : (
                `Publish ${contentType === 'reel' ? 'Reel' : contentType === 'video' ? 'Video' : 'Post'}`
              )}
            </Button>
            <p className="mt-2 text-center text-[11px] text-white/25">
              {isVideoContent
                ? 'Video preview only — connect Supabase Storage to upload media files.'
                : 'Ox will run a fact review before your post goes live.'}
            </p>
          </div>
        </Card>
      </div>

      {/* Visibility picker modal */}
      {showVisibility && (
        <div className="absolute inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm" onClick={() => setShowVisibility(false)}>
          <div className="anim-slide-in-right w-full max-w-[440px] rounded-t-3xl border border-white/10 bg-ox-card p-6 pb-8" onClick={(e) => e.stopPropagation()}>
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-white">Post Visibility</h3>
              <button onClick={() => setShowVisibility(false)} className="pressable text-white/40 hover:text-white">
                <X size={20} />
              </button>
            </div>
            <div className="space-y-2">
              {visibilityOptions.map((v) => {
                const Icon = v.icon;
                const active = visibility === v.key;
                return (
                  <button
                    key={v.key}
                    onClick={() => { haptic('tick'); setVisibility(v.key); setShowVisibility(false); }}
                    className={[
                      'pressable flex w-full items-center gap-3 rounded-2xl border px-4 py-3 text-left transition-all',
                      active ? 'border-ox-gold/40 bg-ox-gold/10' : 'border-white/10 bg-white/[0.03] hover:border-white/20',
                    ].join(' ')}
                  >
                    <span className={['flex h-10 w-10 items-center justify-center rounded-xl', active ? 'bg-ox-gold/15 text-ox-gold-soft' : 'bg-white/5 text-white/60'].join(' ')}>
                      <Icon size={18} />
                    </span>
                    <div className="flex-1">
                      <p className="text-[14px] font-medium text-white">{v.label}</p>
                      <p className="text-[11px] text-white/40">{v.desc}</p>
                    </div>
                    {active && <Check size={18} className="text-ox-gold-soft" />}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
