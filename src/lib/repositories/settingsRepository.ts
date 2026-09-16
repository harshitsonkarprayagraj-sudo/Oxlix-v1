import { supabase } from '@/lib/supabaseClient';
import { withRetry } from '@/lib/errors';
import { cacheGet, cacheSet, cacheRemove } from '@/lib/cache';
import type { Settings } from '@/lib/types';

const CACHE_KEY = 'settings';

export const settingsRepository = {
  async get(userId: string): Promise<Settings | null> {
    const cached = cacheGet<Settings>(CACHE_KEY + userId);
    if (cached) {
      this.fetchRemote(userId).catch(() => {});
      return cached;
    }
    return this.fetchRemote(userId);
  },

  async fetchRemote(userId: string): Promise<Settings | null> {
    const { data, error } = await withRetry(() =>
      supabase.from('settings').select('*').eq('user_id', userId).maybeSingle()
    );
    if (error) throw error;
    if (data) cacheSet(CACHE_KEY + userId, data);
    return data as Settings | null;
  },

  async update(userId: string, updates: Partial<Settings>): Promise<Settings> {
    const { data, error } = await withRetry(() =>
      supabase.from('settings').update(updates).eq('user_id', userId).select().single()
    );
    if (error) throw error;
    cacheSet(CACHE_KEY + userId, data);
    return data as Settings;
  },

  clearCache(userId: string) {
    cacheRemove(CACHE_KEY + userId);
  },
};
