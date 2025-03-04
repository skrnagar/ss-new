"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import {
  User,
  MapPin,
  Briefcase,
  Calendar,
  Mail,
  Phone,
  Globe,
  Award,
  BookOpen,
  MessageSquare,
  ThumbsUp,
  Share2,
} from "lucide-react"

export default function ProfilePage() {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    async function loadUserAndProfile() {
      try {
        const { data: { session } } = await supabase.auth.getSession()

        if (!session) {
          // If no session, redirect to login
          router.replace('/auth/login?redirectUrl=/profile')
          return
        }

        setUser(session.user)

        // Fetch the user profile from the profiles table
        const { data: profileData, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single()

        if (profileData) {
          setProfile(profileData)
        } else {
          // If no profile exists, use placeholder data from user metadata
          setProfile({
            id: session.user.id,
            name: session.user.user_metadata?.name || session.user.email?.split('@')[0] || "User",
            role: session.user.user_metadata?.role || "ESG Professional",
            company: session.user.user_metadata?.company || "",
            location: session.user.user_metadata?.location || "",
            email: session.user.email,
            phone: session.user.phone || "",
            website: session.user.user_metadata?.website || "",
            about: session.user.user_metadata?.about || "No information provided yet.",
            experience: [],
            education: [],
            certifications: []
          })
        }

        setLoading(false)
      } catch (error) {
        console.error('Error loading profile:', error)
        toast({
          title: "Error loading profile",
          description: "Please try refreshing the page",
          variant: "destructive"
        })
        setLoading(false)
      }
    }

    loadUserAndProfile()
  }, [router, toast])

  if (loading) {
    return (
      <div className="container max-w-5xl mx-auto py-8">
        <div className="flex justify-center">
          <p>Loading profile...</p>
        </div>
      </div>
    )
  }

  const defaultProfile = {
    name: profile?.name || user?.user_metadata?.name || user?.email?.split('@')[0] || "User",
    role: profile?.role || "ESG Professional",
    company: profile?.company || "Company Name",
    location: profile?.location || "Location",
    email: profile?.email || user?.email,
    phone: profile?.phone || "+1 (555) 123-4567",
    website: profile?.website || "www.example.com",
    about: profile?.about || "No information provided yet.",
    experience: profile?.experience || [],
    education: profile?.education || [],
    certifications: profile?.certifications || []
  }

  return (
    <div className="container max-w-5xl mx-auto py-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1">
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col items-center">
                <div className="h-32 w-32 rounded-full bg-gray-200 flex items-center justify-center mb-4">
                  <User className="h-16 w-16 text-gray-500" />
                </div>
                <h2 className="text-2xl font-bold">{defaultProfile.name}</h2>
                <p className="text-muted-foreground">{defaultProfile.role}</p>
                <div className="flex items-center text-sm text-muted-foreground mt-1">
                  <Briefcase className="mr-1 h-4 w-4" />
                  {defaultProfile.company}
                </div>
                <div className="flex items-center text-sm text-muted-foreground mt-1">
                  <MapPin className="mr-1 h-4 w-4" />
                  {defaultProfile.location}
                </div>
                <Button className="mt-4 w-full" onClick={() => router.push('/profile/edit')}>
                  Edit Profile
                </Button>
              </div>

              <div className="mt-6">
                <h3 className="font-medium mb-2">Contact Information</h3>
                <div className="space-y-2">
                  <div className="flex items-center text-sm">
                    <Mail className="mr-2 h-4 w-4 text-muted-foreground" />
                    <span>{defaultProfile.email}</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <Phone className="mr-2 h-4 w-4 text-muted-foreground" />
                    <span>{defaultProfile.phone}</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <Globe className="mr-2 h-4 w-4 text-muted-foreground" />
                    <span>{defaultProfile.website}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="md:col-span-2">
          <Card className="mb-6">
            <CardHeader>
              <h3 className="text-lg font-medium">About</h3>
            </CardHeader>
            <CardContent>
              <p>{defaultProfile.about}</p>
            </CardContent>
          </Card>

          <Card className="mb-6">
            <CardHeader>
              <h3 className="text-lg font-medium">Experience</h3>
            </CardHeader>
            <CardContent>
              {defaultProfile.experience && defaultProfile.experience.length > 0 ? (
                <div className="space-y-4">
                  {defaultProfile.experience.map((exp, index) => (
                    <div key={index} className="border-b pb-4 last:border-0 last:pb-0">
                      <div className="font-medium">{exp.title}</div>
                      <div className="text-sm text-muted-foreground">{exp.company}</div>
                      <div className="text-sm text-muted-foreground flex items-center">
                        <Calendar className="mr-1 h-3 w-3" />
                        {exp.period}
                      </div>
                      <p className="mt-2 text-sm">{exp.description}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">No experience information added yet.</p>
              )}
            </CardContent>
          </Card>

          <Card className="mb-6">
            <CardHeader>
              <h3 className="text-lg font-medium">Education</h3>
            </CardHeader>
            <CardContent>
              {defaultProfile.education && defaultProfile.education.length > 0 ? (
                <div className="space-y-4">
                  {defaultProfile.education.map((edu, index) => (
                    <div key={index} className="border-b pb-4 last:border-0 last:pb-0">
                      <div className="font-medium">{edu.degree}</div>
                      <div className="text-sm text-muted-foreground">{edu.school}</div>
                      <div className="text-sm text-muted-foreground flex items-center">
                        <Calendar className="mr-1 h-3 w-3" />
                        {edu.years}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">No education information added yet.</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <h3 className="text-lg font-medium">Certifications</h3>
            </CardHeader>
            <CardContent>
              {defaultProfile.certifications && defaultProfile.certifications.length > 0 ? (
                <div className="space-y-4">
                  {defaultProfile.certifications.map((cert, index) => (
                    <div key={index} className="border-b pb-4 last:border-0 last:pb-0">
                      <div className="flex items-start">
                        <Award className="h-5 w-5 text-primary mr-2 mt-0.5" />
                        <div>
                          <div className="font-medium">{cert.name}</div>
                          <div className="text-sm text-muted-foreground">{cert.issuer}</div>
                          <div className="text-sm text-muted-foreground">{cert.date}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">No certifications added yet.</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}