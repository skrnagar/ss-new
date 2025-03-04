
import { Metadata } from "next"
import { notFound } from "next/navigation"
import { createClient } from "@/lib/supabase-server"
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
  Edit,
} from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

type ProfilePageProps = {
  params: {
    username: string
  }
}

export async function generateMetadata({ params }: ProfilePageProps): Promise<Metadata> {
  const supabase = createClient()
  
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('username', params.username)
    .single()
  
  if (!profile) {
    return {
      title: 'Profile Not Found - Safety Shaper',
    }
  }
  
  return {
    title: `${profile.name || profile.username} - Safety Shaper`,
    description: profile.headline || 'Safety Shaper professional profile',
  }
}

export default async function ProfilePage({ params }: ProfilePageProps) {
  const supabase = createClient()
  
  // Get current logged in user (if any)
  const { data: { session } } = await supabase.auth.getSession()
  
  // Get profile by username
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('username', params.username)
    .single()
  
  if (!profile) {
    notFound()
  }
  
  // Get user data from auth
  const { data: userData } = await supabase.auth.admin.getUserById(profile.id)
  const user = userData?.user
  
  const isCurrentUser = session?.user?.id === profile.id
  
  const getInitials = (name: string) => {
    if (!name) return 'US'
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .substring(0, 2)
  }
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat('en-US', { 
      year: 'numeric', 
      month: 'long'
    }).format(date)
  }

  return (
    <div className="container py-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1">
          <Card className="sticky top-24">
            <CardContent className="pt-6">
              <div className="flex flex-col items-center text-center mb-6">
                <Avatar className="h-24 w-24 mb-4">
                  <AvatarImage src={profile.avatar_url || "/placeholder-user.jpg"} alt={profile.name || profile.username} />
                  <AvatarFallback className="text-xl">{getInitials(profile.name || user?.user_metadata?.name || profile.username)}</AvatarFallback>
                </Avatar>
                <h1 className="text-2xl font-bold">{profile.name || user?.user_metadata?.name || profile.username}</h1>
                <p className="text-muted-foreground mt-1">{profile.headline}</p>
                
                <div className="flex items-center text-sm text-muted-foreground mt-2">
                  <MapPin className="h-4 w-4 mr-1" />
                  <span>{profile.location || "Location not specified"}</span>
                </div>
              </div>

              {isCurrentUser && (
                <Button variant="outline" className="w-full mb-4" asChild>
                  <a href="/profile/edit">
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Profile
                  </a>
                </Button>
              )}

              {!isCurrentUser && (
                <div className="space-y-2 mb-4">
                  <Button className="w-full">Connect</Button>
                  <Button variant="outline" className="w-full">
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Message
                  </Button>
                </div>
              )}

              <div className="border-t pt-4 mt-4">
                <h2 className="font-semibold mb-2">Contact Information</h2>
                {user?.email && (
                  <div className="flex items-center text-sm mb-2">
                    <Mail className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span>{user.email}</span>
                  </div>
                )}
                {profile.phone && (
                  <div className="flex items-center text-sm mb-2">
                    <Phone className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span>{profile.phone}</span>
                  </div>
                )}
                {profile.website && (
                  <div className="flex items-center text-sm">
                    <Globe className="h-4 w-4 mr-2 text-muted-foreground" />
                    <a href={profile.website} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                      {profile.website.replace(/^https?:\/\/(www\.)?/, '')}
                    </a>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader className="pb-3">
              <h2 className="text-xl font-semibold">About</h2>
            </CardHeader>
            <CardContent>
              <p className="whitespace-pre-wrap">{profile.bio || "No bio provided yet."}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <h2 className="text-xl font-semibold">Experience</h2>
            </CardHeader>
            <CardContent>
              {profile.company && profile.position ? (
                <div className="mb-4 pb-4 border-b last:border-0 last:pb-0 last:mb-0">
                  <div className="flex items-start">
                    <div className="bg-muted rounded-md p-2 mr-4">
                      <Briefcase className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-medium">{profile.position}</h3>
                      <div className="text-sm text-muted-foreground mb-1">{profile.company}</div>
                      <div className="text-sm text-muted-foreground">
                        <Calendar className="inline h-3 w-3 mr-1" />
                        {profile.experience_start_date 
                          ? `${formatDate(profile.experience_start_date)} - ${profile.experience_end_date ? formatDate(profile.experience_end_date) : 'Present'}`
                          : "No date provided"
                        }
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-muted-foreground">No experience information provided yet.</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <h2 className="text-xl font-semibold">Education</h2>
            </CardHeader>
            <CardContent>
              {profile.education ? (
                <div className="mb-4 pb-4 border-b last:border-0 last:pb-0 last:mb-0">
                  <div className="flex items-start">
                    <div className="bg-muted rounded-md p-2 mr-4">
                      <BookOpen className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-medium">{profile.education}</h3>
                      <div className="text-sm text-muted-foreground">
                        <Calendar className="inline h-3 w-3 mr-1" />
                        {profile.education_start_date 
                          ? `${formatDate(profile.education_start_date)} - ${profile.education_end_date ? formatDate(profile.education_end_date) : 'Present'}`
                          : "No date provided"
                        }
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-muted-foreground">No education information provided yet.</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <h2 className="text-xl font-semibold">Certifications</h2>
            </CardHeader>
            <CardContent>
              {profile.certifications ? (
                <div className="mb-4 pb-4 border-b last:border-0 last:pb-0 last:mb-0">
                  <div className="flex items-start">
                    <div className="bg-muted rounded-md p-2 mr-4">
                      <Award className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-medium">{profile.certifications}</h3>
                      <div className="text-sm text-muted-foreground">
                        <Calendar className="inline h-3 w-3 mr-1" />
                        {profile.certification_date 
                          ? formatDate(profile.certification_date)
                          : "No date provided"
                        }
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-muted-foreground">No certification information provided yet.</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
