import { useState, useEffect, useMemo } from 'react';
import {
  ChevronLeft,
  Bell,
  Moon,
  Globe,
  Shield,
  HelpCircle,
  LogOut,
  Volume2,
  ChevronRight,
  Mail,
  KeyRound,
  Trash2,
  X,
  Smartphone,
  Monitor,
  MapPin,
  Clock,
  Eye,
  Lock,
  CheckCircle2,
  type LucideIcon,
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { haptic } from '@/lib/haptics';
import { useAuth } from '@/lib/auth/AuthContext';

interface SettingsScreenProps {
  onBack: () => void;
}

interface ToggleDef {
  icon: LucideIcon;
  label: string;
  sublabel: string;
  tint: string;
  key: 'push_notifications' | 'haptic_feedback' | 'dark_mode';
}

interface LinkDef {
  icon: LucideIcon;
  label: string;
  sublabel: string;
  tint: string;
  action: 'language' | 'privacy' | 'help' | 'changeEmail' | 'changePassword' | 'deleteAccount';
}

const toggles: ToggleDef[] = [
  { icon: Bell, label: 'Push Notifications', sublabel: 'Intelligence digests & alerts', tint: 'text-ox-gold-soft bg-ox-gold/10', key: 'push_notifications' },
  { icon: Volume2, label: 'Haptic Feedback', sublabel: 'Vibration on tap', tint: 'text-sky-300 bg-sky-500/10', key: 'haptic_feedback' },
  { icon: Moon, label: 'Dark Mode', sublabel: 'Always on', tint: 'text-violet-300 bg-violet-500/10', key: 'dark_mode' },
];

const links: LinkDef[] = [
  { icon: Globe, label: 'Language', sublabel: 'English', tint: 'text-emerald-300 bg-emerald-500/10', action: 'language' },
  { icon: Shield, label: 'Privacy & Security', sublabel: 'Trust settings, data', tint: 'text-rose-300 bg-rose-500/10', action: 'privacy' },
  { icon: HelpCircle, label: 'Help & Support', sublabel: 'FAQ, contact us', tint: 'text-sky-300 bg-sky-500/10', action: 'help' },
];

const accountLinks: LinkDef[] = [
  { icon: Mail, label: 'Change Email', sublabel: 'Update your email address', tint: 'text-sky-300 bg-sky-500/10', action: 'changeEmail' },
  { icon: KeyRound, label: 'Change Password', sublabel: 'Update your password', tint: 'text-ox-gold-soft bg-ox-gold/10', action: 'changePassword' },
  { icon: Trash2, label: 'Delete Account', sublabel: 'Permanently remove your account', tint: 'text-rose-300 bg-rose-500/10', action: 'deleteAccount' },
];

type ModalType = 'changeEmail' | 'changePassword' | 'deleteAccount' | null;
type PanelType = 'security' | null;

export function SettingsScreen({ onBack }: SettingsScreenProps) {
  const { profile, settings, user, signOut, deleteAccount, updateEmail, updatePassword, updateSettings } = useAuth();
  const [modal, setModal] = useState<ModalType>(null);
  const [modalInput, setModalInput] = useState('');
  const [modalError, setModalError] = useState<string | null>(null);
  const [modalSubmitting, setModalSubmitting] = useState(false);
  const [modalSuccess, setModalSuccess] = useState<string | null>(null);
  const [panel, setPanel] = useState<PanelType>(null);

  // Sync toggle states from cloud settings
  const [localToggles, setLocalToggles] = useState<Record<string, boolean>>({
    'Push Notifications': settings?.push_notifications ?? true,
    'Haptic Feedback': settings?.haptic_feedback ?? true,
    'Dark Mode': settings?.dark_mode ?? true,
  });

  useEffect(() => {
    setLocalToggles({
      'Push Notifications': settings?.push_notifications ?? true,
      'Haptic Feedback': settings?.haptic_feedback ?? true,
      'Dark Mode': settings?.dark_mode ?? true,
    });
  }, [settings]);

  const flip = async (t: ToggleDef) => {
    haptic('tick');
    const newVal = !localToggles[t.label];
    setLocalToggles((s) => ({ ...s, [t.label]: newVal }));
    try {
      await updateSettings({ [t.key]: newVal });
    } catch {
      // Revert on failure
      setLocalToggles((s) => ({ ...s, [t.label]: !newVal }));
    }
  };

  const openModal = (type: ModalType) => {
    haptic('light');
    setModal(type);
    setModalInput('');
    setModalError(null);
    setModalSuccess(null);
  };

  const openPanel = (p: PanelType) => {
    haptic('light');
    setPanel(p);
  };

  const closePanel = () => {
    haptic('tick');
    setPanel(null);
  };

  // Device + session info (computed from browser)
  const deviceInfo = useMemo(() => {
    const ua = navigator.userAgent;
    const isMobile = /Mobi|Android|iPhone|iPad/i.test(ua);
    const browser = /Edg/i.test(ua) ? 'Edge' : /Chrome/i.test(ua) ? 'Chrome' : /Firefox/i.test(ua) ? 'Firefox' : /Safari/i.test(ua) ? 'Safari' : 'Browser';
    const os = /Android/i.test(ua) ? 'Android' : /iPhone|iPad/i.test(ua) ? 'iOS' : /Mac/i.test(ua) ? 'macOS' : /Win/i.test(ua) ? 'Windows' : /Linux/i.test(ua) ? 'Linux' : 'Unknown';
    return { isMobile, browser, os, device: isMobile ? 'Mobile' : 'Desktop' };
  }, []);

  const sessionInfo = useMemo(() => {
    const now = new Date();
    const hour = now.getHours();
    const greeting = hour < 12 ? 'Morning' : hour < 18 ? 'Afternoon' : 'Evening';
    return { greeting, time: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) };
  }, []);

  const closeModal = () => {
    haptic('tick');
    setModal(null);
    setModalError(null);
    setModalSuccess(null);
  };

  const handleModalSubmit = async () => {
    if (!modal) return;
    setModalError(null);
    setModalSuccess(null);
    setModalSubmitting(true);

    try {
      if (modal === 'changeEmail') {
        if (!modalInput.trim()) {
          setModalError('Please enter a new email.');
          setModalSubmitting(false);
          return;
        }
        await updateEmail(modalInput.trim());
        setModalSuccess('Email updated. Check your inbox to confirm.');
      } else if (modal === 'changePassword') {
        if (!modalInput.trim() || modalInput.length < 6) {
          setModalError('Password must be at least 6 characters.');
          setModalSubmitting(false);
          return;
        }
        await updatePassword(modalInput.trim());
        setModalSuccess('Password updated successfully.');
      } else if (modal === 'deleteAccount') {
        if (modalInput !== 'DELETE') {
          setModalError('Type DELETE to confirm.');
          setModalSubmitting(false);
          return;
        }
        await deleteAccount();
      }
    } catch (err) {
      setModalError((err as Error).message);
    } finally {
      setModalSubmitting(false);
    }
  };

  const displayName = profile?.name ?? 'Loading…';
  const displayEmail = profile?.email ?? user?.email ?? '';
  const avatarUrl = profile?.avatar_url ?? 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&h=200&fit=crop';

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
        <h1 className="text-xl font-semibold text-white">Settings</h1>
      </header>

      <div className="flex-1 overflow-y-auto no-scrollbar px-5 pb-10">
        {/* Account card */}
        <Card className="anim-fade-up sheen flex items-center gap-3 p-4">
          <Avatar name={displayName} src={avatarUrl} size={52} ring />
          <div className="flex-1">
            <p className="text-[15px] font-semibold text-white">{displayName}</p>
            <p className="text-[12px] text-white/40">{displayEmail} · Trust Level 4</p>
          </div>
          <ChevronRight size={18} className="text-white/30" />
        </Card>

        {/* Preferences */}
        <h2 className="mt-6 mb-2 px-1 text-[11px] font-semibold uppercase tracking-wider text-white/35">
          Preferences
        </h2>
        <Card className="anim-fade-up overflow-hidden p-0">
          {toggles.map((t, i) => {
            const Icon = t.icon;
            const isOn = localToggles[t.label] ?? true;
            return (
              <div key={t.label}>
                <button
                  onClick={() => flip(t)}
                  className="pressable flex w-full items-center gap-3 px-4 py-3.5 text-left"
                >
                  <span className={['flex h-10 w-10 items-center justify-center rounded-xl', t.tint].join(' ')}>
                    <Icon size={18} />
                  </span>
                  <div className="flex-1">
                    <p className="text-[14px] font-medium text-white">{t.label}</p>
                    <p className="text-[11px] text-white/40">{t.sublabel}</p>
                  </div>
                  <span
                    className={[
                      'relative h-6 w-11 rounded-full transition-colors duration-300',
                      isOn ? 'bg-ox-gold' : 'bg-white/10',
                    ].join(' ')}
                  >
                    <span
                      className={[
                        'absolute top-0.5 h-5 w-5 rounded-full bg-white shadow-md transition-all duration-300',
                        isOn ? 'left-[22px]' : 'left-0.5',
                      ].join(' ')}
                    />
                  </span>
                </button>
                {i < toggles.length - 1 && <div className="ml-16 h-px bg-white/[0.04]" />}
              </div>
            );
          })}
        </Card>

        {/* Account management */}
        <h2 className="mt-6 mb-2 px-1 text-[11px] font-semibold uppercase tracking-wider text-white/35">
          Account
        </h2>
        <Card className="anim-fade-up overflow-hidden p-0">
          {accountLinks.map((l, i) => {
            const Icon = l.icon;
            const isDelete = l.action === 'deleteAccount';
            return (
              <div key={l.label}>
                <button
                  onClick={() => openModal(l.action as ModalType)}
                  className="pressable flex w-full items-center gap-3 px-4 py-3.5 text-left"
                >
                  <span className={['flex h-10 w-10 items-center justify-center rounded-xl', l.tint].join(' ')}>
                    <Icon size={18} />
                  </span>
                  <div className="flex-1">
                    <p className={['text-[14px] font-medium', isDelete ? 'text-rose-300' : 'text-white'].join(' ')}>
                      {l.label}
                    </p>
                    <p className="text-[11px] text-white/40">{l.sublabel}</p>
                  </div>
                  <ChevronRight size={17} className="text-white/25" />
                </button>
                {i < accountLinks.length - 1 && <div className="ml-16 h-px bg-white/[0.04]" />}
              </div>
            );
          })}
        </Card>

        {/* General */}
        <h2 className="mt-6 mb-2 px-1 text-[11px] font-semibold uppercase tracking-wider text-white/35">
          General
        </h2>
        <Card className="anim-fade-up overflow-hidden p-0">
          {links.map((l, i) => {
            const Icon = l.icon;
            return (
              <div key={l.label}>
                <button
                  onClick={() => l.action === 'privacy' ? openPanel('security') : haptic('tick')}
                  className="pressable flex w-full items-center gap-3 px-4 py-3.5 text-left"
                >
                  <span className={['flex h-10 w-10 items-center justify-center rounded-xl', l.tint].join(' ')}>
                    <Icon size={18} />
                  </span>
                  <div className="flex-1">
                    <p className="text-[14px] font-medium text-white">{l.label}</p>
                    <p className="text-[11px] text-white/40">{l.sublabel}</p>
                  </div>
                  <ChevronRight size={17} className="text-white/25" />
                </button>
                {i < links.length - 1 && <div className="ml-16 h-px bg-white/[0.04]" />}
              </div>
            );
          })}
        </Card>

        {/* Sign out */}
        <button
          onClick={async () => {
            haptic('medium');
            await signOut();
          }}
          className="pressable anim-fade-up mt-6 flex w-full items-center justify-center gap-2 rounded-2xl border border-rose-500/20 bg-rose-500/5 py-3.5 text-[14px] font-medium text-rose-300 transition-all hover:bg-rose-500/10"
        >
          <LogOut size={17} />
          Sign Out
        </button>

        <p className="mt-6 text-center text-[11px] text-white/20">Oxlix v4.0 · Trusted Intelligence</p>
      </div>

      {/* Security & Privacy Panel */}
      {panel === 'security' && (
        <div className="absolute inset-0 z-50 flex flex-col bg-ox-black anim-fade-up">
          <header className="flex items-center gap-3 px-5 pt-5 pb-3">
            <button
              onClick={closePanel}
              aria-label="Back"
              className="pressable flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-white/70 transition-all hover:border-ox-gold/30 hover:text-ox-gold-soft"
            >
              <ChevronLeft size={20} />
            </button>
            <h1 className="text-xl font-semibold text-white">Privacy & Security</h1>
          </header>
          <div className="flex-1 overflow-y-auto no-scrollbar px-5 pb-10">
            {/* Session monitoring */}
            <h2 className="mb-2 px-1 text-[11px] font-semibold uppercase tracking-wider text-white/35">Session</h2>
            <Card className="anim-fade-up p-4">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-300">
                  <CheckCircle2 size={18} />
                </span>
                <div className="flex-1">
                  <p className="text-[14px] font-medium text-white">Active Session</p>
                  <p className="text-[11px] text-white/40">Signed in this {sessionInfo.greeting} at {sessionInfo.time}</p>
                </div>
              </div>
            </Card>

            {/* Device information */}
            <h2 className="mt-6 mb-2 px-1 text-[11px] font-semibold uppercase tracking-wider text-white/35">Device</h2>
            <Card className="anim-fade-up overflow-hidden p-0">
              <div className="flex items-center gap-3 px-4 py-3.5">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-500/15 text-sky-300">
                  {deviceInfo.isMobile ? <Smartphone size={18} /> : <Monitor size={18} />}
                </span>
                <div className="flex-1">
                  <p className="text-[14px] font-medium text-white">{deviceInfo.device}</p>
                  <p className="text-[11px] text-white/40">{deviceInfo.browser} · {deviceInfo.os}</p>
                </div>
              </div>
              <div className="ml-16 h-px bg-white/[0.04]" />
              <div className="flex items-center gap-3 px-4 py-3.5">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-500/15 text-violet-300">
                  <MapPin size={18} />
                </span>
                <div className="flex-1">
                  <p className="text-[14px] font-medium text-white">Location</p>
                  <p className="text-[11px] text-white/40">Approximate · IP-based</p>
                </div>
              </div>
              <div className="ml-16 h-px bg-white/[0.04]" />
              <div className="flex items-center gap-3 px-4 py-3.5">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-ox-gold/15 text-ox-gold-soft">
                  <Clock size={18} />
                </span>
                <div className="flex-1">
                  <p className="text-[14px] font-medium text-white">Last Active</p>
                  <p className="text-[11px] text-white/40">{profile?.last_active ? new Date(profile.last_active).toLocaleString() : 'Just now'}</p>
                </div>
              </div>
            </Card>

            {/* Privacy dashboard */}
            <h2 className="mt-6 mb-2 px-1 text-[11px] font-semibold uppercase tracking-wider text-white/35">Privacy Dashboard</h2>
            <Card className="anim-fade-up overflow-hidden p-0">
              <div className="flex items-center gap-3 px-4 py-3.5">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-300">
                  <Eye size={18} />
                </span>
                <div className="flex-1">
                  <p className="text-[14px] font-medium text-white">Profile Visibility</p>
                  <p className="text-[11px] text-white/40">{profile?.privacy_settings?.profile_public ? 'Public — visible to everyone' : 'Private — only you'}</p>
                </div>
                <span className={['h-2 w-2 rounded-full', profile?.privacy_settings?.profile_public ? 'bg-emerald-400' : 'bg-white/30'].join(' ')} />
              </div>
              <div className="ml-16 h-px bg-white/[0.04]" />
              <div className="flex items-center gap-3 px-4 py-3.5">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-500/15 text-sky-300">
                  <Eye size={18} />
                </span>
                <div className="flex-1">
                  <p className="text-[14px] font-medium text-white">Activity Visibility</p>
                  <p className="text-[11px] text-white/40">{profile?.privacy_settings?.show_activity ? 'Activity shown to followers' : 'Activity hidden'}</p>
                </div>
                <span className={['h-2 w-2 rounded-full', profile?.privacy_settings?.show_activity ? 'bg-emerald-400' : 'bg-white/30'].join(' ')} />
              </div>
              <div className="ml-16 h-px bg-white/[0.04]" />
              <div className="flex items-center gap-3 px-4 py-3.5">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-ox-gold/15 text-ox-gold-soft">
                  <Lock size={18} />
                </span>
                <div className="flex-1">
                  <p className="text-[14px] font-medium text-white">Data Encryption</p>
                  <p className="text-[11px] text-white/40">Row-level security · AES-256 at rest</p>
                </div>
                <CheckCircle2 size={16} className="text-emerald-400" />
              </div>
            </Card>

            {/* Permission status */}
            <h2 className="mt-6 mb-2 px-1 text-[11px] font-semibold uppercase tracking-wider text-white/35">Permissions</h2>
            <Card className="anim-fade-up overflow-hidden p-0">
              {[
                { label: 'Notifications', status: settings?.push_notifications ? 'Enabled' : 'Disabled', enabled: settings?.push_notifications ?? true },
                { label: 'Haptics', status: settings?.haptic_feedback ? 'Enabled' : 'Disabled', enabled: settings?.haptic_feedback ?? true },
                { label: 'Camera', status: 'Not required', enabled: true },
                { label: 'Microphone', status: 'Not required', enabled: true },
              ].map((p, i) => (
                <div key={p.label}>
                  <div className="flex items-center justify-between px-4 py-3.5">
                    <span className="text-[14px] text-white/80">{p.label}</span>
                    <span className={['text-[12px]', p.enabled ? 'text-emerald-400' : 'text-white/30'].join(' ')}>{p.status}</span>
                  </div>
                  {i < 3 && <div className="ml-4 h-px bg-white/[0.04]" />}
                </div>
              ))}
            </Card>
          </div>
        </div>
      )}

      {/* Modal */}
      {modal && (
        <div className="absolute inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm" onClick={closeModal}>
          <div
            className="anim-slide-in-right w-full max-w-[440px] rounded-t-3xl border border-white/10 bg-ox-card p-6 pb-8"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-white">
                {modal === 'changeEmail' ? 'Change Email' : modal === 'changePassword' ? 'Change Password' : 'Delete Account'}
              </h3>
              <button onClick={closeModal} className="pressable text-white/40 hover:text-white">
                <X size={20} />
              </button>
            </div>

            {modal === 'deleteAccount' && (
              <p className="mb-4 rounded-xl border border-rose-500/20 bg-rose-500/5 px-3 py-2 text-[12px] text-rose-300">
                This will permanently delete your profile, posts, and all data. This action cannot be undone.
              </p>
            )}

            <div className="space-y-3">
              <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 transition-colors focus-within:border-ox-gold/40">
                {modal === 'changeEmail' ? <Mail size={17} className="text-white/40" /> : <KeyRound size={17} className="text-white/40" />}
                <input
                  type={modal === 'changeEmail' ? 'email' : 'password'}
                  value={modalInput}
                  onChange={(e) => setModalInput(e.target.value)}
                  placeholder={modal === 'changeEmail' ? 'New email address' : modal === 'changePassword' ? 'New password' : 'Type DELETE to confirm'}
                  className="w-full bg-transparent text-[15px] text-white placeholder:text-white/30 outline-none"
                />
              </div>
            </div>

            {modalError && (
              <p className="mt-3 rounded-xl border border-rose-500/20 bg-rose-500/5 px-3 py-2 text-[12px] text-rose-300">
                {modalError}
              </p>
            )}
            {modalSuccess && (
              <p className="mt-3 rounded-xl border border-emerald-500/20 bg-emerald-500/5 px-3 py-2 text-[12px] text-emerald-300">
                {modalSuccess}
              </p>
            )}

            <div className="mt-5 flex gap-3">
              <Button variant="ghost" fullWidth onClick={closeModal}>
                Cancel
              </Button>
              <Button
                fullWidth
                variant={modal === 'deleteAccount' ? 'primary' : 'primary'}
                onClick={handleModalSubmit}
                disabled={modalSubmitting}
              >
                {modalSubmitting ? 'Processing…' : modal === 'deleteAccount' ? 'Delete Forever' : 'Update'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
