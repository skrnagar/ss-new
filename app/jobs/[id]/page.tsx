import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { createLegacyClient } from "@/lib/supabase-server";
import { 
  Briefcase, 
  MapPin, 
  DollarSign, 
  Clock, 
  Users,
  Building,
  Calendar,
  ArrowLeft,
  Bookmark,
  Share2,
  Eye,
  FileText
} from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { JobApplyButton } from "@/components/job-apply-button";
import { JobSaveButton } from "@/components/job-save-button";
import { formatDistanceToNow } from "date-fns";

export const revalidate = 3600;

export default async function JobDetailPage({ params }: { params: { id: string } }) {
  const { id } = params;
  const supabase = createLegacyClient();

  const {
    data: { session },
  } = await supabase.auth.getSession();

  // Fetch job details with poster info
  const { data: job, error } = await supabase
    .from("jobs")
    .select(`
      *,
      companies(id, name, slug, logo_url, employee_count, industry),
      poster:profiles!posted_by(id, username, full_name, avatar_url, headline)
    `)
    .eq("id", id)
    .single();

  if (error || !job) {
    return notFound();
  }

  // Check if user has applied
  let hasApplied = false;
  let isJobPoster = false;
  if (session?.user?.id) {
    const { data: application } = await supabase
      .from("job_applications")
      .select("id")
      .eq("job_id", id)
      .eq("user_id", session.user.id)
      .single();

    hasApplied = !!application;
    isJobPoster = job.posted_by === session.user.id;
  }

  // Fetch similar jobs
  const { data: similarJobs } = await supabase
    .from("jobs")
    .select("id, title, company_name, location, employment_type, created_at")
    .eq("is_active", true)
    .neq("id", id)
    .limit(3);

  // Format salary
  const formatSalary = () => {
    if (!job.salary_min && !job.salary_max) return null;
    
    const format = (amount: number) => {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: job.salary_currency || 'USD',
        maximumFractionDigits: 0,
      }).format(amount);
    };

    if (job.salary_min && job.salary_max) {
      return `${format(job.salary_min)} - ${format(job.salary_max)}`;
    } else if (job.salary_min) {
      return `${format(job.salary_min)}+`;
    } else {
      return `Up to ${format(job.salary_max)}`;
    }
  };

  const salary = formatSalary();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="mb-6">
          <Link href="/jobs" className="inline-flex items-center text-sm text-muted-foreground hover:text-primary">
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to Jobs
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardContent className="pt-6">
                {/* Company & Job Title */}
                <div className="flex gap-4 mb-6">
                  {job.companies?.logo_url ? (
                    <Link href={`/companies/${job.companies.slug}`}>
                      <Avatar className="h-16 w-16 rounded-lg">
                        <AvatarImage src={job.companies.logo_url} alt={job.company_name} />
                        <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white text-xl rounded-lg">
                          {job.company_name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                    </Link>
                  ) : (
                    <Avatar className="h-16 w-16 rounded-lg">
                      <AvatarFallback className="bg-gray-100 text-gray-600 rounded-lg">
                        <Building className="h-8 w-8" />
                      </AvatarFallback>
                    </Avatar>
                  )}

                  <div className="flex-1">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">{job.title}</h1>
                    {job.companies ? (
                      <Link 
                        href={`/companies/${job.companies.slug}`}
                        className="text-lg text-gray-700 hover:text-primary font-medium"
                      >
                        {job.company_name}
                      </Link>
                    ) : (
                      <p className="text-lg text-gray-700 font-medium">{job.company_name}</p>
                    )}
                  </div>
                </div>

                {/* Key Info */}
                <div className="flex flex-wrap gap-4 mb-6">
                  {job.location && (
                    <div className="flex items-center gap-2 text-gray-700">
                      <MapPin className="h-4 w-4" />
                      <span>{job.location}</span>
                    </div>
                  )}
                  {job.workplace_type && (
                    <Badge variant="secondary">{job.workplace_type}</Badge>
                  )}
                  {job.employment_type && (
                    <Badge variant="outline">{job.employment_type}</Badge>
                  )}
                  {job.experience_level && (
                    <Badge variant="outline">{job.experience_level}</Badge>
                  )}
                </div>

                {salary && (
                  <div className="flex items-center gap-2 text-gray-700 mb-6 text-lg font-semibold">
                    <DollarSign className="h-5 w-5 text-green-600" />
                    <span>{salary}</span>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-3 mb-6">
                  {session && !isJobPoster && (
                    <div suppressHydrationWarning className="client-only-component flex gap-3 flex-1">
                      {/* @ts-ignore */}
                      <JobApplyButton
                        jobId={job.id}
                        userId={session.user.id}
                        hasApplied={hasApplied}
                      />
                      {/* @ts-ignore */}
                      <JobSaveButton
                        jobId={job.id}
                        userId={session.user.id}
                      />
                    </div>
                  )}
                  {isJobPoster && (
                    <Button asChild className="flex-1">
                      <Link href={`/jobs/${job.id}/applications`}>
                        <FileText className="h-4 w-4 mr-2" />
                        View Applications ({job.applications_count})
                      </Link>
                    </Button>
                  )}
                  <Button variant="outline" size="sm">
                    <Share2 className="h-4 w-4 mr-2" />
                    Share
                  </Button>
                </div>

                <Separator className="my-6" />

                {/* Description */}
                <div className="space-y-4">
                  <h2 className="text-xl font-semibold">About the Role</h2>
                  <p className="text-gray-700 whitespace-pre-line leading-relaxed">
                    {job.description}
                  </p>
                </div>

                {/* Skills */}
                {job.skills_required && job.skills_required.length > 0 && (
                  <>
                    <Separator className="my-6" />
                    <div>
                      <h3 className="text-lg font-semibold mb-3">Required Skills</h3>
                      <div className="flex flex-wrap gap-2">
                        {job.skills_required.map((skill: string, idx: number) => (
                          <Badge key={idx} variant="secondary">
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </>
                )}

                {/* Benefits */}
                {job.benefits && job.benefits.length > 0 && (
                  <>
                    <Separator className="my-6" />
                    <div>
                      <h3 className="text-lg font-semibold mb-3">Benefits</h3>
                      <ul className="list-disc list-inside space-y-2">
                        {job.benefits.map((benefit: string, idx: number) => (
                          <li key={idx} className="text-gray-700">{benefit}</li>
                        ))}
                      </ul>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Job Statistics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Users className="h-4 w-4" />
                    <span>Applicants</span>
                  </div>
                  <span className="font-semibold">{job.applications_count}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Eye className="h-4 w-4" />
                    <span>Views</span>
                  </div>
                  <span className="font-semibold">{job.views_count}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Clock className="h-4 w-4" />
                    <span>Posted</span>
                  </div>
                  <span className="text-sm">
                    {formatDistanceToNow(new Date(job.created_at), { addSuffix: true })}
                  </span>
                </div>
                {job.application_deadline && (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Calendar className="h-4 w-4" />
                      <span>Deadline</span>
                    </div>
                    <span className="text-sm font-medium text-red-600">
                      {new Date(job.application_deadline).toLocaleDateString()}
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Posted By */}
            {job.poster && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Posted By</CardTitle>
                </CardHeader>
                <CardContent>
                  <Link 
                    href={`/profile/${job.poster.username || job.poster.id}`} 
                    className="block hover:bg-gray-50 rounded-lg p-3 -m-3 transition-colors"
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={job.poster.avatar_url} />
                        <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                          {job.poster.full_name?.charAt(0) || 'U'}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-900 hover:text-primary truncate">
                          {job.poster.full_name || 'Recruiter'}
                        </p>
                        {job.poster.headline && (
                          <p className="text-sm text-gray-600 truncate">{job.poster.headline}</p>
                        )}
                      </div>
                    </div>
                    <p className="text-xs text-gray-500">Hiring Manager</p>
                  </Link>
                </CardContent>
              </Card>
            )}

            {/* Company Info */}
            {job.companies && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">About {job.company_name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <Link href={`/companies/${job.companies.slug}`} className="block">
                    <div className="flex items-center gap-3 mb-4">
                      <Avatar className="h-12 w-12 rounded-lg">
                        <AvatarImage src={job.companies.logo_url} />
                        <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white rounded-lg">
                          {job.company_name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-semibold hover:text-primary">{job.company_name}</p>
                        {job.companies.industry && (
                          <p className="text-sm text-gray-600">{job.companies.industry}</p>
                        )}
                      </div>
                    </div>
                  </Link>
                  {job.companies.employee_count > 0 && (
                    <p className="text-sm text-gray-600 mb-3">
                      <Users className="h-4 w-4 inline mr-1" />
                      {job.companies.employee_count} employees
                    </p>
                  )}
                  <Button variant="outline" size="sm" asChild className="w-full">
                    <Link href={`/companies/${job.companies.slug}`}>
                      View Company Page
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Similar Jobs */}
            {similarJobs && similarJobs.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Similar Jobs</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {similarJobs.map((simJob: any) => (
                    <Link
                      key={simJob.id}
                      href={`/jobs/${simJob.id}`}
                      className="block p-3 rounded-lg border hover:border-primary hover:shadow-sm transition-all"
                    >
                      <h4 className="font-semibold text-sm text-gray-900 mb-1 hover:text-primary">
                        {simJob.title}
                      </h4>
                      <p className="text-xs text-gray-600 mb-1">{simJob.company_name}</p>
                      {simJob.location && (
                        <div className="flex items-center gap-1 text-xs text-gray-500">
                          <MapPin className="h-3 w-3" />
                          <span>{simJob.location}</span>
                        </div>
                      )}
                    </Link>
                  ))}
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

