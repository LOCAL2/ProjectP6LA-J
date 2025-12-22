-- =============================================
-- Supabase Database Schema
-- Healthy By Yourself - Mood Tracker
-- รันไฟล์นี้ใน Supabase SQL Editor
-- =============================================

-- =============================================
-- 1. USERS TABLE - ข้อมูลผู้ใช้
-- =============================================
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    username TEXT UNIQUE NOT NULL,
    nickname TEXT,
    gender TEXT,
    age INTEGER,
    birthdate DATE,
    weight DECIMAL(5,2),
    height INTEGER,
    health_score INTEGER,
    health_status TEXT,
    answers JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- 2. MOOD_ENTRIES TABLE - บันทึกอารมณ์รายวัน
-- =============================================
CREATE TABLE IF NOT EXISTS public.mood_entries (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    mood TEXT NOT NULL,
    mood_name TEXT NOT NULL,
    smoking BOOLEAN DEFAULT FALSE,
    drinking BOOLEAN DEFAULT FALSE,
    note TEXT,
    image TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, date)
);

-- =============================================
-- 3. ROW LEVEL SECURITY (RLS)
-- =============================================

-- Enable RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mood_entries ENABLE ROW LEVEL SECURITY;

-- Drop all existing policies
DROP POLICY IF EXISTS "Anyone can check username" ON public.users;
DROP POLICY IF EXISTS "Users can view own profile" ON public.users;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.users;
DROP POLICY IF EXISTS "Users can update own profile" ON public.users;
DROP POLICY IF EXISTS "Enable read access for all users" ON public.users;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.users;
DROP POLICY IF EXISTS "Enable update for users based on id" ON public.users;

-- USERS POLICIES
CREATE POLICY "Enable read access for all users" 
    ON public.users FOR SELECT 
    USING (true);

CREATE POLICY "Enable insert for authenticated users only" 
    ON public.users FOR INSERT 
    TO authenticated
    WITH CHECK (auth.uid() = id);

CREATE POLICY "Enable update for users based on id" 
    ON public.users FOR UPDATE 
    TO authenticated
    USING (auth.uid() = id);

-- Drop mood_entries policies
DROP POLICY IF EXISTS "Users can view own mood entries" ON public.mood_entries;
DROP POLICY IF EXISTS "Users can insert own mood entries" ON public.mood_entries;
DROP POLICY IF EXISTS "Users can update own mood entries" ON public.mood_entries;
DROP POLICY IF EXISTS "Users can delete own mood entries" ON public.mood_entries;

-- MOOD_ENTRIES POLICIES
CREATE POLICY "Users can view own mood entries" 
    ON public.mood_entries FOR SELECT 
    TO authenticated
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own mood entries" 
    ON public.mood_entries FOR INSERT 
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own mood entries" 
    ON public.mood_entries FOR UPDATE 
    TO authenticated
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own mood entries" 
    ON public.mood_entries FOR DELETE 
    TO authenticated
    USING (auth.uid() = user_id);

-- =============================================
-- 4. FUNCTION: Auto create user profile on signup
-- =============================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.users (id, email, username, nickname, gender, age, birthdate, weight, height, health_score, health_status, answers)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)),
        NEW.raw_user_meta_data->>'nickname',
        NEW.raw_user_meta_data->>'gender',
        (NEW.raw_user_meta_data->>'age')::INTEGER,
        (NEW.raw_user_meta_data->>'birthdate')::DATE,
        (NEW.raw_user_meta_data->>'weight')::DECIMAL(5,2),
        (NEW.raw_user_meta_data->>'height')::INTEGER,
        (NEW.raw_user_meta_data->>'health_score')::INTEGER,
        NEW.raw_user_meta_data->>'health_status',
        (NEW.raw_user_meta_data->>'answers')::JSONB
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing trigger if any
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create trigger to auto create user profile
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =============================================
-- 5. ADD COLUMNS (สำหรับ database ที่มีอยู่แล้ว)
-- =============================================
-- รันคำสั่งนี้ถ้าต้องการเพิ่ม column ใน table ที่มีอยู่แล้ว
-- ALTER TABLE public.users ADD COLUMN IF NOT EXISTS weight DECIMAL(5,2);
-- ALTER TABLE public.users ADD COLUMN IF NOT EXISTS height INTEGER;


-- =============================================
-- 6. DAILY_CHECKS TABLE - เช็คสุขภาพประจำวัน
-- =============================================
CREATE TABLE IF NOT EXISTS public.daily_checks (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    answers JSONB,
    score INTEGER,
    percentage INTEGER,
    mood TEXT,
    mood_name TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, date)
);

-- Enable RLS
ALTER TABLE public.daily_checks ENABLE ROW LEVEL SECURITY;

-- DAILY_CHECKS POLICIES
CREATE POLICY "Users can view own daily checks" 
    ON public.daily_checks FOR SELECT 
    TO authenticated
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own daily checks" 
    ON public.daily_checks FOR INSERT 
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own daily checks" 
    ON public.daily_checks FOR UPDATE 
    TO authenticated
    USING (auth.uid() = user_id);
