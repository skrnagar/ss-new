import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Shield, Users, BookOpen, Briefcase, Award, ClipboardCheck, Leaf, BarChart, Heart } from "lucide-react"
import { AuthButtons } from "./components/auth-buttons"
import { redirect } from "next/navigation"
import { createLegacyClient } from "@/lib/supabase-server"

export default async function Home() {
  // Check if user is authenticated and redirect to feed
  const supabase = createLegacyClient()
  const { data: { session } } = await supabase.auth.getSession()

  if (session) {
    redirect('/feed')
  }
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative py-20 md:py-32 overflow-hidden">
        <div className="absolute inset-0 w-full h-full overflow-hidden">
          <video 
            className="absolute inset-0 w-full h-full object-cover opacity-60" 
            autoPlay 
            loop 
            muted 
            playsInline
          >
            <source src="/ssbg.mp4" type="video/mp4" />
          </video>
        </div>
        <div className="container relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold mb-6 text-black/80">Connect with ESG & EHS Professionals Worldwide</h1>
              <p className="text-lg md:text-xl mb-8 text-black/70">
                Join the premier network for Environmental, Social, Governance, and Health & Safety professionals to
                share knowledge, advance your career, and shape a safer future.
              </p>
              <div className="flex flex-col w-full md:w-1/2">
                <AuthButtons className="mt-4 px-4 py-3 bg-white rounded-xl hover:bg-gray-100 hover:border-blue-700" />

                <div className="mt-6 flex flex-col space-y-3">
                  <Link href="/auth/google"> {/* Assuming /auth/google handles Google OAuth */}
                    <button className="flex items-center justify-center bg-white py-3 px-4 rounded-xl w-full hover:bg-gray-100 transition-colors">
                      <svg className="mr-2 h-5 w-5" viewBox="0 0 24 24">
                        <path
                          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                          fill="#4285F4"
                        />
                        <path
                          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                          fill="#34A853"
                        />
                        <path
                          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                          fill="#FBBC05"
                        />
                        <path
                          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                          fill="#EA4335"
                        />
                      </svg>
                      Continue with Google
                    </button>
                  </Link>
                  <Link href="/auth/linkedin"> {/* Assuming /auth/linkedin handles LinkedIn OAuth */}
                    <button className="flex items-center justify-center bg-[#0077B5] py-3 px-4 rounded-xl w-full text-white hover:bg-[#0077B5]/90 transition-colors">
                      <svg className="mr-2 h-5 w-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.32 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.79M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z"></path>
                      </svg>
                      Continue with LinkedIn
                    </button>
                  </Link>
                </div>
              </div>
            </div>
            <div className="hidden md:block">
              <img
                src="/medium-shot-people-working-together.jpg?height=400&width=500"
                alt="Safety Shaper Platform"
                className="rounded-lg shadow-2xl"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-background">
        <div className="container">
          <h2 className="text-3xl font-bold text-center mb-12">Why Join Safety Shaper?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card>
              <CardContent className="pt-6">
                <div className="flex flex-col items-center text-center">
                  <div className="bg-primary/10 p-3 rounded-full mb-4">
                    <Shield className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">Specialized Network</h3>
                  <p className="text-muted-foreground">
                    Connect with professionals who understand the unique challenges of ESG and EHS roles.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex flex-col items-center text-center">
                  <div className="bg-primary/10 p-3 rounded-full mb-4">
                    <BookOpen className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">Knowledge Hub</h3>
                  <p className="text-muted-foreground">
                    Access a wealth of resources, best practices, and regulatory updates specific to your field.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex flex-col items-center text-center">
                  <div className="bg-primary/10 p-3 rounded-full mb-4">
                    <Briefcase className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">Career Growth</h3>
                  <p className="text-muted-foreground">
                    Discover job opportunities tailored to your expertise and build your professional reputation.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Statistics Section */}
      <section className="py-16 bg-muted">
        <div className="container">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div>
              <div className="text-4xl font-bold text-primary mb-2">10K+</div>
              <p className="text-muted-foreground">Professionals</p>
            </div>
            <div>
              <div className="text-4xl font-bold text-primary mb-2">500+</div>
              <p className="text-muted-foreground">Companies</p>
            </div>
            <div>
              <div className="text-4xl font-bold text-primary mb-2">50+</div>
              <p className="text-muted-foreground">Industry Groups</p>
            </div>
            <div>
              <div className="text-4xl font-bold text-primary mb-2">200+</div>
              <p className="text-muted-foreground">Resources</p>
            </div>
          </div>
        </div>
      </section>

      {/* Areas Section */}
      <section className="py-16 bg-background">
        <div className="container">
          <h2 className="text-3xl font-bold text-center mb-4">Focus Areas</h2>
          <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
            Our platform caters to professionals across the full spectrum of Environmental, Social, Governance, and
            Health & Safety disciplines.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-start">
                  <div className="bg-primary/10 p-2 rounded-full mr-4">
                    <Leaf className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">Environmental</h3>
                    <p className="text-sm text-muted-foreground">
                      Sustainability, resource management, and environmental compliance.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-start">
                  <div className="bg-primary/10 p-2 rounded-full mr-4">
                    <Users className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">Social</h3>
                    <p className="text-sm text-muted-foreground">
                      Labor practices, community engagement, and human rights.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-start">
                  <div className="bg-primary/10 p-2 rounded-full mr-4">
                    <BarChart className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">Governance</h3>
                    <p className="text-sm text-muted-foreground">
                      Ethics, corporate governance, and regulatory compliance.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-start">
                  <div className="bg-primary/10 p-2 rounded-full mr-4">
                    <Shield className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">Health & Safety</h3>
                    <p className="text-sm text-muted-foreground">
                      Occupational safety, risk management, and health programs.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-start">
                  <div className="bg-primary/10 p-2 rounded-full mr-4">
                    <Award className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">Certifications</h3>
                    <p className="text-sm text-muted-foreground">
                      ISO standards, industry certifications, and accreditations.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-start">
                  <div className="bg-primary/10 p-2 rounded-full mr-4">
                    <ClipboardCheck className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">Compliance</h3>
                    <p className="text-sm text-muted-foreground">
                      Regulatory compliance, auditing, and reporting frameworks.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-start">
                  <div className="bg-primary/10 p-2 rounded-full mr-4">
                    <Heart className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">Wellbeing</h3>
                    <p className="text-sm text-muted-foreground">
                      Employee wellness, mental health, and work-life balance.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-start">
                  <div className="bg-primary/10 p-2 rounded-full mr-4">
                    <Briefcase className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">Jobs</h3>
                    <p className="text-sm text-muted-foreground">
                      Career opportunities and professional development.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-primary text-white text-center">
        <div className="container">
          <h2 className="text-3xl font-bold mb-6">Ready to Connect with ESG & EHS Professionals?</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Join thousands of professionals shaping a safer and more sustainable future.
          </p>
          <div className="flex justify-center gap-4">
            <Button asChild size="lg" variant="secondary">
              <Link href="/auth/login">Join Now</Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="bg-transparent text-white hover:bg-white/10">
              <Link href="/auth/login">Sign In</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}