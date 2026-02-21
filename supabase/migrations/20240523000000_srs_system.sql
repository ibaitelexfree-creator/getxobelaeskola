-- Migration: Add SRS User Questions Table
-- Description: Tracks the Spaced Repetition System state for each user and question.

CREATE TABLE IF NOT EXISTS public.srs_user_questions (
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    question_id UUID NOT NULL REFERENCES public.preguntas(id) ON DELETE CASCADE,
    box INT DEFAULT 0, -- Leitner box or similar concept (optional)
    interval INT NOT NULL DEFAULT 0, -- Current interval in days
    ease_factor FLOAT NOT NULL DEFAULT 2.5, -- SM-2 ease factor
    next_review TIMESTAMPTZ NOT NULL DEFAULT NOW(), -- When the question is due
    last_answered TIMESTAMPTZ DEFAULT NOW(),

    PRIMARY KEY (user_id, question_id)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_srs_user_next_review ON public.srs_user_questions(user_id, next_review);
CREATE INDEX IF NOT EXISTS idx_srs_question_id ON public.srs_user_questions(question_id);

-- RLS Policies
ALTER TABLE public.srs_user_questions ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (to allow idempotency)
DROP POLICY IF EXISTS "Users can view their own SRS data" ON public.srs_user_questions;
DROP POLICY IF EXISTS "Users can insert/update their own SRS data" ON public.srs_user_questions;

CREATE POLICY "Users can view their own SRS data"
    ON public.srs_user_questions
    FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert/update their own SRS data"
    ON public.srs_user_questions
    FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);
