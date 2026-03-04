-- ============================================
-- Sistema A: Depth Map 3D Parallax
-- ============================================
ALTER TABLE properties 
ADD COLUMN IF NOT EXISTS depth_maps TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS depth_map_status VARCHAR(20) DEFAULT 'none';

-- ============================================
-- Sistema B: Video Cinematográfico AI
-- ============================================
ALTER TABLE properties 
ADD COLUMN IF NOT EXISTS video_url TEXT DEFAULT '',
ADD COLUMN IF NOT EXISTS video_status VARCHAR(20) DEFAULT 'none';

CREATE TABLE IF NOT EXISTS generated_videos (
    id SERIAL PRIMARY KEY,
    property_id INTEGER REFERENCES properties(id) ON DELETE CASCADE,
    video_url TEXT DEFAULT '',
    thumbnail_url TEXT DEFAULT '',
    video_type VARCHAR(50) DEFAULT 'cinematic_pan',
    status VARCHAR(20) DEFAULT 'pending',
    duration_seconds INTEGER DEFAULT 5,
    error_message TEXT DEFAULT '',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_generated_videos_property ON generated_videos(property_id);
CREATE INDEX IF NOT EXISTS idx_generated_videos_status ON generated_videos(status);
