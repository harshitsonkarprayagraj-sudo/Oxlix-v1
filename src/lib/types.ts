// Database row types — mirror the V4 schema. Keep in sync with migrations.

export interface Profile {
  id: string;
  name: string;
  username: string;
  bio: string | null;
  avatar_url: string | null;
  cover_url: string | null;
  email: string;
  preferences: Record<string, unknown>;
  theme: string;
  language: string;
  privacy_settings: { profile_public?: boolean; show_activity?: boolean };
  join_date: string;
  last_active: string;
  updated_at: string;
}

export interface Settings {
  id: string;
  user_id: string;
  push_notifications: boolean;
  haptic_feedback: boolean;
  dark_mode: boolean;
  email_notifications: boolean;
  language: string;
  created_at: string;
  updated_at: string;
}

export interface Notification {
  id: string;
  user_id: string;
  type: 'intelligence' | 'trust' | 'trend' | 'follow' | 'like';
  title: string;
  body: string;
  read: boolean;
  created_at: string;
}

export interface SavedItem {
  id: string;
  user_id: string;
  item_type: 'post' | 'article';
  item_id: string;
  title: string;
  metadata: Record<string, unknown>;
  created_at: string;
}

export interface AiHistoryEntry {
  id: string;
  user_id: string;
  role: 'user' | 'assistant';
  content: string;
  metadata: Record<string, unknown>;
  created_at: string;
}

export interface ActivityLog {
  id: string;
  user_id: string;
  action: string;
  entity_type: string | null;
  entity_id: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
}

export interface Report {
  id: string;
  reporter_id: string;
  reason: string;
  target_type: string;
  target_id: string;
  status: 'pending' | 'reviewing' | 'resolved';
  created_at: string;
}

export type PostContentType = 'post' | 'reel' | 'video';

export interface Post {
  id: string;
  user_id: string;
  caption: string;
  media_urls: string[];
  tags: string[];
  visibility: 'public' | 'private' | 'followers';
  trust_score: number;
  fact_review_status: 'pending' | 'verified' | 'flagged';
  content_type: PostContentType;
  media_type: 'image' | 'video';
  created_at: string;
  updated_at: string;
}

export interface AuthUser {
  id: string;
  email: string;
}

export interface AppSession {
  user: AuthUser;
  expiresAt: number;
}
