-- Create collaborative notes table
CREATE TABLE IF NOT EXISTS collaborative_notes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    content TEXT NOT NULL DEFAULT '',
    last_edited_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create edit history table
CREATE TABLE IF NOT EXISTS note_edit_history (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    note_id UUID REFERENCES collaborative_notes(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id),
    user_name TEXT NOT NULL,
    user_email TEXT NOT NULL,
    content_change TEXT,
    edit_type TEXT NOT NULL CHECK (edit_type IN ('create', 'update', 'delete')),
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE collaborative_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE note_edit_history ENABLE ROW LEVEL SECURITY;

-- RLS Policies for collaborative_notes (accessible to all authenticated users)
CREATE POLICY "Allow authenticated users to read collaborative notes" ON collaborative_notes
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to insert collaborative notes" ON collaborative_notes
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to update collaborative notes" ON collaborative_notes
    FOR UPDATE USING (auth.role() = 'authenticated');

-- RLS Policies for note_edit_history (accessible to all authenticated users)
CREATE POLICY "Allow authenticated users to read edit history" ON note_edit_history
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to insert edit history" ON note_edit_history
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_collaborative_notes_updated_at ON collaborative_notes(updated_at);
CREATE INDEX IF NOT EXISTS idx_note_edit_history_note_id ON note_edit_history(note_id);
CREATE INDEX IF NOT EXISTS idx_note_edit_history_timestamp ON note_edit_history(timestamp);
CREATE INDEX IF NOT EXISTS idx_note_edit_history_user_id ON note_edit_history(user_id);

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_collaborative_notes_updated_at 
    BEFORE UPDATE ON collaborative_notes 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
