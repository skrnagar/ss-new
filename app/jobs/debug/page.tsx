"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/auth-context";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function DebugJobsPage() {
  const { session } = useAuth();
  const [jobsData, setJobsData] = useState<any>(null);
  const [applicationsData, setApplicationsData] = useState<any>(null);
  const [profilesData, setProfilesData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!session?.user?.id) return;

    async function debugData() {
      setLoading(true);

      if (!session?.user?.id) return;

      // Check jobs posted by user
      const { data: jobs, error: jobsError } = await supabase
        .from("jobs")
        .select("*")
        .eq("posted_by", session.user.id);

      setJobsData({ data: jobs, error: jobsError });

      if (jobs && jobs.length > 0) {
        // Check applications for first job
        const { data: apps, error: appsError } = await supabase
          .from("job_applications")
          .select(`
            *,
            profiles!job_applications_user_id_fkey(*)
          `)
          .eq("job_id", jobs[0].id);

        setApplicationsData({ data: apps, error: appsError });
      }

      // Check if profiles have email
      const { data: profiles, error: profilesError } = await supabase
        .from("profiles")
        .select("id, username, full_name, email")
        .limit(5);

      setProfilesData({ data: profiles, error: profilesError });

      setLoading(false);
    }

    debugData();
  }, [session]);

  if (!session) {
    return (
      <div className="container mx-auto p-8">
        <p>Please log in to view debug info</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="container mx-auto p-8">
        <p>Loading debug info...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-8 space-y-6">
      <h1 className="text-3xl font-bold mb-6">Jobs Debug Information</h1>

      <Card>
        <CardHeader>
          <CardTitle>Your Jobs</CardTitle>
        </CardHeader>
        <CardContent>
          <pre className="bg-gray-100 p-4 rounded overflow-auto text-xs">
            {JSON.stringify(jobsData, null, 2)}
          </pre>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Applications (First Job)</CardTitle>
        </CardHeader>
        <CardContent>
          <pre className="bg-gray-100 p-4 rounded overflow-auto text-xs">
            {JSON.stringify(applicationsData, null, 2)}
          </pre>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Sample Profiles (Check Email Field)</CardTitle>
        </CardHeader>
        <CardContent>
          <pre className="bg-gray-100 p-4 rounded overflow-auto text-xs">
            {JSON.stringify(profilesData, null, 2)}
          </pre>
        </CardContent>
      </Card>

      <div className="flex gap-4">
        <Button asChild>
          <Link href="/jobs">Back to Jobs</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/jobs/my-jobs">My Jobs Dashboard</Link>
        </Button>
      </div>
    </div>
  );
}

