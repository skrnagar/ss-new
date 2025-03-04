import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Shield, Users, BookOpen, Briefcase, Award, ClipboardCheck, Leaf, BarChart, Heart } from "lucide-react"
import { AuthButtons } from "./components/auth-buttons"
import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase-server"

export default async function Home() {
  // Check if user is authenticated and redirect to feed
  const supabase = createClient()
  const { data: { session } } = await supabase.auth.getSession()

  if (session) {
    redirect('/feed')
  }
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative py-20 md:py-32 overflow-hidden bg-gradient-to-r from-primary to-primary/80 text-white">
        <div className="absolute inset-0 bg-[url('/placeholder.svg?height=800&width=1600')] bg-cover bg-center opacity-10"></div>
        <div className="container relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold mb-6">Connect with ESG & EHS Professionals Worldwide</h1>
              <p className="text-lg md:text-xl mb-8 text-white/90">
                Join the premier network for Environmental, Social, Governance, and Health & Safety professionals to
                share knowledge, advance your career, and shape a safer future.
              </p>
              <div>
                <AuthButtons />
              </div>
            </div>
            <div className="hidden md:block">
              <img
                src="/placeholder.svg?height=400&width=500"
                alt="Safety Shaper Platform"
                className="rounded-lg shadow-2xl"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-light">
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Why Join Safety Shaper?</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Our platform offers specialized tools and resources for ESG and EHS professionals to connect, learn, and
              grow.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="border-none shadow-md">
              <CardContent className="pt-6">
                <div className="flex flex-col items-center text-center">
                  <div className="rounded-full bg-primary/10 p-3 mb-4">
                    <Users className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">Professional Networking</h3>
                  <p className="text-muted-foreground">
                    Connect with industry peers, mentors, and experts in the ESG and EHS fields.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-none shadow-md">
              <CardContent className="pt-6">
                <div className="flex flex-col items-center text-center">
                  <div className="rounded-full bg-secondary/10 p-3 mb-4">
                    <BookOpen className="h-8 w-8 text-secondary" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">Knowledge Sharing</h3>
                  <p className="text-muted-foreground">
                    Access and share valuable resources, best practices, and regulatory updates.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-none shadow-md">
              <CardContent className="pt-6">
                <div className="flex flex-col items-center text-center">
                  <div className="rounded-full bg-primary/10 p-3 mb-4">
                    <Briefcase className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">Career Opportunities</h3>
                  <p className="text-muted-foreground">
                    Discover job openings tailored to your skills and experience in the ESG and EHS sectors.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Core Modules Section */}
      <section id="core-modules" className="py-20">
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Core Platform Modules</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Safety Shaper offers comprehensive tools designed specifically for ESG and EHS professionals.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="flex gap-4">
              <div className="rounded-full bg-primary/10 p-3 h-fit">
                <Shield className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">User Profiles</h3>
                <p className="text-muted-foreground mb-2">
                  Create detailed professional profiles showcasing your certifications, skills, and experience in the
                  ESG and EHS fields.
                </p>
                <Link href="/profiles" className="text-primary hover:underline font-medium">
                  Learn more
                </Link>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="rounded-full bg-secondary/10 p-3 h-fit">
                <Users className="h-6 w-6 text-secondary" />
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">Community & Groups</h3>
                <p className="text-muted-foreground mb-2">
                  Join industry-specific groups to discuss challenges, share solutions, and collaborate with peers.
                </p>
                <Link href="/groups" className="text-primary hover:underline font-medium">
                  Explore groups
                </Link>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="rounded-full bg-primary/10 p-3 h-fit">
                <BookOpen className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">Knowledge Center</h3>
                <p className="text-muted-foreground mb-2">
                  Access a comprehensive library of resources including HIRA, JSA, Safety Plans, and regulatory
                  documents.
                </p>
                <Link href="/knowledge" className="text-primary hover:underline font-medium">
                  Browse resources
                </Link>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="rounded-full bg-secondary/10 p-3 h-fit">
                <Briefcase className="h-6 w-6 text-secondary" />
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">Job Portal</h3>
                <p className="text-muted-foreground mb-2">
                  Find specialized ESG and EHS job opportunities or post openings for qualified professionals.
                </p>
                <Link href="/jobs" className="text-primary hover:underline font-medium">
                  View jobs
                </Link>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="rounded-full bg-primary/10 p-3 h-fit">
                <Award className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">Reward System</h3>
                <p className="text-muted-foreground mb-2">
                  Earn recognition through points, badges, and leaderboard rankings for your contributions.
                </p>
                <Link href="/rewards" className="text-primary hover:underline font-medium">
                  See rewards
                </Link>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="rounded-full bg-secondary/10 p-3 h-fit">
                <ClipboardCheck className="h-6 w-6 text-secondary" />
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">Audit & Compliance</h3>
                <p className="text-muted-foreground mb-2">
                  Manage compliance requirements with specialized tools, checklists, and real-time status indicators.
                </p>
                <Link href="/compliance" className="text-primary hover:underline font-medium">
                  Explore tools
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ESG Focus Section */}
      <section className="py-20 bg-light">
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">ESG Focus Areas</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Safety Shaper helps professionals address key Environmental, Social, and Governance challenges.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="border-none shadow-md">
              <CardContent className="pt-6">
                <div className="flex flex-col items-center text-center">
                  <div className="rounded-full bg-secondary/10 p-3 mb-4">
                    <Leaf className="h-8 w-8 text-secondary" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">Environmental</h3>
                  <p className="text-muted-foreground">
                    Connect with experts on climate change, pollution prevention, resource conservation, and
                    environmental compliance.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-none shadow-md">
              <CardContent className="pt-6">
                <div className="flex flex-col items-center text-center">
                  <div className="rounded-full bg-primary/10 p-3 mb-4">
                    <Heart className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">Social</h3>
                  <p className="text-muted-foreground">
                    Share best practices on workplace safety, employee wellbeing, community engagement, and social
                    responsibility.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-none shadow-md">
              <CardContent className="pt-6">
                <div className="flex flex-col items-center text-center">
                  <div className="rounded-full bg-secondary/10 p-3 mb-4">
                    <BarChart className="h-8 w-8 text-secondary" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">Governance</h3>
                  <p className="text-muted-foreground">
                    Discuss corporate governance, ethical standards, regulatory compliance, and transparency frameworks.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary text-white">
        <div className="container">
          <div className="text-center max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold mb-4">Ready to Shape a Safer Future?</h2>
            <p className="text-lg mb-8">
              Join thousands of ESG and EHS professionals on Safety Shaper and be part of a community dedicated to
              creating safer, more sustainable workplaces and communities.
            </p>
            <Button size="lg" className="bg-secondary hover:bg-secondary/90 text-white" asChild>
              <Link href="/auth/login?tab=register">Join Safety Shaper Today</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}