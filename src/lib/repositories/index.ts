import { supabase } from '@/lib/supabaseClient';
import { withRetry } from '@/lib/errors';
import type { ActivityLog, SavedItem, AiHistoryEntry, Post, PostContentType } from '@/lib/types';

export const activityRepository = {
  async log(userId: string, action: string, entityType?: string, entityId?: string): Promise<void> {
    const { error } = await withRetry(() =>
      supabase.from('activity_logs').insert({
        user_id: userId,
        action,
        entity_type: entityType ?? null,
        entity_id: entityId ?? null,
      })
    );
    if (error) throw error;
  },

  async fetch(userId: string, limit = 20): Promise<ActivityLog[]> {
    const { data, error } = await withRetry(() =>
      supabase
        .from('activity_logs')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit)
    );
    if (error) throw error;
    return (data ?? []) as ActivityLog[];
  },
};

export const savedItemsRepository = {
  async fetch(userId: string): Promise<SavedItem[]> {
    const { data, error } = await withRetry(() =>
      supabase
        .from('saved_items')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
    );
    if (error) throw error;
    return (data ?? []) as SavedItem[];
  },

  async add(userId: string, item: Omit<SavedItem, 'id' | 'user_id' | 'created_at'>): Promise<void> {
    const { error } = await withRetry(() =>
      supabase.from('saved_items').insert({ user_id: userId, ...item })
    );
    if (error) throw error;
  },

  async remove(id: string): Promise<void> {
    const { error } = await withRetry(() =>
      supabase.from('saved_items').delete().eq('id', id)
    );
    if (error) throw error;
  },

  async update(id: string, updates: Partial<Pick<SavedItem, 'metadata'>>): Promise<void> {
    const { error } = await withRetry(() =>
      supabase.from('saved_items').update(updates).eq('id', id)
    );
    if (error) throw error;
  },
};

export const postsRepository = {
  async fetchByUser(userId: string, limit = 50): Promise<Post[]> {
    const { data, error } = await withRetry(() =>
      supabase
        .from('posts')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit)
    );
    if (error) throw error;
    return (data ?? []) as Post[];
  },

  async fetchByUserAndType(userId: string, contentType: PostContentType, limit = 50): Promise<Post[]> {
    const { data, error } = await withRetry(() =>
      supabase
        .from('posts')
        .select('*')
        .eq('user_id', userId)
        .eq('content_type', contentType)
        .order('created_at', { ascending: false })
        .limit(limit)
    );
    if (error) throw error;
    return (data ?? []) as Post[];
  },
};

export const aiHistoryRepository = {
  async fetch(userId: string, limit = 50): Promise<AiHistoryEntry[]> {
    const { data, error } = await withRetry(() =>
      supabase
        .from('ai_history')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit)
    );
    if (error) throw error;
    return (data ?? []) as AiHistoryEntry[];
  },

  async add(userId: string, role: 'user' | 'assistant', content: string): Promise<void> {
    const { error } = await withRetry(() =>
      supabase.from('ai_history').insert({ user_id: userId, role, content })
    );
    if (error) throw error;
  },

  async clear(userId: string): Promise<void> {
    const { error } = await withRetry(() =>
      supabase.from('ai_history').delete().eq('user_id', userId)
    );
    if (error) throw error;
  },
};
