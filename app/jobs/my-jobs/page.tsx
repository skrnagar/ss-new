"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/auth-context";
import { 
  Briefcase, 
  FileText, 
  Bookmark, 
  Send,
  Clock,
  CheckCircle2,
  XCircle,
  MapPin,
  Building,
  Eye,
  Users,
  Plus
} from "lucide-react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { useRouter } from "next/navigation";

interface Application {
  id: string;
  status: string;
  applied_at: string;
  cover_letter: string;
  jobs: {
    id: string;
    title: string;
    company_name: string;
    location: string;
    employment_type: string;
  };
}

interface PostedJob {
  id: string;
  title: string;
  company_name: string;
  location: string;
  employment_type: string;
  applications_count: number;
  views_count: number;
  is_active: boolean;
  created_at: string;
}

interface SavedJob {
  id: string;
  saved_at: string;
  jobs: {
    id: string;
    title: string;
    company_name: string;
    location: string;
    employment_type: string;
    applications_count: number;
  };
}

export default function MyJobsPage() {
  const router = useRouter();
  const { session } = useAuth();
  const [applications, setApplications] = useState<Application[]>([]);
  const [postedJobs, setPostedJobs] = useState<PostedJob[]>([]);
  const [savedJobs, setSavedJobs] = useState<SavedJob[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (session?.user?.id) {
      fetchAllData();
    }
  }, [session]);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        fetchApplications(),
        fetchPostedJobs(),
        fetchSavedJobs(),
      ]);
    } finally {
      setLoading(false);
    }
  };

  const fetchApplications = async () => {
    if (!session?.user?.id) return;

    const { data, error } = await supabase
      .from("job_applications")
      .select(`
        id,
        status,
        applied_at,
        cover_letter,
        jobs(id, title, company_name, location, employment_type)
      `)
      .eq("user_id", session.user.id)
      .order("applied_at", { ascending: false });

    if (!error && data) {
      setApplications(data as any);
    }
  };

  const fetchPostedJobs = async () => {
    if (!session?.user?.id) return;

    const { data, error } = await supabase
      .from("jobs")
      .select("*")
      .eq("posted_by", session.user.id)
      .order("created_at", { ascending: false });

    if (!error && data) {
      setPostedJobs(data);
    }
  };

  const fetchSavedJobs = async () => {
    if (!session?.user?.id) return;

    const { data, error } = await supabase
      .from("saved_jobs")
      .select(`
        id,
        saved_at,
        jobs(id, title, company_name, location, employment_type, applications_count)
      `)
      .eq("user_id", session.user.id)
      .order("saved_at", { ascending: false });

    if (!error && data) {
      setSavedJobs(data as any);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <Clock className="h-4 w-4 text-yellow-600" />;
      case "reviewed":
      case "shortlisted":
        return <CheckCircle2 className="h-4 w-4 text-blue-600" />;
      case "accepted":
        return <CheckCircle2 className="h-4 w-4 text-green-600" />;
      case "rejected":
        return <XCircle className="h-4 w-4 text-red-600" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

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

  const handleToggleJobStatus = async (jobId: string, currentStatus: boolean) => {
    const { error } = await supabase
      .from("jobs")
      .update({ is_active: !currentStatus })
      .eq("id", jobId);

    if (!error) {
      setPostedJobs((prev) =>
        prev.map((job) =>
          job.id === jobId ? { ...job, is_active: !currentStatus } : job
        )
      );
    }
  };

  if (!session) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 py-20">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-2xl font-bold mb-4">Sign in to view your jobs</h2>
          <Button asChild>
            <Link href="/auth/login">Sign In</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <Briefcase className="h-8 w-8 text-primary" />
                My Jobs
              </h1>
              <p className="text-gray-600 mt-1">Manage your applications and job postings</p>
            </div>
            <Button asChild>
              <Link href="/jobs/post" className="gap-2">
                <Plus className="h-4 w-4" />
                Post a Job
              </Link>
            </Button>
          </div>
        </div>

        <Tabs defaultValue="applications" className="space-y-6">
          <TabsList className="grid w-full max-w-md grid-cols-3">
            <TabsTrigger value="applications" className="gap-2">
              <Send className="h-4 w-4" />
              Applications ({applications.length})
            </TabsTrigger>
            <TabsTrigger value="posted" className="gap-2">
              <FileText className="h-4 w-4" />
              Posted ({postedJobs.length})
            </TabsTrigger>
            <TabsTrigger value="saved" className="gap-2">
              <Bookmark className="h-4 w-4" />
              Saved ({savedJobs.length})
            </TabsTrigger>
          </TabsList>

          {/* Applications Tab */}
          <TabsContent value="applications" className="space-y-4">
            {loading ? (
              <Card className="animate-pulse">
                <CardContent className="py-12">
                  <div className="h-6 bg-gray-200 rounded w-3/4 mx-auto"></div>
                </CardContent>
              </Card>
            ) : applications.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <Send className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No applications yet</h3>
                  <p className="text-gray-600 mb-4">
                    Start applying to jobs that match your skills
                  </p>
                  <Button asChild>
                    <Link href="/jobs">Browse Jobs</Link>
                  </Button>
                </CardContent>
              </Card>
            ) : (
              applications.map((application) => (
                <Card key={application.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="pt-6">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1">
                        <Link href={`/jobs/${application.jobs.id}`}>
                          <h3 className="font-semibold text-lg hover:text-primary mb-1">
                            {application.jobs.title}
                          </h3>
                        </Link>
                        <p className="text-gray-700 mb-2">{application.jobs.company_name}</p>
                        <div className="flex items-center gap-3 text-sm text-gray-600">
                          {application.jobs.location && (
                            <div className="flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              <span>{application.jobs.location}</span>
                            </div>
                          )}
                          {application.jobs.employment_type && (
                            <Badge variant="outline" className="text-xs">
                              {application.jobs.employment_type}
                            </Badge>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {getStatusIcon(application.status)}
                        <Badge className={getStatusColor(application.status)}>
                          {application.status}
                        </Badge>
                      </div>
                    </div>
                    <div className="flex items-center justify-between pt-4 border-t">
                      <div className="text-sm text-gray-500">
                        Applied {formatDistanceToNow(new Date(application.applied_at), { addSuffix: true })}
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={async () => {
                          if (confirm("Are you sure you want to withdraw this application?")) {
                            const { error } = await supabase
                              .from("job_applications")
                              .delete()
                              .eq("id", application.id);

                            if (!error) {
                              fetchApplications();
                            }
                          }
                        }}
                      >
                        Withdraw
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>

          {/* Posted Jobs Tab */}
          <TabsContent value="posted" className="space-y-4">
            {loading ? (
              <Card className="animate-pulse">
                <CardContent className="py-12">
                  <div className="h-6 bg-gray-200 rounded w-3/4 mx-auto"></div>
                </CardContent>
              </Card>
            ) : postedJobs.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <FileText className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No jobs posted yet</h3>
                  <p className="text-gray-600 mb-4">
                    Post a job to find qualified candidates
                  </p>
                  <Button asChild>
                    <Link href="/jobs/post">Post a Job</Link>
                  </Button>
                </CardContent>
              </Card>
            ) : (
              postedJobs.map((job) => (
                <Card key={job.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="pt-6">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Link href={`/jobs/${job.id}`}>
                            <h3 className="font-semibold text-lg hover:text-primary">
                              {job.title}
                            </h3>
                          </Link>
                          {job.is_active ? (
                            <Badge className="bg-green-100 text-green-800">Active</Badge>
                          ) : (
                            <Badge variant="secondary">Inactive</Badge>
                          )}
                        </div>
                        <p className="text-gray-700 mb-2">{job.company_name}</p>
                        <div className="flex items-center gap-3 text-sm text-gray-600 mb-3">
                          {job.location && (
                            <div className="flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              <span>{job.location}</span>
                            </div>
                          )}
                          {job.employment_type && (
                            <Badge variant="outline" className="text-xs">
                              {job.employment_type}
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-6 text-sm text-gray-600">
                          <div className="flex items-center gap-1">
                            <Users className="h-4 w-4" />
                            <span>{job.applications_count} applicants</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Eye className="h-4 w-4" />
                            <span>{job.views_count} views</span>
                          </div>
                          <span>
                            Posted {formatDistanceToNow(new Date(job.created_at), { addSuffix: true })}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2 pt-4 border-t">
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/jobs/${job.id}`}>View Job</Link>
                      </Button>
                      <Button variant="default" size="sm" asChild>
                        <Link href={`/jobs/${job.id}/applications`}>
                          Applications ({job.applications_count})
                        </Link>
                      </Button>
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/jobs/${job.id}/analytics`}>Analytics</Link>
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleToggleJobStatus(job.id, job.is_active)}
                      >
                        {job.is_active ? "Deactivate" : "Activate"}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>

          {/* Saved Jobs Tab */}
          <TabsContent value="saved" className="space-y-4">
            {loading ? (
              <Card className="animate-pulse">
                <CardContent className="py-12">
                  <div className="h-6 bg-gray-200 rounded w-3/4 mx-auto"></div>
                </CardContent>
              </Card>
            ) : savedJobs.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <Bookmark className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No saved jobs yet</h3>
                  <p className="text-gray-600 mb-4">
                    Save jobs you're interested in to review later
                  </p>
                  <Button asChild>
                    <Link href="/jobs">Browse Jobs</Link>
                  </Button>
                </CardContent>
              </Card>
            ) : (
              savedJobs.map((saved) => (
                <Card key={saved.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="pt-6">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1">
                        <Link href={`/jobs/${saved.jobs.id}`}>
                          <h3 className="font-semibold text-lg hover:text-primary mb-1">
                            {saved.jobs.title}
                          </h3>
                        </Link>
                        <p className="text-gray-700 mb-2">{saved.jobs.company_name}</p>
                        <div className="flex items-center gap-3 text-sm text-gray-600">
                          {saved.jobs.location && (
                            <div className="flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              <span>{saved.jobs.location}</span>
                            </div>
                          )}
                          {saved.jobs.employment_type && (
                            <Badge variant="outline" className="text-xs">
                              {saved.jobs.employment_type}
                            </Badge>
                          )}
                          <span className="text-xs">
                            {saved.jobs.applications_count} applicants
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2 pt-4 border-t">
                      <Button asChild className="flex-1">
                        <Link href={`/jobs/${saved.jobs.id}`}>View Job</Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

