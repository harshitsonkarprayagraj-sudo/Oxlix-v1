import { supabase } from '@/lib/supabaseClient';
import { withRetry } from '@/lib/errors';
import type { Notification } from '@/lib/types';

const PAGE_SIZE = 20;

export const notificationsRepository = {
  async fetch(userId: string, page = 0): Promise<Notification[]> {
    const { data, error } = await withRetry(() =>
      supabase
        .from('notifications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .range(page * PAGE_SIZE, (page + 1) * PAGE_SIZE - 1)
    );
    if (error) throw error;
    return (data ?? []) as Notification[];
  },

  async markRead(id: string): Promise<void> {
    const { error } = await withRetry(() =>
      supabase.from('notifications').update({ read: true }).eq('id', id)
    );
    if (error) throw error;
  },

  async markAllRead(userId: string): Promise<void> {
    const { error } = await withRetry(() =>
      supabase.from('notifications').update({ read: true }).eq('user_id', userId).eq('read', false)
    );
    if (error) throw error;
  },

  async delete(id: string): Promise<void> {
    const { error } = await withRetry(() =>
      supabase.from('notifications').delete().eq('id', id)
    );
    if (error) throw error;
  },
};
