
"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { useToast } from "@/hooks/use-toast"
import { supabase } from "@/lib/supabase"

const profileSetupSchema = z.object({
  headline: z.string().min(10, "Headline must be at least 10 characters"),
  bio: z.string().min(30, "Bio should be at least 30 characters"),
  company: z.string().min(2, "Company name must be at least 2 characters"),
  position: z.string().min(2, "Position must be at least 2 characters"),
  location: z.string().min(2, "Location must be at least 2 characters"),
  username: z.string().min(3, "Username must be at least 3 characters").regex(/^[a-z0-9_-]+$/, "Username can only contain lowercase letters, numbers, underscores, and hyphens"),
})

export default function ProfileSetupPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = React.useState(false)
  const [user, setUser] = React.useState<any>(null)
  
  const form = useForm<z.infer<typeof profileSetupSchema>>({
    resolver: zodResolver(profileSetupSchema),
    defaultValues: {
      headline: "",
      bio: "",
      company: "",
      position: "",
      location: "",
      username: "",
    },
  })

  React.useEffect(() => {
    async function getUserInfo() {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
      
      // Generate a suggested username
      if (user?.user_metadata?.name) {
        const nameSuggestion = user.user_metadata.name
          .toLowerCase()
          .replace(/[^a-z0-9]/g, '')
        
        form.setValue('username', nameSuggestion)
      }
    }
    
    getUserInfo()
  }, [form])

  async function onSubmit(values: z.infer<typeof profileSetupSchema>) {
    setLoading(true)
    
    try {
      // Check if username is already taken
      const { data: existingUser, error: usernameCheckError } = await supabase
        .from('profiles')
        .select('username')
        .eq('username', values.username)
        .single()
      
      if (existingUser) {
        form.setError('username', { 
          type: 'manual', 
          message: 'This username is already taken' 
        })
        setLoading(false)
        return
      }
      
      // Create user profile in profiles table
      const { error } = await supabase
        .from('profiles')
        .insert({
          id: user.id,
          username: values.username,
          headline: values.headline,
          bio: values.bio,
          company: values.company,
          position: values.position,
          location: values.location,
          avatar_url: user?.user_metadata?.avatar_url || null,
        })

      if (error) {
        toast({
          title: "Profile setup failed",
          description: error.message,
          variant: "destructive",
        })
        return
      }

      toast({
        title: "Profile created successfully",
        description: "Redirecting to your profile...",
      })
      
      setTimeout(() => router.push(`/profile/${values.username}`), 1500)
    } catch (error) {
      toast({
        title: "An error occurred",
        description: "Please try again later",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container max-w-3xl py-10">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Complete Your Profile</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Username</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormDescription>
                      This will be your unique profile URL: safetyshaper.com/profile/{field.value || 'username'}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="headline"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Professional Headline</FormLabel>
                    <FormControl>
                      <Input placeholder="ESG Compliance Manager | Safety Specialist" {...field} />
                    </FormControl>
                    <FormDescription>
                      A brief summary of your professional role
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="bio"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Bio</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="I'm a safety professional with 5+ years of experience in..." 
                        className="min-h-32" 
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Tell other professionals about your experience and expertise
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="company"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Current Company</FormLabel>
                      <FormControl>
                        <Input placeholder="GreenTech Solutions" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="position"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Current Position</FormLabel>
                      <FormControl>
                        <Input placeholder="ESG Compliance Manager" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Location</FormLabel>
                    <FormControl>
                      <Input placeholder="San Francisco, CA" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Saving Profile..." : "Complete Profile Setup"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  )
}
"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"

export default function ProfileSetupPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState({
    username: "",
    full_name: "",
    headline: "",
    bio: "",
  })

  useEffect(() => {
    const initProfile = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        
        if (!session) {
          router.push('/auth/login')
          return
        }
        
        setUser(session.user)
        
        // Check if they already have a profile
        const { data: existingProfile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single()
        
        if (existingProfile) {
          setProfile({
            username: existingProfile.username || "",
            full_name: existingProfile.full_name || "",
            headline: existingProfile.headline || "",
            bio: existingProfile.bio || "",
          })
        } else {
          // Generate defaults from user data
          setProfile({
            username: `${session.user.user_metadata?.name || session.user.email?.split('@')[0] || 'user'}`
              .toLowerCase()
              .replace(/\s+/g, '-')
              .replace(/[^a-z0-9-]/g, '') + 
              `-${Math.floor(Math.random() * 10000)}`,
            full_name: session.user.user_metadata?.name || "",
            headline: "",
            bio: "",
          })
        }
      } catch (error) {
        console.error('Error loading profile:', error)
        toast({
          title: "Error loading profile",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }
    
    initProfile()
  }, [router, toast])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    
    try {
      if (!user) {
        throw new Error("User not found")
      }
      
      // Check if username is unique
      const { data: usernameCheck, error: usernameError } = await supabase
        .from('profiles')
        .select('id')
        .eq('username', profile.username)
        .neq('id', user.id)
        .single()
      
      if (usernameCheck) {
        toast({
          title: "Username already taken",
          description: "Please choose a different username",
          variant: "destructive",
        })
        setSaving(false)
        return
      }
      
      // Update or insert profile
      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          username: profile.username,
          full_name: profile.full_name,
          headline: profile.headline,
          bio: profile.bio,
          avatar_url: user.user_metadata?.avatar_url || user.user_metadata?.picture,
          updated_at: new Date().toISOString(),
        })
      
      if (error) throw error
      
      toast({
        title: "Profile saved",
        description: "Your profile has been updated successfully",
      })
      
      // Redirect to profile page
      router.push(`/profile/${profile.username}`)
    } catch (error: any) {
      console.error('Error saving profile:', error)
      toast({
        title: "Error saving profile",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="container max-w-2xl py-10">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Complete Your Profile</h1>
          <p className="text-muted-foreground">
            Set up your profile information to get started with the Safety Shaper network
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                value={profile.username}
                onChange={(e) => setProfile({ ...profile, username: e.target.value })}
                required
              />
              <p className="text-xs text-muted-foreground">
                This will be used for your profile URL: example.com/profile/{profile.username}
              </p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="full_name">Full Name</Label>
              <Input
                id="full_name"
                value={profile.full_name}
                onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="headline">Headline</Label>
              <Input
                id="headline"
                value={profile.headline}
                onChange={(e) => setProfile({ ...profile, headline: e.target.value })}
                placeholder="e.g. EHS Manager at Company ABC"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="bio">Bio</Label>
              <Textarea
                id="bio"
                value={profile.bio}
                onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                placeholder="Tell us about yourself, your experience, and your interests"
                className="min-h-[150px]"
              />
            </div>
          </div>
          
          <Button type="submit" disabled={saving} className="w-full">
            {saving ? "Saving..." : "Save Profile"}
          </Button>
        </form>
      </div>
    </div>
  )
}
