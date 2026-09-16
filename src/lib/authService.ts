import { supabase } from '@/lib/supabaseClient';
import { withRetry } from '@/lib/errors';
import type { AuthUser } from '@/lib/types';

export const authService = {
  async signUp(email: string, password: string, name: string): Promise<AuthUser> {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name },
        emailRedirectTo: window.location.origin,
      },
    });
    if (error) throw error;
    if (!data.user) throw new Error('Sign-up failed — no user returned');

    // When email confirmation is required, no session is returned.
    // The profile row is created automatically by the database trigger
    // once the user confirms and signs in for the first time.
    if (!data.session) {
      throw new Error('CONFIRMATION_REQUIRED');
    }

    return { id: data.user.id, email: data.user.email ?? email };
  },

  async signInWithEmail(email: string, password: string): Promise<AuthUser> {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    if (!data.user) throw new Error('Sign-in failed — no user returned');
    return { id: data.user.id, email: data.user.email ?? email };
  },

  async signInWithGoogle(): Promise<void> {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin },
    });
    if (error) throw error;
  },

  async resetPassword(email: string): Promise<void> {
    const { error } = await withRetry(() =>
      supabase.auth.resetPasswordForEmail(email, {
        redirectTo: window.location.origin + '/?reset=true',
      })
    );
    if (error) throw error;
  },

  async updatePassword(newPassword: string): Promise<void> {
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) throw error;
  },

  async updateEmail(newEmail: string): Promise<void> {
    const { error } = await supabase.auth.updateUser({ email: newEmail });
    if (error) throw error;
  },

  async deleteAccount(): Promise<void> {
    const { data: sessionData } = await supabase.auth.getSession();
    const userId = sessionData.session?.user?.id;
    if (!userId) throw new Error('No active session.');

    const { error: profileErr } = await supabase
      .from('profiles')
      .delete()
      .eq('id', userId);
    if (profileErr) throw profileErr;

    await supabase.auth.signOut();
  },

  async signOut(): Promise<void> {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },

  async getSession(): Promise<AuthUser | null> {
    const { data } = await supabase.auth.getSession();
    if (data.session?.user) {
      return { id: data.session.user.id, email: data.session.user.email ?? '' };
    }
    return null;
  },

  async refreshSession(): Promise<AuthUser | null> {
    const { data, error } = await supabase.auth.refreshSession();
    if (error) return null;
    if (data.session?.user) {
      return { id: data.session.user.id, email: data.session.user.email ?? '' };
    }
    return null;
  },

  onAuthStateChange(callback: (event: string, user: AuthUser | null) => void) {
    const { data } = supabase.auth.onAuthStateChange((event, session) => {
      (async () => {
        if (session?.user) {
          callback(event, { id: session.user.id, email: session.user.email ?? '' });
          supabase.rpc('update_last_active').then(() => {}, () => {});
        } else {
          callback(event, null);
        }
      })();
    });

    return {
      data: {
        subscription: {
          unsubscribe: () => data.subscription.unsubscribe(),
        },
      },
    };
  },
};
