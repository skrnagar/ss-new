"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
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
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [profile, setProfile] = useState({
    name: "",
    role: "",
    company: "",
    location: "",
    email: "",
    phone: "",
    website: "",
    about: "",
    experience: [],
    education: [],
    certifications: [],
    skills: [],
    posts: [],
  });

  useEffect(() => {
    async function checkProfile() {
      try {
        const { data: { session } } = await supabase.auth.getSession()

        if (!session) {
          router.push('/auth/login')
          return
        }

        // Get user profile
        const { data: profileData } = await supabase
          .from('profiles')
          .select('*') //select all columns
          .eq('id', session.user.id)
          .single()

        if (profileData) {
          setProfile(profileData);
          router.push(`/profile/${profileData.username}`)
        } else {
          router.push('/profile/setup')
        }
      } catch (error) {
        console.error('Error checking profile:', error)
      } finally {
        setLoading(false)
      }
    }

    checkProfile()
  }, [router])

  if (loading) {
    return (
      <div className="container flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <h2 className="mt-4 text-lg font-medium">Loading your profile...</h2>
        </div>
      </div>
    )
  }

  return (
    <div className="container py-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Left Column - Profile Info */}
        <div>
          <Card className="mb-6">
            <CardContent className="p-6">
              <div className="flex flex-col items-center text-center">
                <div className="w-32 h-32 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <User className="h-16 w-16 text-primary" />
                </div>
                <h2 className="text-2xl font-bold">{profile.name}</h2>
                <p className="text-muted-foreground mb-2">
                  {profile.role} at {profile.company}
                </p>
                <div className="flex items-center text-sm text-muted-foreground mb-4">
                  <MapPin className="h-4 w-4 mr-1" />
                  <span>{profile.location}</span>
                </div>

                <Button variant="secondary" className="w-full mb-4">
                  Connect
                </Button>
                <Button variant="outline" className="w-full">
                  <MessageSquare className="mr-2 h-4 w-4" />
                  Message
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="mb-6">
            <CardHeader className="pb-0">
              <h3 className="font-semibold">Contact Information</h3>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-3">
                <div className="flex items-center">
                  <Mail className="h-4 w-4 text-muted-foreground mr-2" />
                  <span className="text-sm">{profile.email}</span>
                </div>
                <div className="flex items-center">
                  <Phone className="h-4 w-4 text-muted-foreground mr-2" />
                  <span className="text-sm">{profile.phone}</span>
                </div>
                <div className="flex items-center">
                  <Globe className="h-4 w-4 text-muted-foreground mr-2" />
                  <span className="text-sm">{profile.website}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="mb-6">
            <CardHeader className="pb-0">
              <h3 className="font-semibold">Skills</h3>
            </CardHeader>
            <CardContent className="p-6">
              <div className="flex flex-wrap gap-2">
                {profile.skills.map((skill, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-0">
              <h3 className="font-semibold">Certifications</h3>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-3">
                {profile.certifications.map((cert, index) => (
                  <div key={index} className="flex items-center">
                    <Award className="h-4 w-4 text-primary mr-2" />
                    <span className="text-sm">{cert}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - About, Experience, Posts */}
        <div className="md:col-span-2">
          <Card className="mb-6">
            <CardHeader className="pb-0">
              <h3 className="font-semibold">About</h3>
            </CardHeader>
            <CardContent className="p-6">
              <p>{profile.about}</p>
            </CardContent>
          </Card>

          <Card className="mb-6">
            <CardHeader className="pb-0">
              <h3 className="font-semibold">Experience</h3>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-6">
                {profile.experience.map((exp, index) => (
                  <div key={index} className="border-l-2 border-primary/30 pl-4">
                    <h4 className="font-semibold">{exp.title}</h4>
                    <div className="flex items-center text-sm mb-1">
                      <Briefcase className="h-4 w-4 text-muted-foreground mr-2" />
                      <span>{exp.company}</span>
                    </div>
                    <div className="flex items-center text-sm text-muted-foreground mb-2">
                      <Calendar className="h-4 w-4 mr-2" />
                      <span>{exp.period}</span>
                    </div>
                    <p className="text-sm">{exp.description}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="mb-6">
            <CardHeader className="pb-0">
              <h3 className="font-semibold">Education</h3>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                {profile.education.map((edu, index) => (
                  <div key={index} className="border-l-2 border-primary/30 pl-4">
                    <h4 className="font-semibold">{edu.degree}</h4>
                    <div className="flex items-center text-sm mb-1">
                      <BookOpen className="h-4 w-4 text-muted-foreground mr-2" />
                      <span>{edu.institution}</span>
                    </div>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4 mr-2" />
                      <span>{edu.year}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-0">
              <h3 className="font-semibold">Activity</h3>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-6">
                {profile.posts.map((post) => (
                  <div key={post.id} className="border-b pb-6 last:border-b-0 last:pb-0">
                    <div className="flex items-center mb-2">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mr-3">
                        <User className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <h4 className="font-semibold">{profile.name}</h4>
                        <p className="text-xs text-muted-foreground">{post.time}</p>
                      </div>
                    </div>
                    <p className="mb-4">{post.content}</p>
                    <div className="flex gap-4">
                      <Button variant="ghost" size="sm" className="text-muted-foreground">
                        <ThumbsUp className="h-4 w-4 mr-2" />
                        {post.likes}
                      </Button>
                      <Button variant="ghost" size="sm" className="text-muted-foreground">
                        <MessageSquare className="h-4 w-4 mr-2" />
                        {post.comments}
                      </Button>
                      <Button variant="ghost" size="sm" className="text-muted-foreground">
                        <Share2 className="h-4 w-4 mr-2" />
                        {post.shares}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}