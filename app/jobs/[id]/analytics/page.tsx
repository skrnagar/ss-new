import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { createLegacyClient } from "@/lib/supabase-server";
import { 
  ArrowLeft,
  Eye,
  Users,
  TrendingUp,
  Calendar,
  CheckCircle2,
  Clock,
  XCircle,
  UserCheck,
  BarChart
} from "lucide-react";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { formatDistanceToNow, format, subDays } from "date-fns";

export const revalidate = 0;

export default async function JobAnalyticsPage({ params }: { params: { id: string } }) {
  const { id } = params;
  const supabase = createLegacyClient();

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session?.user?.id) {
    redirect("/auth/login");
  }

  // Fetch job details
  const { data: job, error } = await supabase
    .from("jobs")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !job) {
    return notFound();
  }

  // Check authorization
  if (job.posted_by !== session.user.id) {
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

  // Fetch applications with stats
  const { data: applications } = await supabase
    .from("job_applications")
    .select("id, status, applied_at")
    .eq("job_id", id);

  const totalApplications = applications?.length || 0;
  const pendingCount = applications?.filter((a) => a.status === "pending").length || 0;
  const reviewedCount = applications?.filter((a) => a.status === "reviewed").length || 0;
  const shortlistedCount = applications?.filter((a) => a.status === "shortlisted").length || 0;
  const acceptedCount = applications?.filter((a) => a.status === "accepted").length || 0;
  const rejectedCount = applications?.filter((a) => a.status === "rejected").length || 0;

  // Calculate daily applications for last 7 days
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = subDays(new Date(), 6 - i);
    const dateStr = format(date, "yyyy-MM-dd");
    const count = applications?.filter((app) => 
      app.applied_at.startsWith(dateStr)
    ).length || 0;
    return {
      date: format(date, "MMM dd"),
      count,
    };
  });

  const avgResponseTime = reviewedCount > 0 
    ? Math.round((reviewedCount + shortlistedCount + acceptedCount + rejectedCount) / totalApplications * 100) 
    : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="mb-6 flex items-center justify-between">
          <Link href={`/jobs/${id}`} className="inline-flex items-center text-sm text-muted-foreground hover:text-primary">
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to Job
          </Link>
          <Link href={`/jobs/${id}/applications`} className="text-sm text-primary hover:underline">
            View Applications →
          </Link>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-2xl">{job.title} - Analytics</CardTitle>
            <p className="text-gray-600">{job.company_name}</p>
          </CardHeader>
        </Card>

        {/* Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Total Views</p>
                  <p className="text-3xl font-bold text-gray-900">{job.views_count}</p>
                </div>
                <div className="p-3 bg-blue-100 rounded-full">
                  <Eye className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Total Applications</p>
                  <p className="text-3xl font-bold text-gray-900">{totalApplications}</p>
                </div>
                <div className="p-3 bg-green-100 rounded-full">
                  <Users className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Conversion Rate</p>
                  <p className="text-3xl font-bold text-gray-900">
                    {job.views_count > 0 ? Math.round((totalApplications / job.views_count) * 100) : 0}%
                  </p>
                </div>
                <div className="p-3 bg-purple-100 rounded-full">
                  <TrendingUp className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Days Active</p>
                  <p className="text-3xl font-bold text-gray-900">
                    {Math.floor((Date.now() - new Date(job.created_at).getTime()) / (1000 * 60 * 60 * 24))}
                  </p>
                </div>
                <div className="p-3 bg-orange-100 rounded-full">
                  <Calendar className="h-6 w-6 text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Application Status Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart className="h-5 w-5" />
                Application Status
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-yellow-600" />
                  <span className="text-gray-700">Pending</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold">{pendingCount}</span>
                  <Badge className="bg-yellow-100 text-yellow-800">
                    {totalApplications > 0 ? Math.round((pendingCount / totalApplications) * 100) : 0}%
                  </Badge>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Eye className="h-5 w-5 text-blue-600" />
                  <span className="text-gray-700">Reviewed</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold">{reviewedCount}</span>
                  <Badge className="bg-blue-100 text-blue-800">
                    {totalApplications > 0 ? Math.round((reviewedCount / totalApplications) * 100) : 0}%
                  </Badge>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <UserCheck className="h-5 w-5 text-purple-600" />
                  <span className="text-gray-700">Shortlisted</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold">{shortlistedCount}</span>
                  <Badge className="bg-purple-100 text-purple-800">
                    {totalApplications > 0 ? Math.round((shortlistedCount / totalApplications) * 100) : 0}%
                  </Badge>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                  <span className="text-gray-700">Accepted</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold">{acceptedCount}</span>
                  <Badge className="bg-green-100 text-green-800">
                    {totalApplications > 0 ? Math.round((acceptedCount / totalApplications) * 100) : 0}%
                  </Badge>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <XCircle className="h-5 w-5 text-red-600" />
                  <span className="text-gray-700">Rejected</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold">{rejectedCount}</span>
                  <Badge className="bg-red-100 text-red-800">
                    {totalApplications > 0 ? Math.round((rejectedCount / totalApplications) * 100) : 0}%
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Application Timeline */}
          <Card>
            <CardHeader>
              <CardTitle>Applications (Last 7 Days)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {last7Days.map((day, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <span className="text-sm text-gray-600 w-16">{day.date}</span>
                    <div className="flex-1 bg-gray-100 rounded-full h-8 relative overflow-hidden">
                      <div
                        className="bg-primary h-full rounded-full flex items-center justify-end pr-2"
                        style={{
                          width: `${Math.max((day.count / Math.max(...last7Days.map(d => d.count), 1)) * 100, day.count > 0 ? 10 : 0)}%`,
                        }}
                      >
                        {day.count > 0 && (
                          <span className="text-white text-xs font-semibold">{day.count}</span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Key Metrics */}
        <Card>
          <CardHeader>
            <CardTitle>Key Insights</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-4 bg-gray-50 rounded-lg">
                <h4 className="font-semibold text-gray-900 mb-2">Review Progress</h4>
                <p className="text-3xl font-bold text-primary mb-1">{avgResponseTime}%</p>
                <p className="text-sm text-gray-600">of applications reviewed</p>
              </div>

              <div className="p-4 bg-gray-50 rounded-lg">
                <h4 className="font-semibold text-gray-900 mb-2">Success Rate</h4>
                <p className="text-3xl font-bold text-green-600 mb-1">
                  {totalApplications > 0 ? Math.round(((acceptedCount + shortlistedCount) / totalApplications) * 100) : 0}%
                </p>
                <p className="text-sm text-gray-600">candidates progressed</p>
              </div>

              <div className="p-4 bg-gray-50 rounded-lg">
                <h4 className="font-semibold text-gray-900 mb-2">Posted</h4>
                <p className="text-lg font-bold text-gray-900 mb-1">
                  {formatDistanceToNow(new Date(job.created_at), { addSuffix: true })}
                </p>
                <p className="text-sm text-gray-600">
                  {format(new Date(job.created_at), "MMM dd, yyyy")}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

