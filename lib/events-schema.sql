
-- Create events table
CREATE TABLE IF NOT EXISTS events (
  id UUID DEFAULT extensions.uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  start_date DATE NOT NULL,
  end_date DATE,
  start_time TEXT,
  end_time TEXT,
  location TEXT,
  image_url TEXT,
  category TEXT,
  is_public BOOLEAN DEFAULT true,
  is_virtual BOOLEAN DEFAULT false,
  virtual_link TEXT,
  max_attendees INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Enable RLS on events
ALTER TABLE events ENABLE ROW LEVEL SECURITY;

-- Events policies
CREATE POLICY "Public events are viewable by everyone" 
ON events FOR SELECT 
USING (is_public = true);

-- Users can see their own events (even private ones)
CREATE POLICY "Users can view their own events" 
ON events FOR SELECT 
USING (auth.uid() = user_id);

-- Users can create their own events
CREATE POLICY "Users can create their own events" 
ON events FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Users can update their own events
CREATE POLICY "Users can update their own events" 
ON events FOR UPDATE 
USING (auth.uid() = user_id);

-- Users can delete their own events
CREATE POLICY "Users can delete their own events" 
ON events FOR DELETE 
USING (auth.uid() = user_id);

-- Create event_attendees table for tracking who's attending events
CREATE TABLE IF NOT EXISTS event_attendees (
  id UUID DEFAULT extensions.uuid_generate_v4() PRIMARY KEY,
  event_id UUID REFERENCES events(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  status TEXT DEFAULT 'going', -- 'going', 'interested', 'not_going'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  UNIQUE(event_id, user_id)
);

-- Enable RLS on event_attendees
ALTER TABLE event_attendees ENABLE ROW LEVEL SECURITY;

-- Event attendees policies
CREATE POLICY "Event attendance is viewable by everyone" 
ON event_attendees FOR SELECT 
USING (true);

-- Users can mark their own attendance
CREATE POLICY "Users can add themselves as attendees" 
ON event_attendees FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Users can update their own attendance status
CREATE POLICY "Users can update their attendance" 
ON event_attendees FOR UPDATE 
USING (auth.uid() = user_id);

-- Users can remove their attendance
CREATE POLICY "Users can remove their attendance" 
ON event_attendees FOR DELETE 
USING (auth.uid() = user_id);
