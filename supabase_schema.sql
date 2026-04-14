-- SQL Schema for StuManage app
-- Run this in your Supabase SQL Editor (https://supabase.com/dashboard/project/_/sql)

-- 1. Create Owners Table (Main User)
CREATE TABLE IF NOT EXISTS public.owners (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT,
    phone TEXT,
    email TEXT UNIQUE,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Create Subscriptions Table
CREATE TABLE IF NOT EXISTS public.subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_id UUID UNIQUE REFERENCES public.owners(id) ON DELETE CASCADE,
    plan_price INTEGER DEFAULT 50,
    start_date DATE DEFAULT CURRENT_DATE,
    expiry_date DATE DEFAULT (CURRENT_DATE + interval '30 days'),
    status TEXT DEFAULT 'trial' CHECK (status IN ('trial', 'active', 'expired', 'cancelled')),
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Create Students Table
CREATE TABLE IF NOT EXISTS public.students (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_id UUID REFERENCES public.owners(id) ON DELETE CASCADE,
    student_name TEXT NOT NULL,
    phone_number TEXT,
    join_date DATE DEFAULT CURRENT_DATE,
    desk_number TEXT,
    shift TEXT,
    price DECIMAL DEFAULT 0,
    payment_status TEXT DEFAULT 'Pending' CHECK (payment_status IN ('Paid', 'Pending', 'Overdue')),
    expiry_date DATE,
    last_payment_date DATE,
    plan TEXT DEFAULT 'Custom Plan',
    payment_method TEXT DEFAULT 'UPI' CHECK (payment_method IN ('UPI', 'Cash', 'Bank Transfer')),
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 4. Create Settings Table
CREATE TABLE IF NOT EXISTS public.settings (
    owner_id UUID PRIMARY KEY REFERENCES public.owners(id) ON DELETE CASCADE,
    total_seats INTEGER DEFAULT 50,
    library_name TEXT DEFAULT 'StuManage app',
    message_template TEXT,
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 5. Enable Row Level Security (RLS)
ALTER TABLE public.owners ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;

-- 6. RLS Policies for Owners
DROP POLICY IF EXISTS "Users can view their own owner profile" ON public.owners;
CREATE POLICY "Users can view their own owner profile" ON public.owners FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can insert their own owner profile" ON public.owners;
CREATE POLICY "Users can insert their own owner profile" ON public.owners FOR INSERT WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update their own owner profile" ON public.owners;
CREATE POLICY "Users can update their own owner profile" ON public.owners FOR UPDATE USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- 7. RLS Policies for Subscriptions
DROP POLICY IF EXISTS "Users can view their own subscriptions" ON public.subscriptions;
CREATE POLICY "Users can view their own subscriptions" ON public.subscriptions FOR SELECT USING (auth.uid() = owner_id);

DROP POLICY IF EXISTS "Users can insert their own subscriptions" ON public.subscriptions;
CREATE POLICY "Users can insert their own subscriptions" ON public.subscriptions FOR INSERT WITH CHECK (auth.uid() = owner_id);

DROP POLICY IF EXISTS "Users can update their own subscriptions" ON public.subscriptions;
CREATE POLICY "Users can update their own subscriptions" ON public.subscriptions FOR UPDATE USING (auth.uid() = owner_id) WITH CHECK (auth.uid() = owner_id);

-- 8. RLS Policies for Students
DROP POLICY IF EXISTS "Users can view their own students" ON public.students;
CREATE POLICY "Users can view their own students" ON public.students FOR SELECT USING (auth.uid() = owner_id);

DROP POLICY IF EXISTS "Users can insert their own students" ON public.students;
CREATE POLICY "Users can insert their own students" ON public.students FOR INSERT WITH CHECK (auth.uid() = owner_id);

DROP POLICY IF EXISTS "Users can update their own students" ON public.students;
CREATE POLICY "Users can update their own students" ON public.students FOR UPDATE USING (auth.uid() = owner_id) WITH CHECK (auth.uid() = owner_id);

DROP POLICY IF EXISTS "Users can delete their own students" ON public.students;
CREATE POLICY "Users can delete their own students" ON public.students FOR DELETE USING (auth.uid() = owner_id);

-- 9. RLS Policies for Settings
DROP POLICY IF EXISTS "Users can view their own settings" ON public.settings;
CREATE POLICY "Users can view their own settings" ON public.settings FOR SELECT USING (auth.uid() = owner_id);

DROP POLICY IF EXISTS "Users can insert their own settings" ON public.settings;
CREATE POLICY "Users can insert their own settings" ON public.settings FOR INSERT WITH CHECK (auth.uid() = owner_id);

DROP POLICY IF EXISTS "Users can update their own settings" ON public.settings;
CREATE POLICY "Users can update their own settings" ON public.settings FOR UPDATE USING (auth.uid() = owner_id) WITH CHECK (auth.uid() = owner_id);

-- 10. Trigger to create owner, subscription, and settings on signup
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.owners (id, email, name)
  VALUES (new.id, new.email, COALESCE(new.raw_user_meta_data->>'full_name', SPLIT_PART(new.email, '@', 1)));
  
  INSERT INTO public.subscriptions (owner_id, status)
  VALUES (new.id, 'trial');

  INSERT INTO public.settings (owner_id)
  VALUES (new.id);
  
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Re-create trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
