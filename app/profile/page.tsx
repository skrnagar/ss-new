import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase-server"

export default async function ProfilePage() {
  const supabase = createClient()

  const { data: { session } } = await supabase.auth.getSession()

  if (!session) {
    redirect('/auth/login')
  }

  // Get user profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('username')
    .eq('id', session.user.id)
    .single()

  if (profile?.username) {
    redirect(`/profile/${profile.username}`)
  } else {
    redirect('/profile/setup')
  }
}

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
  const profile = {
    name: "Sarah Johnson",
    role: "ESG Compliance Manager",
    company: "GreenTech Solutions",
    location: "San Francisco, CA",
    email: "sarah.johnson@example.com",
    phone: "+1 (555) 123-4567",
    website: "www.sarahjohnson.com",
    about:
      "Experienced ESG Compliance Manager with 8+ years of experience in environmental sustainability and corporate governance. Passionate about helping organizations implement effective ESG strategies and achieve compliance with regulatory requirements.",
    experience: [
      {
        title: "ESG Compliance Manager",
        company: "GreenTech Solutions",
        period: "Jan 2020 - Present",
        description:
          "Lead ESG compliance initiatives and sustainability reporting. Reduced carbon footprint by 25% through innovative programs.",
      },
      {
        title: "Environmental Specialist",
        company: "EcoSystems Inc.",
        period: "Mar 2016 - Dec 2019",
        description:
          "Managed environmental compliance programs and conducted sustainability audits for clients across various industries.",
      },
    ],
    education: [
      {
        degree: "Master of Environmental Management",
        institution: "Stanford University",
        year: "2016",
      },
      {
        degree: "Bachelor of Science in Environmental Science",
        institution: "University of California, Berkeley",
        year: "2014",
      },
    ],
    certifications: [
      "Certified ESG Analyst (CESGA)",
      "ISO 14001 Lead Auditor",
      "GRI Certified Sustainability Professional",
      "LEED Green Associate",
    ],
    skills: [
      "ESG Reporting",
      "Sustainability Strategy",
      "Environmental Compliance",
      "Carbon Footprint Analysis",
      "Stakeholder Engagement",
      "Regulatory Affairs",
      "Data Analysis",
      "Project Management",
    ],
    posts: [
      {
        id: 1,
        content:
          "Just completed our quarterly ESG audit with flying colors! Our carbon reduction initiatives have exceeded targets by 15%. Proud of the team for their dedication to sustainability. #ESGCompliance #Sustainability",
        time: "2 hours ago",
        likes: 42,
        comments: 8,
        shares: 5,
      },
      {
        id: 2,
        content:
          "Excited to share that I'll be speaking at the upcoming Sustainable Business Forum next month. Looking forward to discussing the latest trends in ESG reporting and compliance. Let me know if you'll be attending! #SustainableBusiness #ESG",
        time: "3 days ago",
        likes: 56,
        comments: 12,
        shares: 9,
      },
    ],
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

"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Pencil, Users, Briefcase, Award, FileText, MapPin, Mail, Link as LinkIcon } from "lucide-react"
import { Progress } from "@/components/ui/progress"
import Link from "next/link"

export default function ProfilePage() {
  return (
    <div className="container py-10">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Profile sidebar */}
        <div className="lg:col-span-4 space-y-6">
          <Card>
            <CardHeader className="relative pb-0">
              <div className="absolute right-4 top-4">
                <Button variant="ghost" size="icon">
                  <Pencil className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex flex-col items-center">
                <Avatar className="h-24 w-24 mb-4">
                  <AvatarImage src="/placeholder-user.jpg" alt="John Doe" />
                  <AvatarFallback>JD</AvatarFallback>
                </Avatar>
                <CardTitle className="text-2xl font-bold">John Doe</CardTitle>
                <CardDescription className="text-md text-center">
                  EHS Specialist at Green Energy Solutions
                </CardDescription>
                <div className="flex items-center mt-2">
                  <MapPin className="h-4 w-4 mr-1 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">San Francisco, CA</span>
                </div>
                <div className="flex gap-2 mt-4">
                  <Badge className="bg-secondary">Audit Specialist</Badge>
                  <Badge variant="outline">ISO 45001</Badge>
                  <Badge variant="outline">ESG</Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="text-sm font-medium">Profile completion</div>
                  <div className="text-sm text-muted-foreground">85%</div>
                </div>
                <Progress value={85} className="h-2" />

                <div className="flex justify-between items-center pt-4">
                  <Button variant="outline" className="w-full mr-2">
                    <Users className="h-4 w-4 mr-2" />
                    Connections (284)
                  </Button>
                  <Button className="w-full bg-primary">
                    <Mail className="h-4 w-4 mr-2" />
                    Message
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">About</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                EHS professional with 8+ years of experience in implementing safety programs and ensuring regulatory compliance across multiple industries. Passionate about creating safer workplaces and sustainable practices.
              </p>
              <div className="mt-4 space-y-2">
                <div className="flex items-center">
                  <Briefcase className="h-4 w-4 mr-2 text-muted-foreground" />
                  <span className="text-sm">EHS Specialist at Green Energy Solutions</span>
                </div>
                <div className="flex items-center">
                  <Award className="h-4 w-4 mr-2 text-muted-foreground" />
                  <span className="text-sm">Certified Safety Professional (CSP)</span>
                </div>
                <div className="flex items-center">
                  <FileText className="h-4 w-4 mr-2 text-muted-foreground" />
                  <span className="text-sm">MBA in Sustainable Business</span>
                </div>
                <div className="flex items-center">
                  <LinkIcon className="h-4 w-4 mr-2 text-muted-foreground" />
                  <Link href="https://example.com/portfolio" className="text-sm text-primary hover:underline">
                    https://example.com/portfolio
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Skills & Expertise</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary">ISO 45001</Badge>
                <Badge variant="secondary">Risk Assessment</Badge>
                <Badge variant="secondary">Safety Audits</Badge>
                <Badge variant="secondary">Compliance Management</Badge>
                <Badge variant="secondary">Sustainability Reporting</Badge>
                <Badge variant="secondary">Carbon Footprint</Badge>
                <Badge variant="secondary">ESG Strategy</Badge>
                <Badge variant="secondary">Incident Investigation</Badge>
                <Badge variant="secondary">Safety Culture</Badge>
                <Badge variant="secondary">OSHA</Badge>
                <Badge variant="secondary">Environmental Permits</Badge>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Certifications</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="font-medium">Certified Safety Professional (CSP)</div>
                <div className="text-sm text-muted-foreground">Board of Certified Safety Professionals</div>
                <div className="text-sm text-muted-foreground">Expires: Dec 2025</div>
              </div>
              <div>
                <div className="font-medium">Certified Environmental Professional (CEP)</div>
                <div className="text-sm text-muted-foreground">Institute of Professional Environmental Practice</div>
                <div className="text-sm text-muted-foreground">Expires: Aug 2024</div>
              </div>
              <div>
                <div className="font-medium">ISO 45001 Lead Auditor</div>
                <div className="text-sm text-muted-foreground">International Organization for Standardization</div>
                <div className="text-sm text-muted-foreground">Issued: May 2022</div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main content */}
        <div className="lg:col-span-8 space-y-6">
          <Tabs defaultValue="activity">
            <TabsList className="w-full">
              <TabsTrigger value="activity" className="flex-1">Activity</TabsTrigger>
              <TabsTrigger value="experience" className="flex-1">Experience</TabsTrigger>
              <TabsTrigger value="contributions" className="flex-1">Contributions</TabsTrigger>
              <TabsTrigger value="badges" className="flex-1">Badges</TabsTrigger>
            </TabsList>

            <TabsContent value="activity" className="space-y-4 mt-6">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex space-x-4">
                    <Avatar>
                      <AvatarImage src="/placeholder-user.jpg" alt="John Doe" />
                      <AvatarFallback>JD</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="font-medium">John Doe</span>
                          <span className="text-muted-foreground"> shared a document</span>
                        </div>
                        <span className="text-xs text-muted-foreground">2 days ago</span>
                      </div>
                      <p className="mt-2">
                        Just updated our Safety Management System to align with the new ISO 45001:2018 standard. Check it out!
                      </p>
                      <div className="mt-4 p-4 bg-muted rounded-md">
                        <div className="flex items-center">
                          <FileText className="h-10 w-10 mr-3 text-primary" />
                          <div>
                            <div className="font-medium">Safety Management System - ISO 45001:2018</div>
                            <div className="text-sm text-muted-foreground">PDF Document • 2.4MB</div>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4 mt-4">
                        <Button variant="ghost" size="sm">
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1">
                            <path d="M7 10v12"></path><path d="M15 5.88 14 10h5.83a2 2 0 0 1 1.92 2.56l-2.33 8A2 2 0 0 1 17.5 22H4a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h2.76a2 2 0 0 0 1.79-1.11L12 2h0a3.13 3.13 0 0 1 3 3.88Z"></path>
                          </svg>
                          Like
                        </Button>
                        <Button variant="ghost" size="sm">
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1">
                            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                          </svg>
                          Comment
                        </Button>
                        <Button variant="ghost" size="sm">
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1">
                            <circle cx="18" cy="5" r="3"></circle><circle cx="6" cy="12" r="3"></circle><circle cx="18" cy="19" r="3"></circle><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line>
                          </svg>
                          Share
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex space-x-4">
                    <Avatar>
                      <AvatarImage src="/placeholder-user.jpg" alt="John Doe" />
                      <AvatarFallback>JD</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="font-medium">John Doe</span>
                          <span className="text-muted-foreground"> posted in </span>
                          <span className="font-medium">Renewable Energy Compliance</span>
                        </div>
                        <span className="text-xs text-muted-foreground">1 week ago</span>
                      </div>
                      <p className="mt-2">
                        Has anyone implemented the new carbon reporting requirements for renewable energy projects? Looking for some guidance on best practices for data collection and verification.
                      </p>
                      <div className="flex items-center space-x-4 mt-4">
                        <Button variant="ghost" size="sm">
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1">
                            <path d="M7 10v12"></path><path d="M15 5.88 14 10h5.83a2 2 0 0 1 1.92 2.56l-2.33 8A2 2 0 0 1 17.5 22H4a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h2.76a2 2 0 0 0 1.79-1.11L12 2h0a3.13 3.13 0 0 1 3 3.88Z"></path>
                          </svg>
                          Like
                        </Button>
                        <Button variant="ghost" size="sm">
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1">
                            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                          </svg>
                          Comment
                        </Button>
                        <Button variant="ghost" size="sm">
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1">
                            <circle cx="18" cy="5" r="3"></circle><circle cx="6" cy="12" r="3"></circle><circle cx="18" cy="19" r="3"></circle><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line>
                          </svg>
                          Share
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="experience" className="space-y-4 mt-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Work Experience</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="border-l-2 border-primary pl-4 space-y-2">
                    <div className="flex justify-between">
                      <div className="font-medium">EHS Specialist</div>
                      <div className="text-sm text-muted-foreground">Jun 2021 - Present</div>
                    </div>
                    <div className="text-sm font-medium text-primary">Green Energy Solutions</div>
                    <p className="text-sm text-muted-foreground">
                      Led compliance and safety programs for renewable energy projects across the Western US. Implemented ISO 45001 management systems and reduced incident rates by 35% in the first year.
                    </p>
                    <div className="flex flex-wrap gap-2 mt-2">
                      <Badge variant="outline">ISO 45001</Badge>
                      <Badge variant="outline">Incident Investigation</Badge>
                      <Badge variant="outline">Environmental Permits</Badge>
                    </div>
                  </div>

                  <div className="border-l-2 border-muted pl-4 space-y-2">
                    <div className="flex justify-between">
                      <div className="font-medium">Safety Manager</div>
                      <div className="text-sm text-muted-foreground">Mar 2018 - May 2021</div>
                    </div>
                    <div className="text-sm font-medium text-primary">BuildRight Construction</div>
                    <p className="text-sm text-muted-foreground">
                      Managed all aspects of safety and health for commercial construction projects. Developed and implemented safety training programs for 200+ employees.
                    </p>
                    <div className="flex flex-wrap gap-2 mt-2">
                      <Badge variant="outline">OSHA</Badge>
                      <Badge variant="outline">Safety Training</Badge>
                      <Badge variant="outline">Risk Assessment</Badge>
                    </div>
                  </div>

                  <div className="border-l-2 border-muted pl-4 space-y-2">
                    <div className="flex justify-between">
                      <div className="font-medium">Environmental Specialist</div>
                      <div className="text-sm text-muted-foreground">Aug 2015 - Feb 2018</div>
                    </div>
                    <div className="text-sm font-medium text-primary">EcoSolutions Inc.</div>
                    <p className="text-sm text-muted-foreground">
                      Conducted environmental impact assessments and ensured compliance with state and federal regulations for manufacturing clients.
                    </p>
                    <div className="flex flex-wrap gap-2 mt-2">
                      <Badge variant="outline">Environmental Compliance</Badge>
                      <Badge variant="outline">Waste Management</Badge>
                      <Badge variant="outline">Auditing</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Education</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="border-l-2 border-primary pl-4 space-y-2">
                    <div className="flex justify-between">
                      <div className="font-medium">MBA, Sustainable Business</div>
                      <div className="text-sm text-muted-foreground">2013 - 2015</div>
                    </div>
                    <div className="text-sm font-medium text-primary">Stanford University</div>
                    <p className="text-sm text-muted-foreground">
                      Focused on sustainable business practices and environmental management systems.
                    </p>
                  </div>

                  <div className="border-l-2 border-muted pl-4 space-y-2">
                    <div className="flex justify-between">
                      <div className="font-medium">BS, Environmental Science</div>
                      <div className="text-sm text-muted-foreground">2009 - 2013</div>
                    </div>
                    <div className="text-sm font-medium text-primary">University of California, Berkeley</div>
                    <p className="text-sm text-muted-foreground">
                      Minor in Occupational Health and Safety.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="contributions" className="space-y-4 mt-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Resource Contributions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center border rounded-md p-4">
                    <FileText className="h-10 w-10 mr-4 text-primary" />
                    <div className="flex-1">
                      <div className="font-medium">ISO 45001 Implementation Guide</div>
                      <div className="text-sm text-muted-foreground">Shared 3 months ago • 452 downloads</div>
                    </div>
                    <Button variant="outline" size="sm">Download</Button>
                  </div>

                  <div className="flex items-center border rounded-md p-4">
                    <FileText className="h-10 w-10 mr-4 text-primary" />
                    <div className="flex-1">
                      <div className="font-medium">Environmental Compliance Checklist</div>
                      <div className="text-sm text-muted-foreground">Shared 5 months ago • 327 downloads</div>
                    </div>
                    <Button variant="outline" size="sm">Download</Button>
                  </div>

                  <div className="flex items-center border rounded-md p-4">
                    <FileText className="h-10 w-10 mr-4 text-primary" />
                    <div className="flex-1">
                      <div className="font-medium">Safety Audit Templates Bundle</div>
                      <div className="text-sm text-muted-foreground">Shared 8 months ago • 716 downloads</div>
                    </div>
                    <Button variant="outline" size="sm">Download</Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Community Activity</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="font-medium">Questions Answered</div>
                      <div className="flex justify-between items-center mt-2">
                        <Progress value={75} className="h-2 flex-1 mr-4" />
                        <div className="text-sm font-medium">75</div>
                      </div>
                    </div>

                    <div>
                      <div className="font-medium">Resources Shared</div>
                      <div className="flex justify-between items-center mt-2">
                        <Progress value={42} className="h-2 flex-1 mr-4" />
                        <div className="text-sm font-medium">42</div>
                      </div>
                    </div>

                    <div>
                      <div className="font-medium">Group Participation</div>
                      <div className="flex justify-between items-center mt-2">
                        <Progress value={88} className="h-2 flex-1 mr-4" />
                        <div className="text-sm font-medium">88%</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="badges" className="space-y-4 mt-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Achievement Badges</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    <div className="flex flex-col items-center p-4 border rounded-md">
                      <div className="bg-primary/10 p-3 rounded-full mb-2">
                        <Award className="h-8 w-8 text-primary" />
                      </div>
                      <div className="font-medium text-center">Top Contributor</div>
                      <div className="text-xs text-muted-foreground text-center">Earned Jun 2023</div>
                    </div>

                    <div className="flex flex-col items-center p-4 border rounded-md">
                      <div className="bg-secondary/10 p-3 rounded-full mb-2">
                        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-secondary">
                          <circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline>
                        </svg>
                      </div>
                      <div className="font-medium text-center">Early Adopter</div>
                      <div className="text-xs text-muted-foreground text-center">Earned Jan 2023</div>
                    </div>

                    <div className="flex flex-col items-center p-4 border rounded-md">
                      <div className="bg-primary/10 p-3 rounded-full mb-2">
                        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
                          <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M22 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                        </svg>
                      </div>
                      <div className="font-medium text-center">Community Builder</div>
                      <div className="text-xs text-muted-foreground text-center">Earned Mar 2023</div>
                    </div>

                    <div className="flex flex-col items-center p-4 border rounded-md">
                      <div className="bg-secondary/10 p-3 rounded-full mb-2">
                        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-secondary">
                          <path d="M22 12h-4l-3 9L9 3l-3 9H2"></path>
                        </svg>
                      </div>
                      <div className="font-medium text-center">Safety Expert</div>
                      <div className="text-xs text-muted-foreground text-center">Earned Apr 2023</div>
                    </div>

                    <div className="flex flex-col items-center p-4 border rounded-md">
                      <div className="bg-primary/10 p-3 rounded-full mb-2">
                        <FileText className="h-8 w-8 text-primary" />
                      </div>
                      <div className="font-medium text-center">Resource Guru</div>
                      <div className="text-xs text-muted-foreground text-center">Earned May 2023</div>
                    </div>

                    <div className="flex flex-col items-center p-4 border rounded-md">
                      <div className="bg-secondary/10 p-3 rounded-full mb-2">
                        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-secondary">
                          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                        </svg>
                      </div>
                      <div className="font-medium text-center">Rising Star</div>
                      <div className="text-xs text-muted-foreground text-center">Earned Feb 2023</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}