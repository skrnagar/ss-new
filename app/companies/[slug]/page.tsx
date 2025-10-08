import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { createLegacyClient } from "@/lib/supabase-server";
import { Building, MapPin, Users, Globe, Linkedin, Twitter, Calendar, Briefcase, TrendingUp, Edit, Plus } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CompanyFollowButton } from "@/components/company-follow-button";
import { CompanyPostSection } from "@/components/company-post-section";

export const revalidate = 3600;

export default async function CompanyPage({ params }: { params: { slug: string } }) {
  const { slug } = params;
  const supabase = createLegacyClient();

  const {
    data: { session },
  } = await supabase.auth.getSession();

  // Get company by slug
  const { data: company, error } = await supabase
    .from("companies")
    .select("*")
    .eq("slug", slug)
    .single();

  if (error || !company) {
    return notFound();
  }

  // Check if user is admin
  let isAdmin = false;
  if (session?.user?.id) {
    const { data: adminData } = await supabase
      .from("company_admins")
      .select("id")
      .eq("company_id", company.id)
      .eq("user_id", session.user.id)
      .single();

    isAdmin = !!adminData;
  }

  // Fetch company posts
  const { data: posts } = await supabase
    .from("company_posts")
    .select(`
      *,
      profiles:posted_by (
        id,
        username,
        full_name,
        avatar_url
      )
    `)
    .eq("company_id", company.id)
    .order("created_at", { ascending: false })
    .limit(10);

  // Fetch employees (people with current experience at this company)
  const { data: employees } = await supabase
    .from("experiences")
    .select(`
      id,
      title,
      profiles:user_id (
        id,
        username,
        full_name,
        avatar_url,
        headline
      )
    `)
    .eq("company_id", company.id)
    .eq("is_current", true)
    .limit(12);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Company Header */}
        <Card className="mb-6">
          {/* Cover Image */}
          {company.cover_image_url && (
            <div className="h-48 bg-gradient-to-r from-blue-500 to-purple-600 rounded-t-lg overflow-hidden">
              <img
                src={company.cover_image_url}
                alt={company.name}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-6">
              {/* Company Logo */}
              <div className="flex-shrink-0">
                <Avatar className="h-24 w-24 rounded-xl ring-4 ring-white shadow-lg">
                  <AvatarImage src={company.logo_url || ""} alt={company.name} />
                  <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white text-3xl rounded-xl">
                    {company.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
              </div>

              {/* Company Info */}
              <div className="flex-1">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                      {company.name}
                      {company.verified && (
                        <Badge variant="secondary" className="ml-2 bg-blue-100 text-blue-700">
                          Verified
                        </Badge>
                      )}
                    </h1>
                    {company.tagline && (
                      <p className="text-lg text-gray-600 mb-3">{company.tagline}</p>
                    )}
                    {company.industry && (
                      <Badge variant="outline" className="mr-2">{company.industry}</Badge>
                    )}
                  </div>

                  <div className="flex gap-2">
                    {session && (
                      <div suppressHydrationWarning className="client-only-component">
                        {/* @ts-ignore */}
                        <CompanyFollowButton
                          companyId={company.id}
                          userId={session.user.id}
                        />
                      </div>
                    )}
                    {isAdmin && (
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/companies/${slug}/edit`}>
                          <Edit className="h-4 w-4 mr-2" />
                          Edit Page
                        </Link>
                      </Button>
                    )}
                  </div>
                </div>

                {/* Stats */}
                <div className="flex flex-wrap gap-6 text-sm text-gray-600">
                  {company.headquarters_location && (
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      <span>{company.headquarters_location}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    <span>{company.employee_count} employees</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4" />
                    <span>{company.follower_count} followers</span>
                  </div>
                  {company.founded_year && (
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      <span>Founded {company.founded_year}</span>
                    </div>
                  )}
                </div>

                {/* Social Links */}
                {(company.website_url || company.linkedin_url || company.twitter_url) && (
                  <div className="flex gap-3 mt-4">
                    {company.website_url && (
                      <a
                        href={company.website_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 rounded-full bg-gray-100 hover:bg-primary/10 hover:text-primary transition-all"
                      >
                        <Globe className="h-5 w-5" />
                      </a>
                    )}
                    {company.linkedin_url && (
                      <a
                        href={company.linkedin_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 rounded-full bg-gray-100 hover:bg-primary/10 hover:text-primary transition-all"
                      >
                        <Linkedin className="h-5 w-5" />
                      </a>
                    )}
                    {company.twitter_url && (
                      <a
                        href={company.twitter_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 rounded-full bg-gray-100 hover:bg-primary/10 hover:text-primary transition-all"
                      >
                        <Twitter className="h-5 w-5" />
                      </a>
                    )}
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* About Section */}
            {company.description && (
              <Card>
                <CardHeader>
                  <CardTitle>About</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 whitespace-pre-line leading-relaxed">
                    {company.description}
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Specialties */}
            {company.specialties && company.specialties.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Specialties</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {company.specialties.map((specialty: string, index: number) => (
                      <Badge key={index} variant="secondary">
                        {specialty}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Company Posts/Updates */}
            <div suppressHydrationWarning className="client-only-component">
              {/* @ts-ignore */}
              <CompanyPostSection
                companyId={company.id}
                isAdmin={isAdmin}
                initialPosts={posts || []}
              />
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Employees */}
            {employees && employees.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Briefcase className="h-5 w-5 text-primary" />
                    People ({company.employee_count})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {employees.map((emp: any) => (
                      <Link
                        key={emp.id}
                        href={`/profile/${emp.profiles?.username || emp.profiles?.id}`}
                        className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={emp.profiles?.avatar_url} />
                          <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                            {emp.profiles?.full_name?.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm text-gray-900 truncate">
                            {emp.profiles?.full_name}
                          </p>
                          <p className="text-xs text-gray-600 truncate">
                            {emp.title}
                          </p>
                        </div>
                      </Link>
                    ))}
                  </div>
                  {company.employee_count > 12 && (
                    <Button variant="link" className="w-full mt-3" size="sm">
                      See all {company.employee_count} employees
                    </Button>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Company Details */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Company Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                {company.company_size && (
                  <div>
                    <span className="font-medium text-gray-900">Size:</span>
                    <p className="text-gray-600">{company.company_size} employees</p>
                  </div>
                )}
                {company.company_type && (
                  <div>
                    <span className="font-medium text-gray-900">Type:</span>
                    <p className="text-gray-600">{company.company_type}</p>
                  </div>
                )}
                {company.founded_year && (
                  <div>
                    <span className="font-medium text-gray-900">Founded:</span>
                    <p className="text-gray-600">{company.founded_year}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

