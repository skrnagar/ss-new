
"use client"

import { notFound } from 'next/navigation'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Briefcase, MapPin, Calendar, Edit, MessageSquare, UserPlus, User } from "lucide-react"
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { ProfileEditor } from '@/components/profile-editor'

export default function ProfilePage({ params }: { params: { username: string } }) {
  const [profile, setProfile] = useState<any>(null)
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [isCurrentUser, setIsCurrentUser] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      try {
        // Fetch the profile by username
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('username', params.username)
          .single()

        if (profileError) {
          console.error('Error fetching profile:', profileError)
          return notFound()
        }

        setProfile(profileData)

        // Check if the current user is the profile owner
        const { data: { session } } = await supabase.auth.getSession()
        if (session) {
          setCurrentUser(session.user)
          setIsCurrentUser(session.user.id === profileData.id)
        }
      } catch (error) {
        console.error('Error in profile page:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [params.username])

  if (isLoading) {
    return (
      <div className="container py-8">
        <div className="text-center">Loading profile...</div>
      </div>
    )
  }

  if (!profile) {
    return notFound()
  }
  
  const handleUpdateComplete = async () => {
    // Refresh profile data
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('username', params.username)
      .single()
    
    if (data) {
      setProfile(data)
    }
    setIsEditing(false)
  }

  return (
    <div className="container py-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-1">
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col items-center text-center">
                <Avatar className="h-24 w-24 mb-4">
                  <AvatarImage src={profile.avatar_url || "/placeholder-user.jpg"} alt={profile.name || profile.username} />
                  <AvatarFallback>{(profile.name || profile.username || "User").substring(0, 2).toUpperCase()}</AvatarFallback>
                </Avatar>
                <h2 className="text-2xl font-bold">{profile.full_name || profile.name}</h2>
                <p className="text-muted-foreground">@{profile.username}</p>
                
                {profile.position && (
                  <div className="flex items-center mt-4 text-muted-foreground">
                    <Briefcase className="h-4 w-4 mr-2" />
                    <span>{profile.position}</span>
                  </div>
                )}
                
                {profile.company && (
                  <div className="flex items-center mt-2 text-muted-foreground">
                    <User className="h-4 w-4 mr-2" />
                    <span>{profile.company}</span>
                  </div>
                )}
                
                {profile.location && (
                  <div className="flex items-center mt-2 text-muted-foreground">
                    <MapPin className="h-4 w-4 mr-2" />
                    <span>{profile.location}</span>
                  </div>
                )}
                
                <div className="flex items-center mt-2 text-muted-foreground">
                  <Calendar className="h-4 w-4 mr-2" />
                  <span>Joined {new Date(profile.created_at).toLocaleDateString()}</span>
                </div>
                
                <div className="w-full mt-6">
                  {isCurrentUser ? (
                    <Button 
                      onClick={() => setIsEditing(!isEditing)} 
                      className="w-full" 
                      variant={isEditing ? "secondary" : "default"}
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      {isEditing ? "Cancel Editing" : "Edit Profile"}
                    </Button>
                  ) : (
                    <div className="flex gap-2">
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
        </div>
        
        <div className="md:col-span-2">
          {isEditing ? (
            <Card>
              <CardHeader>
                <CardTitle>Edit Profile</CardTitle>
                <CardDescription>Update your profile information</CardDescription>
              </CardHeader>
              <CardContent>
                <ProfileEditor profile={profile} onUpdate={handleUpdateComplete} />
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>About</CardTitle>
              </CardHeader>
              <CardContent>
                {profile.bio ? (
                  <p>{profile.bio}</p>
                ) : (
                  <p className="text-muted-foreground">No bio provided</p>
                )}
              </CardContent>
            </Card>
          )}
          
          {/* Activity section can be added here */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">No recent activity</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
