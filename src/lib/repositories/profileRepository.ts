import { supabase } from '@/lib/supabaseClient';
import { withRetry } from '@/lib/errors';
import { cacheGet, cacheSet, cacheRemove } from '@/lib/cache';
import type { Profile } from '@/lib/types';

const CACHE_KEY = 'profile';

export const profileRepository = {
  async get(userId: string): Promise<Profile | null> {
    // Try cache first for instant render
    const cached = cacheGet<Profile>(CACHE_KEY + userId);
    if (cached) {
      // Revalidate in background
      this.fetchRemote(userId).catch(() => {});
      return cached;
    }
    return this.fetchRemote(userId);
  },

  async fetchRemote(userId: string): Promise<Profile | null> {
    const { data, error } = await withRetry(() =>
      supabase.from('profiles').select('*').eq('id', userId).maybeSingle()
    );
    if (error) throw error;
    if (data) cacheSet(CACHE_KEY + userId, data);
    return data as Profile | null;
  },

  async update(userId: string, updates: Partial<Profile>): Promise<Profile> {
    const { data, error } = await withRetry(() =>
      supabase.from('profiles').update(updates).eq('id', userId).select().single()
    );
    if (error) throw error;
    cacheSet(CACHE_KEY + userId, data);
    return data as Profile;
  },

  async checkUsernameAvailable(username: string, currentUserId: string): Promise<boolean> {
    const { data, error } = await withRetry(() =>
      supabase
        .from('profiles')
        .select('id')
        .eq('username', username)
        .neq('id', currentUserId)
        .maybeSingle()
    );
    if (error) throw error;
    return !data;
  },

  clearCache(userId: string) {
    cacheRemove(CACHE_KEY + userId);
  },
};
