-- Migration: 20260222_module_qa_system
-- Description: Adds tables for Module Q&A system (Questions, Answers, Votes)

-- 1. Create module_questions table
CREATE TABLE IF NOT EXISTS public.module_questions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    module_id UUID NOT NULL REFERENCES public.modulos(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    upvotes INT DEFAULT 0,
    downvotes INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Create module_answers table
CREATE TABLE IF NOT EXISTS public.module_answers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    question_id UUID NOT NULL REFERENCES public.module_questions(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    is_accepted BOOLEAN DEFAULT FALSE,
    upvotes INT DEFAULT 0,
    downvotes INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Create module_qa_votes table
CREATE TABLE IF NOT EXISTS public.module_qa_votes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    item_id UUID NOT NULL,
    item_type TEXT NOT NULL CHECK (item_type IN ('question', 'answer')),
    vote_type INT NOT NULL CHECK (vote_type IN (1, -1)), -- 1: Upvote, -1: Downvote
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, item_id, item_type)
);

-- 4. Enable Row Level Security
ALTER TABLE public.module_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.module_answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.module_qa_votes ENABLE ROW LEVEL SECURITY;

-- 5. RLS Policies

-- Questions Policies
DROP POLICY IF EXISTS "Public questions are viewable by everyone" ON public.module_questions;
CREATE POLICY "Public questions are viewable by everyone" ON public.module_questions FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can insert their own questions" ON public.module_questions;
CREATE POLICY "Users can insert their own questions" ON public.module_questions FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own questions" ON public.module_questions;
CREATE POLICY "Users can update their own questions" ON public.module_questions FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own questions" ON public.module_questions;
CREATE POLICY "Users can delete their own questions" ON public.module_questions FOR DELETE USING (auth.uid() = user_id);

-- Answers Policies
DROP POLICY IF EXISTS "Public answers are viewable by everyone" ON public.module_answers;
CREATE POLICY "Public answers are viewable by everyone" ON public.module_answers FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can insert their own answers" ON public.module_answers;
CREATE POLICY "Users can insert their own answers" ON public.module_answers FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own answers" ON public.module_answers;
CREATE POLICY "Users can update their own answers" ON public.module_answers FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own answers" ON public.module_answers;
CREATE POLICY "Users can delete their own answers" ON public.module_answers FOR DELETE USING (auth.uid() = user_id);

-- Instructor/Admin can update answers (specifically for is_accepted)
DROP POLICY IF EXISTS "Instructors/Admins can update any answer" ON public.module_answers;
CREATE POLICY "Instructors/Admins can update any answer" ON public.module_answers FOR UPDATE USING (
    EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND rol IN ('instructor', 'admin')
    )
);

-- Votes Policies
DROP POLICY IF EXISTS "Public votes are viewable by everyone" ON public.module_qa_votes;
CREATE POLICY "Public votes are viewable by everyone" ON public.module_qa_votes FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can insert their own votes" ON public.module_qa_votes;
CREATE POLICY "Users can insert their own votes" ON public.module_qa_votes FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own votes" ON public.module_qa_votes;
CREATE POLICY "Users can update their own votes" ON public.module_qa_votes FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own votes" ON public.module_qa_votes;
CREATE POLICY "Users can delete their own votes" ON public.module_qa_votes FOR DELETE USING (auth.uid() = user_id);

-- 6. Functions and Triggers for Vote Counting

CREATE OR REPLACE FUNCTION update_qa_votes()
RETURNS TRIGGER AS $$
DECLARE
    target_id UUID;
    target_type TEXT;
    vote_val INT;
    old_vote_val INT;
BEGIN
    IF (TG_OP = 'INSERT' OR TG_OP = 'UPDATE') THEN
        target_id := NEW.item_id;
        target_type := NEW.item_type;
        vote_val := NEW.vote_type;
    ELSE
        target_id := OLD.item_id;
        target_type := OLD.item_type;
        old_vote_val := OLD.vote_type;
    END IF;

    IF (TG_OP = 'UPDATE') THEN
        old_vote_val := OLD.vote_type;
    END IF;

    IF (target_type = 'question') THEN
        IF (TG_OP = 'INSERT') THEN
            UPDATE public.module_questions
            SET upvotes = upvotes + CASE WHEN vote_val = 1 THEN 1 ELSE 0 END,
                downvotes = downvotes + CASE WHEN vote_val = -1 THEN 1 ELSE 0 END
            WHERE id = target_id;
        ELSIF (TG_OP = 'DELETE') THEN
            UPDATE public.module_questions
            SET upvotes = upvotes - CASE WHEN old_vote_val = 1 THEN 1 ELSE 0 END,
                downvotes = downvotes - CASE WHEN old_vote_val = -1 THEN 1 ELSE 0 END
            WHERE id = target_id;
        ELSIF (TG_OP = 'UPDATE') THEN
            UPDATE public.module_questions
            SET upvotes = upvotes - CASE WHEN old_vote_val = 1 THEN 1 ELSE 0 END + CASE WHEN vote_val = 1 THEN 1 ELSE 0 END,
                downvotes = downvotes - CASE WHEN old_vote_val = -1 THEN 1 ELSE 0 END + CASE WHEN vote_val = -1 THEN 1 ELSE 0 END
            WHERE id = target_id;
        END IF;
    ELSIF (target_type = 'answer') THEN
        IF (TG_OP = 'INSERT') THEN
            UPDATE public.module_answers
            SET upvotes = upvotes + CASE WHEN vote_val = 1 THEN 1 ELSE 0 END,
                downvotes = downvotes + CASE WHEN vote_val = -1 THEN 1 ELSE 0 END
            WHERE id = target_id;
        ELSIF (TG_OP = 'DELETE') THEN
            UPDATE public.module_answers
            SET upvotes = upvotes - CASE WHEN old_vote_val = 1 THEN 1 ELSE 0 END,
                downvotes = downvotes - CASE WHEN old_vote_val = -1 THEN 1 ELSE 0 END
            WHERE id = target_id;
        ELSIF (TG_OP = 'UPDATE') THEN
            UPDATE public.module_answers
            SET upvotes = upvotes - CASE WHEN old_vote_val = 1 THEN 1 ELSE 0 END + CASE WHEN vote_val = 1 THEN 1 ELSE 0 END,
                downvotes = downvotes - CASE WHEN old_vote_val = -1 THEN 1 ELSE 0 END + CASE WHEN vote_val = -1 THEN 1 ELSE 0 END
            WHERE id = target_id;
        END IF;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_vote_change ON public.module_qa_votes;
CREATE TRIGGER on_vote_change
AFTER INSERT OR UPDATE OR DELETE ON public.module_qa_votes
FOR EACH ROW EXECUTE FUNCTION update_qa_votes();
