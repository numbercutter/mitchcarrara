-- Handle existing note_edit_history table and policies
-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow authenticated users to insert edit history" ON public.note_edit_history;
DROP POLICY IF EXISTS "Allow authenticated users to read edit history" ON public.note_edit_history;

-- Check if table needs modification (add missing columns if needed)
DO $$ 
BEGIN
    -- Add user_email column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'note_edit_history' AND column_name = 'user_email'
    ) THEN
        ALTER TABLE public.note_edit_history ADD COLUMN user_email TEXT;
    END IF;
    
    -- Add content_change column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'note_edit_history' AND column_name = 'content_change'
    ) THEN
        ALTER TABLE public.note_edit_history ADD COLUMN content_change TEXT;
    END IF;
    
    -- Add edit_type column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'note_edit_history' AND column_name = 'edit_type'
    ) THEN
        ALTER TABLE public.note_edit_history ADD COLUMN edit_type TEXT DEFAULT 'update';
    END IF;
END $$;

-- Ensure RLS is enabled
ALTER TABLE public.note_edit_history ENABLE ROW LEVEL SECURITY;

-- Policy for users to view edit history of their own notes
CREATE POLICY "Users can view edit history of their notes" ON public.note_edit_history
FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM public.notes 
        WHERE notes.id = note_edit_history.note_id 
        AND notes.user_id = auth.uid()
    )
);

-- Policy for users to insert edit history for their own notes
CREATE POLICY "Users can insert edit history for their notes" ON public.note_edit_history
FOR INSERT WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.notes 
        WHERE notes.id = note_edit_history.note_id 
        AND notes.user_id = auth.uid()
    )
);

-- Indexes for performance
CREATE INDEX idx_note_edit_history_note_id ON public.note_edit_history (note_id);
CREATE INDEX idx_note_edit_history_timestamp ON public.note_edit_history (timestamp DESC);
CREATE INDEX idx_note_edit_history_user_id ON public.note_edit_history (user_id);
