/*
  # Create last_watched table for tracking user viewing progress

  1. New Tables
    - `last_watched`
      - `id` (uuid, primary key) - Unique identifier for each record
      - `user_id` (uuid, foreign key) - References auth.users.id, cascades on delete
      - `item_type` (text) - Either 'movie' or 'tv'
      - `tmdb_id` (integer) - The Movie Database ID
      - `imdb_id` (text, nullable) - Internet Movie Database ID
      - `server_id` (text) - Video server identifier
      - `season` (integer, nullable) - Season number for TV shows
      - `episode` (integer, nullable) - Episode number for TV shows
      - `progress_seconds` (integer) - Current playback position in seconds
      - `runtime_seconds` (integer) - Total runtime in seconds
      - `poster_path` (text, nullable) - Path to poster image
      - `title` (text) - Title of the movie or TV show
      - `updated_at` (timestamptz) - Last update timestamp

  2. Security
    - Enable RLS on `last_watched` table
    - Add policies for users to manage only their own records
    - Users can SELECT, INSERT, UPDATE, and DELETE their own data

  3. Constraints
    - Unique constraint on user_id, tmdb_id, item_type, season, episode combination
    - Check constraint to ensure item_type is either 'movie' or 'tv'
    - Foreign key constraint linking user_id to auth.users
*/

-- Create the last_watched table
CREATE TABLE IF NOT EXISTS last_watched (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  item_type text NOT NULL CHECK (item_type IN ('movie', 'tv')),
  tmdb_id integer NOT NULL,
  imdb_id text,
  server_id text NOT NULL,
  season integer,
  episode integer,
  progress_seconds integer NOT NULL DEFAULT 0,
  runtime_seconds integer NOT NULL,
  poster_path text,
  title text NOT NULL,
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Create unique constraint to prevent duplicate entries
CREATE UNIQUE INDEX IF NOT EXISTS last_watched_unique_idx 
ON last_watched (user_id, tmdb_id, item_type, COALESCE(season, 0), COALESCE(episode, 0));

-- Enable Row Level Security
ALTER TABLE last_watched ENABLE ROW LEVEL SECURITY;

-- Create policies for RLS
CREATE POLICY "Users can view their own last watched items"
  ON last_watched
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own last watched items"
  ON last_watched
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own last watched items"
  ON last_watched
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own last watched items"
  ON last_watched
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS last_watched_user_updated_idx 
ON last_watched (user_id, updated_at DESC);

CREATE INDEX IF NOT EXISTS last_watched_tmdb_idx 
ON last_watched (tmdb_id, item_type);