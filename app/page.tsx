import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { createLegacyClient } from "@/lib/supabase-server";
import {
  Award,
  BarChart,
  BookOpen,
  Briefcase,
  ClipboardCheck,
  Heart,
  Leaf,
  Shield,
  Users,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { AuthButtons } from "./components/auth-buttons";
import { HeroAuthButtons } from "./components/hero-auth-buttons";

export default async function Home() {
  // Check if user is authenticated and redirect to feed
  const supabase = createLegacyClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (session) {
    redirect("/feed");
  }
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative py-20 md:py-32 overflow-hidden">
        <div className="absolute inset-0 w-full h-full overflow-hidden">
          <div className="absolute inset-0 bg-gray-100" /> {/* Placeholder before video loads */}
          <video
            className="absolute inset-0 w-full h-full object-cover opacity-20"
            autoPlay
            loop
            muted
            playsInline
            preload="none"
          >
            <source src="/ssbg.mp4" type="video/mp4" />
          </video>
        </div>
        <div className="container relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-4xl leading-20 md:text-5xl font-bold mb-6 text-black/89">
                Connect with ESG & EHS Professionals Worldwide
              </h1>
              <p className="text-lg md:text-xl mb-8 text-black/70">
                Join the premier network for Environmental, Social, Governance, and Health & Safety
                professionals to share knowledge, advance your career, and shape a safer future.
              </p>
              <div className="flex flex-col w-full ">
                <div className="mt-4 w-full">
                  <AuthButtons />
                </div>

                <div className="mt-6">
                  {/* Import the client component with the auth buttons */}
                  <HeroAuthButtons />
                </div>
              </div>
            </div>
            <div className="hidden md:block">
              <Image
                src="/medium-shot-people-working-together.jpg"
                alt="Safety Shaper Platform"
                width={500}
                height={400}
                className="rounded-lg shadow-2xl"
              />
            </div>
          </div>
          <div>
            <p className="mt-20">Trusted by the world’s leading organizations professional</p>
          </div>
          <div className="mt-10 flex flex-wrap items-center justify-center sm:justify-between gap-8 md:gap-12 lg:gap-16">
            <div>
              <Image
                src="/acc.webp"
                alt="ACC Logo"
                width={80}
                height={40}
                className="w-20 grayscale backdrop-opacity-10"
                priority={false}
                loading="lazy"
              />
            </div>
            <div>
              <Image
                src="/adiyalogo.webp"
                alt="Adiya Logo"
                width={64}
                height={32}
                className="w-16 grayscale backdrop-opacity-10"
                priority={false}
                loading="lazy"
              />
            </div>
            <div>
              <Image
                src="/lt.webp"
                alt="LT Logo"
                width={40}
                height={40}
                className="w-10 grayscale backdrop-opacity-10"
                priority={false}
                loading="lazy"
              />
            </div>
            <div>
              <Image
                src="/tatas.svg"
                alt="Tata Logo"
                width={64}
                height={32}
                className="w-16 grayscale backdrop-opacity-10"
                priority={false}
                loading="lazy"
              />
            </div>
            <div>
              <Image
                src="/Siemens-logo.webp"
                alt="Siemens Logo"
                width={80}
                height={40}
                className="w-20 grayscale backdrop-opacity-10"
                priority={false}
                loading="lazy"
              />
            </div>
            <div>
              <Image
                src="/kpmg.svg"
                alt="KPMG Logo"
                width={80}
                height={40}
                className="w-20"
                priority={false}
                loading="lazy"
              />
            </div>
            <div>
              <Image
                src="/sap.svg"
                alt="SAP Logo"
                width={80}
                height={40}
                className="w-20"
                priority={false}
                loading="lazy"
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
                    Connect with professionals who understand the unique challenges of ESG and EHS
                    roles.
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
                    Access a wealth of resources, best practices, and regulatory updates specific to
                    your field.
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
                    Discover job opportunities tailored to your expertise and build your
                    professional reputation.
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
            Our platform caters to professionals across the full spectrum of Environmental, Social,
            Governance, and Health & Safety disciplines.
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
          <h2 className="text-3xl font-bold mb-6">
            Ready to Connect with ESG & EHS Professionals?
          </h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Join thousands of professionals shaping a safer and more sustainable future.
          </p>
          <div className="flex justify-center gap-4">
            <Button asChild size="lg" variant="secondary">
              <Link href="/auth/login">Join Now</Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="bg-transparent text-white hover:bg-white/10"
            >
              <Link href="/auth/login">Sign In</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
