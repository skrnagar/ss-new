
"use client"

import { createClient } from '@/lib/supabase-client';
import { notFound, redirect } from 'next/navigation'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Briefcase, MapPin, Calendar, Edit, MessageSquare, UserPlus, User } from "lucide-react"
import { useState, useEffect } from 'react';

export default function ProfilePage({ params }: { params: { username: string } }) {
  const { username } = params
  const supabase = createClient() // Initialize client-side

  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [error, setError] = useState(null);
  const [isOwnProfile, setIsOwnProfile] = useState(false);
  const [joinDate, setJoinDate] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSessionAndProfile = async () => {
      try {
        // Get current session
        const { data: sessionData } = await supabase.auth.getSession();
        setSession(sessionData.session);

        // Get profile data for the username in the URL
        const { data: profileData, error: profileError } = await supabase
          .from("profiles")
          .select("*")
          .eq("username", username)
          .single();

        if (profileError) {
          setError(profileError);
          setLoading(false);
          return;
        }

        if (!profileData) {
          setError(new Error("Profile not found"));
          setLoading(false);
          return;
        }

        setProfile(profileData);
        
        // Check if this is the user's own profile
        if (sessionData.session && profileData.id === sessionData.session.user.id) {
          setIsOwnProfile(true);
        }

        // Format the created_at date
        if (profileData.created_at) {
          const date = new Date(profileData.created_at);
          setJoinDate(date.toLocaleDateString('en-US', { 
            year: 'numeric',
            month: 'long'
          }));
        }
      } catch (err) {
        console.error("Error fetching data:", err);
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchSessionAndProfile();
  }, [supabase, username]);

  // Handle loading state
  if (loading) {
    return (
      <div className="container py-8">
        <div className="flex justify-center items-center h-64">
          <p>Loading profile...</p>
        </div>
      </div>
    );
  }

  // Handle error state
  if (error) {
    return (
      <div className="container py-8">
        <div className="flex justify-center items-center h-64">
          <p>Profile not found or error loading profile.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Left sidebar - Profile info */}
        <div className="space-y-6">
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col items-center text-center">
                <Avatar className="h-24 w-24 mb-4">
                  <AvatarImage src={profile?.avatar_url || "/placeholder-user.jpg"} alt={profile?.full_name || 'User'} />
                  <AvatarFallback>{profile?.full_name?.[0] || 'U'}</AvatarFallback>
                </Avatar>
                <h2 className="text-2xl font-bold">{profile?.full_name || 'User'}</h2>
                <p className="text-muted-foreground">@{profile?.username}</p>
                
                {profile?.position && profile?.company && (
                  <div className="flex items-center mt-2 text-muted-foreground">
                    <Briefcase className="h-4 w-4 mr-1" />
                    <span>{profile.position} at {profile.company}</span>
                  </div>
                )}
                
                {profile?.location && (
                  <div className="flex items-center mt-1 text-muted-foreground">
                    <MapPin className="h-4 w-4 mr-1" />
                    <span>{profile.location}</span>
                  </div>
                )}
                
                <div className="flex items-center mt-1 text-muted-foreground">
                  <Calendar className="h-4 w-4 mr-1" />
                  <span>Joined {joinDate}</span>
                </div>
                
                <div className="flex mt-6 w-full">
                  {isOwnProfile ? (
                    <Button asChild className="w-full">
                      <Link href="/profile/edit">
                        <Edit className="h-4 w-4 mr-2" />
                        Edit Profile
                      </Link>
                    </Button>
                  ) : (
                    <div className="flex w-full gap-2">
                      <Button className="flex-1">
                        <MessageSquare className="h-4 w-4 mr-2" />
                        Message
                      </Button>
                      <Button variant="outline" className="flex-1">
                        <UserPlus className="h-4 w-4 mr-2" />
                        Connect
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* About section */}
          <Card>
            <CardHeader>
              <CardTitle>About</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                {profile?.bio || 'This user has not added a bio yet.'}
              </p>
            </CardContent>
          </Card>
          
          {/* Skills section could go here */}
        </div>
        
        {/* Main content area - Posts, Activity, etc. */}
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Posts</CardTitle>
              <CardDescription>Recent posts by {profile?.full_name || 'this user'}</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-center py-8">
                No posts yet.
              </p>
            </CardContent>
          </Card>
          
          {/* Activity feed would go here */}
        </div>
      </div>
    </div>
  );
}

// Profile Setup Component
export function ProfileSetupPage(){
    const [fullName, setFullName] = useState('');
    const supabase = createClient();
    const [session, setSession] = useState(null);
    
    useEffect(() => {
      const getSession = async () => {
        const { data } = await supabase.auth.getSession();
        setSession(data.session);
      };
      getSession();
    }, [supabase]);

    const updateProfile = async (e) => {
        e.preventDefault();
        if (!session) return;
        
        const { error } = await supabase
            .from('profiles')
            .update({ full_name: fullName })
            .eq('id', session.user.id);
            
        if (error) {
            console.error('Error updating profile:', error);
            return;
        }
        
        // Redirect to profile page
        window.location.href = '/profile';
    };

    return (
        <div className="container py-8 max-w-md mx-auto">
            <h1 className="text-2xl font-bold mb-6">Complete Your Profile</h1>
            <form onSubmit={updateProfile} className="space-y-4">
                <div>
                    <label className="block mb-2">Full Name</label>
                    <input 
                        type="text" 
                        value={fullName} 
                        onChange={(e) => setFullName(e.target.value)} 
                        className="w-full p-2 border rounded" 
                        required 
                    />
                </div>
                <button 
                    type="submit" 
                    className="w-full p-2 bg-blue-600 text-white rounded"
                >
                    Save Profile
                </button>
            </form>
        </div>
    );
}
