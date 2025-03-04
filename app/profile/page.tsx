
"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { supabase } from "@/lib/supabase"
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
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState({
    name: "Sarah Johnson",
    role: "ESG Compliance Manager",
    company: "GreenTech Solutions",
    location: "San Francisco, CA",
    email: "sarah.johnson@example.com",
    phone: "+1 (555) 123-4567",
    website: "www.sarahjohnson.com",
    about:
      "Environmental, Social, and Governance professional with 8+ years of experience in sustainability reporting, compliance, and stakeholder engagement. Specializing in carbon footprint reduction and climate risk management.",
    experience: [
      {
        role: "ESG Compliance Manager",
        company: "GreenTech Solutions",
        date: "2020 - Present",
        description:
          "Lead sustainability initiatives and ESG reporting. Reduced carbon emissions by 25% through innovative processes.",
      },
      {
        role: "Sustainability Specialist",
        company: "Eco Consultants Inc.",
        date: "2016 - 2020",
        description:
          "Advised clients on environmental compliance and sustainability strategies. Implemented GRI reporting framework for 15+ organizations.",
      },
    ],
    education: [
      {
        degree: "M.S. Environmental Management",
        school: "Stanford University",
        date: "2014 - 2016",
      },
      {
        degree: "B.S. Environmental Science",
        school: "University of California, Berkeley",
        date: "2010 - 2014",
      },
    ],
    certifications: ["Certified GRI Sustainability Professional", "CDP Climate Change Certification", "ISO 14001 Lead Auditor"],
    skills: ["Sustainability Reporting", "Carbon Accounting", "ESG Risk Assessment", "Stakeholder Engagement", "GRI, SASB, TCFD Frameworks", "Environmental Compliance", "Climate Risk Management"],
    posts: [
      {
        id: 1,
        content:
          "Just presented our climate risk assessment methodology at the Global ESG Summit. Grateful for the positive feedback! #ESG #ClimateRisk",
        time: "3 days ago",
        likes: 32,
        comments: 8,
      },
    ],
  })

  useEffect(() => {
    const checkUser = async () => {
      const { data } = await supabase.auth.getSession()
      if (!data.session) {
        router.push('/auth/login')
      } else {
        setUser(data.session.user)
        // Here you would typically fetch the user's profile from your database
        // For now, we'll use the mock data
        setLoading(false)
      }
    }
    
    checkUser()
  }, [router])

  if (loading) {
    return (
      <div className="container flex items-center justify-center min-h-screen">
        <p>Loading profile...</p>
      </div>
    )
  }

  return (
    <div className="container py-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Profile Card */}
        <div className="md:col-span-1 space-y-6">
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col items-center space-y-4">
                <div className="h-32 w-32 rounded-full bg-muted flex items-center justify-center">
                  <User className="h-16 w-16 text-muted-foreground" />
                </div>
                <div className="text-center">
                  <h2 className="text-2xl font-bold">{profile.name}</h2>
                  <p className="text-muted-foreground">{profile.role}</p>
                  <div className="flex items-center justify-center text-muted-foreground mt-1">
                    <MapPin className="mr-1 h-4 w-4" />
                    <span>{profile.location}</span>
                  </div>
                  <div className="flex items-center justify-center text-muted-foreground mt-1">
                    <Briefcase className="mr-1 h-4 w-4" />
                    <span>{profile.company}</span>
                  </div>
                </div>

                <div className="w-full space-y-2 pt-4">
                  <div className="flex items-center text-sm">
                    <Mail className="mr-2 h-4 w-4 text-muted-foreground" />
                    <span>{profile.email}</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <Phone className="mr-2 h-4 w-4 text-muted-foreground" />
                    <span>{profile.phone}</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <Globe className="mr-2 h-4 w-4 text-muted-foreground" />
                    <span>{profile.website}</span>
                  </div>
                </div>

                <div className="w-full pt-4">
                  <Button className="w-full">Connect</Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Skills Card */}
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold">Skills</h3>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {profile.skills.map((skill, index) => (
                  <div key={index} className="bg-muted text-muted-foreground rounded-full px-3 py-1 text-sm">
                    {skill}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Certifications Card */}
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold">Certifications</h3>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {profile.certifications.map((cert, index) => (
                  <li key={index} className="flex items-start">
                    <Award className="h-5 w-5 mr-2 text-muted-foreground mt-0.5" />
                    <span>{cert}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="md:col-span-2 space-y-6">
          {/* About Card */}
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold">About</h3>
            </CardHeader>
            <CardContent>
              <p>{profile.about}</p>
            </CardContent>
          </Card>

          {/* Experience Card */}
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold">Experience</h3>
            </CardHeader>
            <CardContent>
              <ul className="space-y-6">
                {profile.experience.map((exp, index) => (
                  <li key={index} className="relative pl-6 border-l-2 border-muted pb-6 last:pb-0">
                    <div className="absolute w-3 h-3 bg-primary rounded-full -left-[7px] top-1"></div>
                    <h4 className="font-semibold">{exp.role}</h4>
                    <div className="flex items-center text-sm text-muted-foreground mb-2">
                      <Briefcase className="mr-1 h-4 w-4" />
                      <span>{exp.company}</span>
                      <span className="mx-2">•</span>
                      <Calendar className="mr-1 h-4 w-4" />
                      <span>{exp.date}</span>
                    </div>
                    <p className="text-sm">{exp.description}</p>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* Education Card */}
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold">Education</h3>
            </CardHeader>
            <CardContent>
              <ul className="space-y-4">
                {profile.education.map((edu, index) => (
                  <li key={index} className="relative pl-6 border-l-2 border-muted pb-4 last:pb-0">
                    <div className="absolute w-3 h-3 bg-primary rounded-full -left-[7px] top-1"></div>
                    <h4 className="font-semibold">{edu.degree}</h4>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <BookOpen className="mr-1 h-4 w-4" />
                      <span>{edu.school}</span>
                      <span className="mx-2">•</span>
                      <Calendar className="mr-1 h-4 w-4" />
                      <span>{edu.date}</span>
                    </div>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* Posts Card */}
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold">Recent Activity</h3>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {profile.posts.map((post) => (
                  <div key={post.id} className="border rounded-md p-4">
                    <p>{post.content}</p>
                    <div className="flex items-center text-xs text-muted-foreground mt-2">
                      <Calendar className="mr-1 h-3 w-3" />
                      <span>{post.time}</span>
                    </div>
                    <div className="flex justify-between mt-4 border-t pt-3">
                      <Button variant="ghost" size="sm" className="flex items-center">
                        <ThumbsUp className="mr-2 h-4 w-4" />
                        <span>{post.likes}</span>
                      </Button>
                      <Button variant="ghost" size="sm" className="flex items-center">
                        <MessageSquare className="mr-2 h-4 w-4" />
                        <span>{post.comments}</span>
                      </Button>
                      <Button variant="ghost" size="sm" className="flex items-center">
                        <Share2 className="mr-2 h-4 w-4" />
                        <span>Share</span>
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
