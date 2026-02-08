-- Fail Frenzy: Échos du Vide - Supabase Schema
-- Run this SQL in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (extends auth.users)
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  username TEXT UNIQUE,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Game scores table
CREATE TABLE IF NOT EXISTS public.game_scores (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  mode TEXT NOT NULL CHECK (mode IN ('classic', 'time-trial', 'infinite', 'seeds')),
  score INTEGER NOT NULL CHECK (score >= 0),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- User skins table
CREATE TABLE IF NOT EXISTS public.user_skins (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  skin_id TEXT NOT NULL,
  purchased_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, skin_id)
);

-- User tokens table
CREATE TABLE IF NOT EXISTS public.user_tokens (
  user_id UUID PRIMARY KEY REFERENCES public.users(id) ON DELETE CASCADE,
  tokens INTEGER NOT NULL DEFAULT 0 CHECK (tokens >= 0),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_game_scores_user_id ON public.game_scores(user_id);
CREATE INDEX IF NOT EXISTS idx_game_scores_mode ON public.game_scores(mode);
CREATE INDEX IF NOT EXISTS idx_game_scores_score ON public.game_scores(score DESC);
CREATE INDEX IF NOT EXISTS idx_user_skins_user_id ON public.user_skins(user_id);

-- Row Level Security (RLS) Policies
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.game_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_skins ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_tokens ENABLE ROW LEVEL SECURITY;

-- Users policies
CREATE POLICY "Users can view their own profile" ON public.users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON public.users
  FOR UPDATE USING (auth.uid() = id);

-- Game scores policies
CREATE POLICY "Anyone can view game scores" ON public.game_scores
  FOR SELECT USING (true);

CREATE POLICY "Users can insert their own scores" ON public.game_scores
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- User skins policies
CREATE POLICY "Users can view their own skins" ON public.user_skins
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can purchase skins" ON public.user_skins
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- User tokens policies
CREATE POLICY "Users can view their own tokens" ON public.user_tokens
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own tokens" ON public.user_tokens
  FOR UPDATE USING (auth.uid() = user_id);

-- Trigger to create user profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, username, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'username', SPLIT_PART(NEW.email, '@', 1)),
    NEW.raw_user_meta_data->>'avatar_url'
  );
  
  -- Initialize tokens
  INSERT INTO public.user_tokens (user_id, tokens)
  VALUES (NEW.id, 500); -- Start with 500 tokens
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger on auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_user_tokens_updated_at BEFORE UPDATE ON public.user_tokens
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
