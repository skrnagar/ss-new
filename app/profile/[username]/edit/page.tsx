
"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { AvatarUpdater } from "@/components/avatar-updater"
import { supabase } from "@/lib/supabase"
import { useToast } from "@/hooks/use-toast"

export default function ProfileEditPage({ params }: { params: { username: string } }) {
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [formData, setFormData] = useState({
    name: "",
    username: "",
    bio: "",
    headline: "",
    position: "",
    company: "",
    location: "",
    website: "",
  })

  useEffect(() => {
    async function loadProfile() {
      try {
        // Get the current authenticated user
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
          router.push('/auth/login')
          return
        }
        setUser(user)

        // Get the profile for the username in the URL
        const { data: profileData, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('username', params.username)
          .single()

        if (error || !profileData) {
          toast({
            title: "Profile not found",
            description: "The requested profile could not be loaded",
            variant: "destructive",
          })
          router.push('/feed')
          return
        }

        // Check if the current user owns this profile
        if (profileData.id !== user.id) {
          toast({
            title: "Unauthorized",
            description: "You cannot edit someone else's profile",
            variant: "destructive",
          })
          router.push(`/profile/${params.username}`)
          return
        }

        setProfile(profileData)
        setFormData({
          name: profileData.full_name || "",
          username: profileData.username || "",
          bio: profileData.bio || "",
          headline: profileData.headline || "",
          position: profileData.position || "",
          company: profileData.company || "",
          location: profileData.location || "",
          website: profileData.website || "",
        })
      } catch (error) {
        console.error("Error loading profile:", error)
        toast({
          title: "Error",
          description: "Failed to load profile data",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    loadProfile()
  }, [params.username, router, toast])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)

    try {
      // Check if username has changed and if it's already taken
      if (formData.username !== profile.username) {
        const { data: existingUser } = await supabase
          .from('profiles')
          .select('id')
          .eq('username', formData.username)
          .maybeSingle()

        if (existingUser) {
          toast({
            title: "Username already taken",
            description: "Please choose a different username",
            variant: "destructive",
          })
          setSubmitting(false)
          return
        }
      }

      // Update profile
      const { error } = await supabase
        .from('profiles')
        .update({
          username: formData.username,
          full_name: formData.name,
          bio: formData.bio,
          headline: formData.headline,
          position: formData.position,
          company: formData.company,
          location: formData.location,
          website: formData.website,
          updated_at: new Date().toISOString(),
        })
        .eq('id', profile.id)

      if (error) throw error

      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully",
      })

      // Redirect to the profile page (with potentially new username)
      router.push(`/profile/${formData.username}`)
    } catch (error: any) {
      toast({
        title: "Error updating profile",
        description: error.message || "An error occurred while updating your profile",
        variant: "destructive",
      })
    } finally {
      setSubmitting(false)
    }
  }

  const handleAvatarUpdate = (url: string) => {
    if (profile) {
      setProfile({
        ...profile,
        avatar_url: url
      })
    }
  }

  if (loading) {
    return (
      <div className="container max-w-3xl py-10 flex justify-center">
        <p>Loading profile...</p>
      </div>
    )
  }

  return (
    <div className="container max-w-3xl py-10">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Edit Your Profile</CardTitle>
        </CardHeader>
        <CardContent>
          {user && profile && (
            <>
              <div className="mb-8">
                <AvatarUpdater 
                  userId={user.id}
                  avatarUrl={profile.avatar_url}
                  username={profile.username || profile.full_name || 'User'}
                  onAvatarUpdate={handleAvatarUpdate}
                />
              </div>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Full Name</label>
                  <Input 
                    name="name"
                    value={formData.name} 
                    onChange={handleChange} 
                    placeholder="Your full name"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Username</label>
                  <Input 
                    name="username"
                    value={formData.username} 
                    onChange={handleChange} 
                    placeholder="Your username"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Headline</label>
                  <Input 
                    name="headline"
                    value={formData.headline} 
                    onChange={handleChange} 
                    placeholder="Your professional headline"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Bio</label>
                  <Textarea 
                    name="bio"
                    value={formData.bio} 
                    onChange={handleChange} 
                    placeholder="Tell others about yourself"
                    rows={4}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Position</label>
                  <Input 
                    name="position"
                    value={formData.position} 
                    onChange={handleChange} 
                    placeholder="Your job position"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Company</label>
                  <Input 
                    name="company"
                    value={formData.company} 
                    onChange={handleChange} 
                    placeholder="Your company"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Location</label>
                  <Input 
                    name="location"
                    value={formData.location} 
                    onChange={handleChange} 
                    placeholder="Your location"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Website</label>
                  <Input 
                    name="website"
                    value={formData.website} 
                    onChange={handleChange} 
                    placeholder="Your website URL"
                  />
                </div>
                
                <div className="flex justify-end space-x-2 pt-4">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => router.push(`/profile/${profile.username}`)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={submitting}>
                    {submitting ? "Saving..." : "Save Changes"}
                  </Button>
                </div>
              </form>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
