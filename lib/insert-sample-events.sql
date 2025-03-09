
-- Insert sample event data into events table
-- This assumes the user with id 'YOUR_USER_ID' exists in the auth.users table
-- Replace 'YOUR_USER_ID' with an actual user ID from your auth.users table

-- First, let's set a variable for a default user ID if needed
DO $$
DECLARE
    default_user_id UUID;
BEGIN
    -- Try to get a user ID from the auth.users table
    SELECT id INTO default_user_id FROM auth.users LIMIT 1;
    
    IF default_user_id IS NULL THEN
        RAISE NOTICE 'No users found in auth.users table. Using a placeholder UUID.';
        default_user_id := '00000000-0000-0000-0000-000000000000'::UUID;
    END IF;

-- Safety Awareness Events
INSERT INTO events (
    title, 
    description, 
    start_date, 
    end_date,
    start_time, 
    end_time,
    location, 
    image_url, 
    category, 
    is_public, 
    is_virtual,
    user_id,
    max_attendees,
    created_at
) VALUES
-- National Safety Day Conference
(
    'National Safety Day/Week Conference', 
    'Annual celebration focused on renewing commitment to workplace safety. Part of the National Safety Day/Week (March 4-10) campaign to spread safety awareness in all sectors.',
    '2025-03-04', 
    '2025-03-04',
    '09:00', 
    '17:00',
    'New Delhi, India', 
    'https://placehold.co/800x400/1f2937/f8fafc?text=National%20Safety%20Day%20Conference', 
    'Safety', 
    TRUE, 
    FALSE,
    default_user_id,
    520,
    NOW()
),
-- ESG Reporting Framework Summit
(
    'ESG Reporting Framework Summit', 
    'Learn about the latest developments in ESG reporting standards and frameworks.',
    '2025-04-15', 
    '2025-04-15',
    '10:00', 
    '16:00',
    'New York, NY', 
    'https://placehold.co/800x400/1f2937/f8fafc?text=ESG%20Reporting%20Framework%20Summit', 
    'Conference', 
    TRUE, 
    FALSE,
    default_user_id,
    325,
    NOW()
),
-- World Environment Day
(
    'World Environment Day Observance', 
    'Global event to raise awareness and action for the protection of our environment.',
    '2025-06-05', 
    '2025-06-05',
    '00:00', 
    '23:59',
    'Worldwide', 
    'https://placehold.co/800x400/1f2937/f8fafc?text=World%20Environment%20Day%20Observance', 
    'Environment', 
    TRUE, 
    FALSE,
    default_user_id,
    1289,
    NOW()
),
-- Construction Safety Workshop
(
    'Construction Safety Workshop', 
    'Hands-on training for construction safety professionals.',
    '2025-07-12', 
    '2025-07-12',
    '08:00', 
    '15:00',
    'Chicago, IL', 
    'https://placehold.co/800x400/1f2937/f8fafc?text=Construction%20Safety%20Standards%20Forum', 
    'Safety', 
    TRUE, 
    FALSE,
    default_user_id,
    178,
    NOW()
),
-- Mental Health Awareness Month Kickoff
(
    'Mental Health Awareness Month Kickoff Webinar', 
    'Opening session for mental health awareness initiatives in the workplace.',
    '2025-05-01', 
    '2025-05-01',
    '11:00', 
    '13:00',
    'Virtual', 
    'https://placehold.co/800x400/1f2937/f8fafc?text=Mental%20Health%20Awareness%20Month%20Kickoff%20Webinar', 
    'Health', 
    TRUE, 
    TRUE,
    default_user_id,
    234,
    NOW()
),
-- Sustainable Supply Chain Conference
(
    'Sustainable Supply Chain Conference', 
    'Explore best practices for creating sustainable and ethical supply chains.',
    '2025-09-09', 
    '2025-09-09',
    '09:00', 
    '18:00',
    'Boston, MA', 
    'https://placehold.co/800x400/1f2937/f8fafc?text=Sustainable%20Supply%20Chain%20Conference', 
    'Environment', 
    TRUE, 
    FALSE,
    default_user_id,
    415,
    NOW()
),
-- World Day for Safety and Health at Work
(
    'World Day for Safety and Health at Work', 
    'Annual international campaign to promote safe, healthy and decent work environments.',
    '2025-04-28', 
    '2025-04-28',
    '00:00', 
    '23:59',
    'Worldwide', 
    'https://placehold.co/800x400/1f2937/f8fafc?text=World%20Day%20for%20Safety%20and%20Health%20at%20Work', 
    'Safety', 
    TRUE, 
    FALSE,
    default_user_id,
    890,
    NOW()
),
-- Fire Prevention Week
(
    'Fire Prevention Week', 
    'Educational campaign to raise awareness about fire safety and prevention strategies.',
    '2025-10-05', 
    '2025-10-11',
    '00:00', 
    '23:59',
    'Nationwide', 
    'https://placehold.co/800x400/1f2937/f8fafc?text=Fire%20Prevention%20Week', 
    'Safety', 
    TRUE, 
    FALSE,
    default_user_id,
    675,
    NOW()
),
-- Global Biodiversity Summit
(
    'Global Biodiversity Summit', 
    'International conference addressing biodiversity conservation and sustainable ecosystem management.',
    '2025-05-22', 
    '2025-05-22',
    '09:00', 
    '18:00',
    'Sydney, Australia', 
    'https://placehold.co/800x400/1f2937/f8fafc?text=Global%20Biodiversity%20Summit', 
    'Environment', 
    TRUE, 
    FALSE,
    default_user_id,
    560,
    NOW()
),
-- Road Safety Week
(
    'Road Safety Week', 
    'Campaign focused on reducing road accidents and promoting safer driving practices.',
    '2025-01-10', 
    '2025-01-16',
    '00:00', 
    '23:59',
    'Multiple Cities', 
    'https://placehold.co/800x400/1f2937/f8fafc?text=Road%20Safety%20Week', 
    'Safety', 
    TRUE, 
    FALSE,
    default_user_id,
    530,
    NOW()
),
-- World Health Day 2025
(
    'World Health Day 2025', 
    'Global health awareness day under the sponsorship of the World Health Organization.',
    '2025-04-07', 
    '2025-04-07',
    '00:00', 
    '23:59',
    'Worldwide', 
    'https://placehold.co/800x400/1f2937/f8fafc?text=World%20Health%20Day%202025', 
    'Health', 
    TRUE, 
    FALSE,
    default_user_id,
    920,
    NOW()
),
-- Climate Finance Forum
(
    'Climate Finance Forum', 
    'Key stakeholders discussing financing solutions for climate action and resilience.',
    '2025-11-12', 
    '2025-11-12',
    '10:00', 
    '17:00',
    'London, UK', 
    'https://placehold.co/800x400/1f2937/f8fafc?text=Climate%20Finance%20Forum', 
    'Environment', 
    TRUE, 
    FALSE,
    default_user_id,
    380,
    NOW()
),
-- User-created events
-- Safety Leadership Roundtable
(
    'Safety Leadership Roundtable', 
    'Monthly discussion forum for safety professionals to share leadership strategies.',
    '2025-02-20', 
    '2025-02-20',
    '15:00', 
    '16:30',
    'Virtual', 
    'https://placehold.co/800x400/1f2937/f8fafc?text=Safety%20Leadership%20Roundtable', 
    'Safety', 
    TRUE, 
    TRUE,
    default_user_id,
    32,
    NOW()
),
-- ESG Metrics Working Group Session
(
    'ESG Metrics Working Group Session', 
    'Collaborative session on standardizing ESG metrics for the manufacturing sector.',
    '2025-03-15', 
    '2025-03-15',
    '13:00', 
    '15:00',
    'Chicago, IL', 
    'https://placehold.co/800x400/1f2937/f8fafc?text=ESG%20Metrics%20Working%20Group%20Session', 
    'Environment', 
    TRUE, 
    FALSE,
    default_user_id,
    18,
    NOW()
),
-- Mental Health Awareness Month
(
    'Mental Health Awareness Month', 
    'Nationwide campaign to fight stigma, provide support, educate the public, and advocate for policies supporting mental health.',
    '2025-05-01', 
    '2025-05-31',
    '00:00', 
    '23:59',
    'United States', 
    'https://placehold.co/800x400/1f2937/f8fafc?text=Mental%20Health%20Awareness%20Month', 
    'Health', 
    TRUE, 
    FALSE,
    default_user_id,
    750,
    NOW()
),
-- Circularity 25
(
    'Circularity 25', 
    'Premier gathering for accelerating the circular economy through innovative business models and design approaches.',
    '2025-04-29', 
    '2025-05-01',
    '09:00', 
    '18:00',
    'Denver, CO, USA', 
    'https://placehold.co/800x400/1f2937/f8fafc?text=Circularity%2025', 
    'Environment', 
    TRUE, 
    FALSE,
    default_user_id,
    540,
    NOW()
),
-- UN COP 30 Climate Conference
(
    'UN COP 30 Climate Conference', 
    '30th Conference of the Parties to the UN Framework Convention on Climate Change, a pivotal global climate summit.',
    '2025-11-10', 
    '2025-11-21',
    '09:00', 
    '18:00',
    'Belem, Brazil', 
    'https://placehold.co/800x400/1f2937/f8fafc?text=UN%20COP%2030%20Climate%20Conference', 
    'Environment', 
    TRUE, 
    FALSE,
    default_user_id,
    2500,
    NOW()
);

END $$;
