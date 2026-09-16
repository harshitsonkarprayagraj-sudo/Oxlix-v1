import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from 'react';
import { authService } from '@/lib/authService';
import { profileRepository } from '@/lib/repositories/profileRepository';
import { settingsRepository } from '@/lib/repositories/settingsRepository';
import { cacheClear } from '@/lib/cache';
import type { AuthUser, Profile, Settings } from '@/lib/types';

interface AuthContextValue {
  user: AuthUser | null;
  profile: Profile | null;
  settings: Settings | null;
  loading: boolean;
  error: string | null;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, name: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  signOut: () => Promise<void>;
  deleteAccount: () => Promise<void>;
  updatePassword: (newPassword: string) => Promise<void>;
  updateEmail: (newEmail: string) => Promise<void>;
  updateProfile: (updates: Partial<Profile>) => Promise<void>;
  updateSettings: (updates: Partial<Settings>) => Promise<void>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [settings, setSettings] = useState<Settings | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadUserData = useCallback(async (u: AuthUser) => {
    try {
      const [p, s] = await Promise.all([
        profileRepository.get(u.id),
        settingsRepository.get(u.id),
      ]);
      setProfile(p);
      setSettings(s);
    } catch {
      // Non-fatal — cached data or defaults will be used
    }
  }, []);

  // Set up the auth listener FIRST so we don't miss the SIGNED_IN event
  // that fires when Supabase processes the email confirmation code from the URL.
  useEffect(() => {
    // Subscribe before calling getSession — detectSessionInUrl may fire
    // a SIGNED_IN event synchronously and we need to catch it.
    const { data: subData } = authService.onAuthStateChange(async (event, u) => {
      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        setUser(u);
        if (u) await loadUserData(u);
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        setProfile(null);
        setSettings(null);
      }
    });
    const unsubscribe = { unsubscribe: () => subData.subscription.unsubscribe() };

    // Now check for an existing session (covers page refresh when already logged in).
    (async () => {
      try {
        const existing = await authService.getSession();
        if (existing) {
          setUser(existing);
          await loadUserData(existing);
        }
      } catch {
        // ignore — no session
      } finally {
        setLoading(false);
      }
    })();

    return () => {
      unsubscribe?.unsubscribe();
    };
  }, [loadUserData]);

  const signIn = useCallback(async (email: string, password: string) => {
    setError(null);
    try {
      const u = await authService.signInWithEmail(email, password);
      setUser(u);
      await loadUserData(u);
    } catch (err) {
      setError((err as Error).message);
      throw err;
    }
  }, [loadUserData]);

  const signUp = useCallback(async (email: string, password: string, name: string) => {
    setError(null);
    try {
      const u = await authService.signUp(email, password, name);
      setUser(u);
      await loadUserData(u);
    } catch (err) {
      const msg = (err as Error).message;
      if (msg === 'CONFIRMATION_REQUIRED') {
        throw err;
      }
      setError(msg);
      throw err;
    }
  }, [loadUserData]);

  const signInWithGoogle = useCallback(async () => {
    setError(null);
    try {
      await authService.signInWithGoogle();
    } catch (err) {
      setError((err as Error).message);
      throw err;
    }
  }, []);

  const resetPassword = useCallback(async (email: string) => {
    setError(null);
    try {
      await authService.resetPassword(email);
    } catch (err) {
      setError((err as Error).message);
      throw err;
    }
  }, []);

  const signOut = useCallback(async () => {
    setError(null);
    try {
      await authService.signOut();
      cacheClear();
      setUser(null);
      setProfile(null);
      setSettings(null);
    } catch (err) {
      setError((err as Error).message);
      throw err;
    }
  }, []);

  const deleteAccount = useCallback(async () => {
    setError(null);
    try {
      await authService.deleteAccount();
      cacheClear();
      setUser(null);
      setProfile(null);
      setSettings(null);
    } catch (err) {
      setError((err as Error).message);
      throw err;
    }
  }, []);

  const updatePassword = useCallback(async (newPassword: string) => {
    setError(null);
    try {
      await authService.updatePassword(newPassword);
    } catch (err) {
      setError((err as Error).message);
      throw err;
    }
  }, []);

  const updateEmail = useCallback(async (newEmail: string) => {
    setError(null);
    try {
      await authService.updateEmail(newEmail);
      if (user) {
        setUser({ ...user, email: newEmail });
      }
    } catch (err) {
      setError((err as Error).message);
      throw err;
    }
  }, [user]);

  const updateProfile = useCallback(async (updates: Partial<Profile>) => {
    if (!user) return;
    setError(null);
    try {
      const updated = await profileRepository.update(user.id, updates);
      setProfile(updated);
    } catch (err) {
      setError((err as Error).message);
      throw err;
    }
  }, [user]);

  const updateSettings = useCallback(async (updates: Partial<Settings>) => {
    if (!user) return;
    setError(null);
    try {
      const updated = await settingsRepository.update(user.id, updates);
      setSettings(updated);
    } catch (err) {
      setError((err as Error).message);
      throw err;
    }
  }, [user]);

  const clearError = useCallback(() => setError(null), []);

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        settings,
        loading,
        error,
        signIn,
        signUp,
        signInWithGoogle,
        resetPassword,
        signOut,
        deleteAccount,
        updatePassword,
        updateEmail,
        updateProfile,
        updateSettings,
        clearError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (ctx === undefined) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
