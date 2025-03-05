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

  // Fetch current user on component mount
  React.useEffect(() => {
    const fetchUser = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        setUser(user)

        if (user) {
          // Try to fetch existing profile data
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single()

          if (profile) {
            // Pre-fill form with existing data if available
            form.reset({
              headline: profile.headline || "",
              bio: profile.bio || "",
              company: profile.company || "",
              position: profile.position || "",
              location: profile.location || "",
              username: profile.username || "",
            })
          }
        }
      } catch (error) {
        console.error('Error fetching user:', error)
      }
    }

    fetchUser()
  }, [form])

  // Helper function to check if a username is available
  const checkUsernameAvailability = async (username: string) => {
    try {
      console.log("Setting up database...")
      // First, try to set up the database to ensure tables exist
      const setupResponse = await fetch('/api/setup-db')
      if (!setupResponse.ok) {
        console.warn("Database setup response not OK:", await setupResponse.text())
      } else {
        console.log("Database setup completed")
      }

      // Wait for tables to be available
      await new Promise(resolve => setTimeout(resolve, 2000))

      // Now check username availability
      const { data, error } = await supabase
        .from('profiles')
        .select('username')
        .eq('username', username)

      if (error) {
        console.error("Supabase error checking username:", error)

        // Try one more time to set up database if table doesn't exist
        if (error.code === '42P01') { // Relation does not exist error
          console.log("Table doesn't exist, trying database setup API...")

          try {
            // Call the setup-db API endpoint
            const setupResponse = await fetch('/api/setup-db');
            if (!setupResponse.ok) {
              const setupData = await setupResponse.json();
              console.error('Database setup failed:', setupData);
              throw new Error('Failed to set up database tables');
            }
            
            // Wait a moment for tables to be created
            await new Promise(resolve => setTimeout(resolve, 1000));

            // Wait again for tables to be created
            await new Promise(resolve => setTimeout(resolve, 1000))

            // Try again
            const { data: retryData, error: retryError } = await supabase
              .from('profiles')
              .select('username')
              .eq('username', username)

            if (retryError) {
              console.error("Still unable to check username after table creation:", retryError)
              return true // Assume username is available to allow profile creation
            }

            return retryData.length === 0
          } catch (sqlError) {
            console.error("Failed to create table with direct SQL:", sqlError)
            return true // Assume username is available to allow profile creation
          }
        }

        throw new Error(`Database error: ${error.message}`)
      }

      return data.length === 0
    } catch (err) {
      console.error("Error checking username availability:", err)
      // Don't block the user, assume username is available
      return true
    }
  }


  async function onSubmit(values: z.infer<typeof profileSetupSchema>) {
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to complete your profile",
        variant: "destructive",
      })
      return
    }

    setLoading(true)

    try {
      // Check if username is already taken
      const isUsernameAvailable = await checkUsernameAvailability(values.username);

      if (!isUsernameAvailable) {
        toast({
          title: "Username already taken",
          description: "Please choose a different username",
          variant: "destructive",
        })
        setLoading(false)
        return
      }

      // Update the user's profile
      const { error: updateError } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          username: values.username,
          headline: values.headline,
          bio: values.bio,
          company: values.company,
          position: values.position,
          location: values.location,
          updated_at: new Date().toISOString(),
        }, { onConflict: 'id' })

      if (updateError) {
        throw updateError
      }

      toast({
        title: "Profile updated",
        description: "Your profile has been successfully updated",
      })

      // Redirect to the user's profile page
      router.push(`/profile/${values.username}`)
    } catch (error: any) {
      console.error('Error updating profile:', error)
      toast({
        title: "Error updating profile",
        description: error.message || "There was an error updating your profile",
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
          <CardTitle>Complete Your Profile</CardTitle>
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
                      <Input placeholder="your-username" {...field} />
                    </FormControl>
                    <FormDescription>
                      This will be your public profile URL: safetyshaper.com/profile/{field.value || 'username'}
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
                      <Input placeholder="e.g. Senior Safety Engineer at ABC Corp" {...field} />
                    </FormControl>
                    <FormDescription>
                      A brief professional title that appears under your name
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
                        placeholder="Tell us about your experience, expertise, and interests in safety..." 
                        className="min-h-32"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="company"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Company</FormLabel>
                      <FormControl>
                        <Input placeholder="Current company" {...field} />
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
                      <FormLabel>Position</FormLabel>
                      <FormControl>
                        <Input placeholder="Current position" {...field} />
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
                      <Input placeholder="e.g. San Francisco, CA" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Saving..." : "Save Profile"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  )
}