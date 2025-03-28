
# Supabase Setup Instructions

To configure Supabase for this project, follow these steps:

## 1. Create a Supabase Project

1. Go to [Supabase](https://supabase.com/) and sign up or log in
2. Create a new project
3. Take note of your project URL and anon key

## 2. Set up Environment Variables

Create a `.env.local` file in the root of your project with the following variables:

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## 3. Set up the Database Schema

1. Go to the SQL Editor in your Supabase dashboard
2. Create a New Query
3. Copy and paste the contents of the `database.sql` file in this directory
4. Run the query to set up all tables and policies

## 4. Configure Authentication Providers

### Google Authentication

1. Go to Authentication > Providers in your Supabase dashboard
2. Enable Google provider
3. Create a Google OAuth application in the [Google Cloud Console](https://console.cloud.google.com/)
4. Configure the Authorized redirect URI as: `https://your-project-ref.supabase.co/auth/v1/callback`
5. Add your Client ID and Client Secret to the Supabase dashboard

### LinkedIn Authentication

1. Go to Authentication > Providers in your Supabase dashboard
2. Enable LinkedIn provider
3. Create a LinkedIn OAuth application in the [LinkedIn Developer Portal](https://www.linkedin.com/developers/)
4. Configure the Authorized redirect URI as: `https://your-project-ref.supabase.co/auth/v1/callback`
5. Add your Client ID and Client Secret to the Supabase dashboard

## 5. Configure Storage

1. Go to Storage in your Supabase dashboard
2. Create a new bucket named "avatars"
3. Make the bucket public

## 6. Test Authentication

Once you've completed these steps, you should be able to sign in using email/password, Google, or LinkedIn.
