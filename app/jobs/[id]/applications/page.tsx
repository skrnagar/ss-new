import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { createLegacyClient } from "@/lib/supabase-server";
import { 
  ArrowLeft,
  User,
  Mail,
  FileText,
  Calendar,
  ExternalLink,
  Briefcase
} from "lucide-react";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { formatDistanceToNow } from "date-fns";
import { ApplicationStatusManager } from "@/components/application-status-manager";

export const revalidate = 0; // Always fetch fresh data

interface Application {
  id: string;
  status: string;
  applied_at: string;
  cover_letter: string;
  resume_url: string | null;
  notes: string | null;
  reviewed_at: string | null;
  applicant: {
    id: string;
    username: string;
    full_name: string;
    avatar_url: string;
    headline: string;
    email: string;
  };
}

export default async function JobApplicationsPage({ params }: { params: { id: string } }) {
  const { id } = params;
  const supabase = createLegacyClient();

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session?.user?.id) {
    redirect("/auth/login");
  }

  // Fetch job details
  const { data: job, error: jobError } = await supabase
    .from("jobs")
    .select("id, title, company_name, posted_by")
    .eq("id", id)
    .single();

  if (jobError || !job) {
    return notFound();
  }

  // Check if user is authorized (job poster or company admin)
  const isAuthorized = job.posted_by === session.user.id;

  if (!isAuthorized) {
    // Check if user is company admin
    const { data: jobWithCompany } = await supabase
      .from("jobs")
      .select("company_id")
      .eq("id", id)
      .single();

    if (jobWithCompany?.company_id) {
      const { data: adminCheck } = await supabase
        .from("company_admins")
        .select("id")
        .eq("company_id", jobWithCompany.company_id)
        .eq("user_id", session.user.id)
        .single();

      if (!adminCheck) {
        redirect("/jobs");
      }
    } else {
      redirect("/jobs");
    }
  }

  // Fetch applications with applicant details
  const { data: applications, error: appsError } = await supabase
    .from("job_applications")
    .select(`
      id,
      status,
      applied_at,
      cover_letter,
      resume_url,
      notes,
      reviewed_at,
      user_id,
      profiles!job_applications_user_id_fkey(
        id,
        username,
        full_name,
        avatar_url,
        headline,
        email
      )
    `)
    .eq("job_id", id)
    .order("applied_at", { ascending: false });

  // Debug logging
  if (typeof window !== 'undefined') {
    console.log("=== Job Applications Debug ===");
    console.log("Job ID:", id);
    console.log("Job poster:", job.posted_by);
    console.log("Current user:", session.user.id);
    console.log("Is authorized:", isAuthorized);
    console.log("Applications data:", applications);
    console.log("Applications error:", appsError);
    console.log("Applications count:", applications?.length || 0);
    console.log("================================");
  }

  // Transform the data to match our interface
  const allApplications: Application[] = (applications || []).map((app: any) => ({
    id: app.id,
    status: app.status,
    applied_at: app.applied_at,
    cover_letter: app.cover_letter,
    resume_url: app.resume_url,
    notes: app.notes,
    reviewed_at: app.reviewed_at,
    applicant: {
      id: app.profiles?.id || app.user_id,
      username: app.profiles?.username || '',
      full_name: app.profiles?.full_name || 'Anonymous User',
      avatar_url: app.profiles?.avatar_url || '',
      headline: app.profiles?.headline || '',
      email: app.profiles?.email || '',
    }
  }));

  // Group by status
  const pending = allApplications.filter((app) => app.status === "pending");
  const reviewed = allApplications.filter((app) => app.status === "reviewed");
  const shortlisted = allApplications.filter((app) => app.status === "shortlisted");
  const accepted = allApplications.filter((app) => app.status === "accepted");
  const rejected = allApplications.filter((app) => app.status === "rejected");

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "reviewed":
        return "bg-blue-100 text-blue-800";
      case "shortlisted":
        return "bg-purple-100 text-purple-800";
      case "accepted":
        return "bg-green-100 text-green-800";
      case "rejected":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const ApplicationCard = ({ application }: { application: Application }) => (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="pt-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3 flex-1">
            <Link href={`/profile/${application.applicant.username || application.applicant.id}`}>
              <Avatar className="h-14 w-14 cursor-pointer hover:ring-2 ring-primary">
                <AvatarImage src={application.applicant.avatar_url} />
                <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white text-lg">
                  {application.applicant.full_name?.charAt(0) || 'U'}
                </AvatarFallback>
              </Avatar>
            </Link>
            <div className="flex-1 min-w-0">
              <Link 
                href={`/profile/${application.applicant.username || application.applicant.id}`}
                className="font-semibold text-lg hover:text-primary block truncate"
              >
                {application.applicant.full_name}
              </Link>
              {application.applicant.headline && (
                <p className="text-sm text-gray-600 truncate">{application.applicant.headline}</p>
              )}
              <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                <div className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  <span>Applied {formatDistanceToNow(new Date(application.applied_at), { addSuffix: true })}</span>
                </div>
                {application.applicant.email && (
                  <div className="flex items-center gap-1">
                    <Mail className="h-3 w-3" />
                    <a href={`mailto:${application.applicant.email}`} className="hover:underline">
                      {application.applicant.email}
                    </a>
                  </div>
                )}
              </div>
            </div>
          </div>
          <Badge className={getStatusColor(application.status)}>
            {application.status}
          </Badge>
        </div>

        {/* Cover Letter */}
        <div className="mb-4">
          <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Cover Letter
          </h4>
          <p className="text-sm text-gray-700 whitespace-pre-line bg-gray-50 p-3 rounded-lg">
            {application.cover_letter}
          </p>
        </div>

        {/* Resume Link */}
        {application.resume_url && (
          <div className="mb-4">
            <a
              href={application.resume_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm text-primary hover:underline"
            >
              <ExternalLink className="h-4 w-4" />
              View Resume/Portfolio
            </a>
          </div>
        )}

        {/* Internal Notes */}
        {application.notes && (
          <div className="mb-4">
            <h4 className="font-semibold text-sm mb-2">Internal Notes</h4>
            <p className="text-sm text-gray-600 bg-yellow-50 p-3 rounded-lg">
              {application.notes}
            </p>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2 pt-4 border-t">
          <Button variant="outline" size="sm" asChild>
            <Link href={`/profile/${application.applicant.username || application.applicant.id}`}>
              <User className="h-4 w-4 mr-2" />
              View Profile
            </Link>
          </Button>
          <ApplicationStatusManager
            applicationId={application.id}
            currentStatus={application.status}
            currentNotes={application.notes || ""}
          />
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="mb-6">
          <Link href={`/jobs/${id}`} className="inline-flex items-center text-sm text-muted-foreground hover:text-primary">
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to Job
          </Link>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="text-2xl mb-2">{job.title}</CardTitle>
                <p className="text-gray-600">{job.company_name}</p>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-primary">{allApplications.length}</div>
                <div className="text-sm text-gray-600">Total Applications</div>
              </div>
            </div>
          </CardHeader>
        </Card>

        <Tabs defaultValue="all" className="space-y-6">
          <TabsList className="grid w-full max-w-3xl grid-cols-6">
            <TabsTrigger value="all">
              All ({allApplications.length})
            </TabsTrigger>
            <TabsTrigger value="pending">
              Pending ({pending.length})
            </TabsTrigger>
            <TabsTrigger value="reviewed">
              Reviewed ({reviewed.length})
            </TabsTrigger>
            <TabsTrigger value="shortlisted">
              Shortlisted ({shortlisted.length})
            </TabsTrigger>
            <TabsTrigger value="accepted">
              Accepted ({accepted.length})
            </TabsTrigger>
            <TabsTrigger value="rejected">
              Rejected ({rejected.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-4">
            {allApplications.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <User className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No applications yet</h3>
                  <p className="text-gray-600">Applications will appear here when candidates apply</p>
                </CardContent>
              </Card>
            ) : (
              allApplications.map((app) => <ApplicationCard key={app.id} application={app} />)
            )}
          </TabsContent>

          <TabsContent value="pending" className="space-y-4">
            {pending.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <p className="text-gray-600">No pending applications</p>
                </CardContent>
              </Card>
            ) : (
              pending.map((app) => <ApplicationCard key={app.id} application={app} />)
            )}
          </TabsContent>

          <TabsContent value="reviewed" className="space-y-4">
            {reviewed.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <p className="text-gray-600">No reviewed applications</p>
                </CardContent>
              </Card>
            ) : (
              reviewed.map((app) => <ApplicationCard key={app.id} application={app} />)
            )}
          </TabsContent>

          <TabsContent value="shortlisted" className="space-y-4">
            {shortlisted.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <p className="text-gray-600">No shortlisted applications</p>
                </CardContent>
              </Card>
            ) : (
              shortlisted.map((app) => <ApplicationCard key={app.id} application={app} />)
            )}
          </TabsContent>

          <TabsContent value="accepted" className="space-y-4">
            {accepted.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <p className="text-gray-600">No accepted applications</p>
                </CardContent>
              </Card>
            ) : (
              accepted.map((app) => <ApplicationCard key={app.id} application={app} />)
            )}
          </TabsContent>

          <TabsContent value="rejected" className="space-y-4">
            {rejected.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <p className="text-gray-600">No rejected applications</p>
                </CardContent>
              </Card>
            ) : (
              rejected.map((app) => <ApplicationCard key={app.id} application={app} />)
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

