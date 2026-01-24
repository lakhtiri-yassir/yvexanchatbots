-- Design Themes Table for saving and sharing chatbot designs
CREATE TABLE IF NOT EXISTS design_themes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  
  -- Metadata
  theme_name TEXT NOT NULL,
  description TEXT,
  tags TEXT[],
  preview_image TEXT,
  
  -- Design configuration stored as JSONB
  design_config JSONB NOT NULL,
  
  -- Usage tracking
  times_applied INTEGER DEFAULT 0,
  is_public BOOLEAN DEFAULT false,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT theme_name_length CHECK (char_length(theme_name) BETWEEN 1 AND 50),
  CONSTRAINT description_length CHECK (char_length(description) <= 200),
  CONSTRAINT tags_count CHECK (array_length(tags, 1) <= 5)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_design_themes_user_id ON design_themes(user_id);
CREATE INDEX IF NOT EXISTS idx_design_themes_tags ON design_themes USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_design_themes_public ON design_themes(is_public) WHERE is_public = true;
CREATE INDEX IF NOT EXISTS idx_design_themes_created_at ON design_themes(created_at DESC);

-- Enable Row Level Security
ALTER TABLE design_themes ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own themes and public themes"
  ON design_themes FOR SELECT
  USING (auth.uid() = user_id OR is_public = true);

CREATE POLICY "Users can insert their own themes"
  ON design_themes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own themes"
  ON design_themes FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own themes"
  ON design_themes FOR DELETE
  USING (auth.uid() = user_id);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_design_themes_updated_at BEFORE UPDATE
ON design_themes FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();
