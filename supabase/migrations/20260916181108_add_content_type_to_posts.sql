-- Add content_type column to posts table to support Reels and Videos
-- alongside the existing regular Posts
ALTER TABLE posts
  ADD COLUMN IF NOT EXISTS content_type text NOT NULL DEFAULT 'post'
  CHECK (content_type IN ('post', 'reel', 'video'));

-- Add index for filtering by content_type
CREATE INDEX IF NOT EXISTS idx_posts_content_type ON posts (content_type);

-- Add media_type column to help distinguish video vs image content
ALTER TABLE posts
  ADD COLUMN IF NOT EXISTS media_type text DEFAULT 'image'
  CHECK (media_type IN ('image', 'video'));
