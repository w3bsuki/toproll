-- CS2 Case Opening Database Schema

-- Cases table
CREATE TABLE IF NOT EXISTS public.cases (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    image_url VARCHAR(500),
    price DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    item_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Case items table
CREATE TABLE IF NOT EXISTS public.case_items (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    case_id UUID NOT NULL REFERENCES public.cases(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    market_name VARCHAR(255) NOT NULL,
    image_url VARCHAR(500) NOT NULL,
    rarity VARCHAR(50) NOT NULL CHECK (rarity IN ('Common', 'Uncommon', 'Rare', 'Epic', 'Legendary', 'Contraband')),
    probability DECIMAL(5, 2) NOT NULL DEFAULT 0.00,
    market_value DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    weapon_type VARCHAR(100),
    category VARCHAR(50),
    collection VARCHAR(255),
    wear_condition VARCHAR(50),
    description TEXT,
    exterior VARCHAR(50)
);

-- Case openings table
CREATE TABLE IF NOT EXISTS public.case_openings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL,
    case_id UUID NOT NULL REFERENCES public.cases(id) ON DELETE CASCADE,
    opened_item_id UUID NOT NULL REFERENCES public.case_items(id) ON DELETE CASCADE,
    cost DECIMAL(10, 2) NOT NULL,
    profit DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User profiles table
CREATE TABLE IF NOT EXISTS public.user_profiles (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL UNIQUE,
    steam_id VARCHAR(100),
    username VARCHAR(255) NOT NULL,
    avatar_url VARCHAR(500),
    steam_profile_url VARCHAR(500),
    total_wagered DECIMAL(12, 2) DEFAULT 0.00,
    total_profit DECIMAL(12, 2) DEFAULT 0.00,
    win_rate DECIMAL(5, 2) DEFAULT 0.00,
    biggest_win DECIMAL(12, 2) DEFAULT 0.00,
    case_battle_wins INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_case_items_case_id ON public.case_items(case_id);
CREATE INDEX IF NOT EXISTS idx_case_items_rarity ON public.case_items(rarity);
CREATE INDEX IF NOT EXISTS idx_case_openings_user_id ON public.case_openings(user_id);
CREATE INDEX IF NOT EXISTS idx_case_openings_case_id ON public.case_openings(case_id);
CREATE INDEX IF NOT EXISTS idx_case_openings_created_at ON public.case_openings(created_at);

-- Enable Row Level Security
ALTER TABLE public.cases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.case_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.case_openings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- Policies for public read access to cases and items
CREATE POLICY "Cases are publicly readable" ON public.cases
    FOR SELECT USING (true);

CREATE POLICY "Case items are publicly readable" ON public.case_items
    FOR SELECT USING (true);

-- Users can only see their own openings and profiles
CREATE POLICY "Users can view own openings" ON public.case_openings
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own openings" ON public.case_openings
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own profile" ON public.user_profiles
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own profile" ON public.user_profiles
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile" ON public.user_profiles
    FOR INSERT WITH CHECK (auth.uid() = user_id);;
