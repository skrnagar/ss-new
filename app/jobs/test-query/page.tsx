"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/auth-context";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function TestQueryPage() {
  const { session } = useAuth();
  const [jobId, setJobId] = useState("");
  const [results, setResults] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const testQuery = async () => {
    if (!jobId || !session?.user?.id) return;

    setLoading(true);
    const testResults: any = {};

    try {
      // Test 1: Check if job exists and who posted it
      const { data: job, error: jobError } = await supabase
        .from("jobs")
        .select("id, title, posted_by, company_id")
        .eq("id", jobId)
        .single();

      testResults.job = { data: job, error: jobError?.message };
      testResults.isJobPoster = job?.posted_by === session.user.id;

      // Test 2: Check applications count
      const { count, error: countError } = await supabase
        .from("job_applications")
        .select("*", { count: "exact", head: true })
        .eq("job_id", jobId);

      testResults.applicationsCount = { count, error: countError?.message };

      // Test 3: Try to fetch applications
      const { data: apps, error: appsError } = await supabase
        .from("job_applications")
        .select("*")
        .eq("job_id", jobId);

      testResults.applications = { data: apps, error: appsError?.message };

      // Test 4: Try with profiles join
      const { data: appsWithProfiles, error: joinError } = await supabase
        .from("job_applications")
        .select(`
          *,
          profiles!job_applications_user_id_fkey(*)
        `)
        .eq("job_id", jobId);

      testResults.applicationsWithProfiles = { 
        data: appsWithProfiles, 
        error: joinError?.message 
      };

      // Test 5: Note about RLS policies
      testResults.note = "Check Supabase Dashboard → Database → Policies for job_applications table";

      // Test 6: Try direct count with service role (to see if data exists)
      testResults.currentUser = session.user.id;
      testResults.timestamp = new Date().toISOString();

    } catch (error: any) {
      testResults.error = error.message;
    }

    setResults(testResults);
    setLoading(false);
  };

  if (!session) {
    return (
      <div className="container mx-auto p-8">
        <Card>
          <CardContent className="pt-6">
            <p>Please log in to test queries</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-8 space-y-6">
      <h1 className="text-3xl font-bold mb-6">Job Applications RLS Test</h1>

      <Card>
        <CardHeader>
          <CardTitle>Test Query</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="jobId">Job ID (UUID)</Label>
            <Input
              id="jobId"
              value={jobId}
              onChange={(e) => setJobId(e.target.value)}
              placeholder="Enter job UUID"
              className="font-mono"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Get this from your job URL: /jobs/[job-id]
            </p>
          </div>

          <Button onClick={testQuery} disabled={loading || !jobId}>
            {loading ? "Testing..." : "Run Test"}
          </Button>
        </CardContent>
      </Card>

      {results && (
        <Card>
          <CardHeader>
            <CardTitle>Test Results</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">Current User ID:</h3>
                <code className="block bg-gray-100 p-2 rounded text-xs">{results.currentUser}</code>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Job Info:</h3>
                <pre className="bg-gray-100 p-4 rounded overflow-auto text-xs">
                  {JSON.stringify(results.job, null, 2)}
                </pre>
                <p className="mt-2">
                  <strong>Are you the job poster?</strong>{" "}
                  <span className={results.isJobPoster ? "text-green-600" : "text-red-600"}>
                    {results.isJobPoster ? "YES" : "NO"}
                  </span>
                </p>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Applications Count (HEAD request):</h3>
                <pre className="bg-gray-100 p-4 rounded overflow-auto text-xs">
                  {JSON.stringify(results.applicationsCount, null, 2)}
                </pre>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Applications (Simple SELECT):</h3>
                <pre className="bg-gray-100 p-4 rounded overflow-auto text-xs">
                  {JSON.stringify(results.applications, null, 2)}
                </pre>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Applications with Profiles (JOIN):</h3>
                <pre className="bg-gray-100 p-4 rounded overflow-auto text-xs">
                  {JSON.stringify(results.applicationsWithProfiles, null, 2)}
                </pre>
              </div>

              <div className="pt-4 border-t">
                <h3 className="font-semibold mb-2 text-lg">Diagnosis:</h3>
                <ul className="space-y-2 list-disc list-inside">
                  {results.job?.error && (
                    <li className="text-red-600">❌ Cannot fetch job: {results.job.error}</li>
                  )}
                  {!results.isJobPoster && (
                    <li className="text-orange-600">⚠️ You are not the job poster</li>
                  )}
                  {results.applicationsCount?.error && (
                    <li className="text-red-600">❌ Cannot count applications: {results.applicationsCount.error}</li>
                  )}
                  {results.applicationsCount?.count === 0 && (
                    <li className="text-blue-600">ℹ️ No applications exist for this job</li>
                  )}
                  {results.applicationsCount?.count > 0 && results.applications?.data?.length === 0 && (
                    <li className="text-red-600">
                      ❌ <strong>RLS POLICY ISSUE:</strong> {results.applicationsCount.count} applications exist but you cannot see them.
                      Run the fix-job-applications-rls.sql script!
                    </li>
                  )}
                  {results.applications?.data?.length > 0 && (
                    <li className="text-green-600">✅ Can fetch applications ({results.applications.data.length})</li>
                  )}
                  {results.applicationsWithProfiles?.error && (
                    <li className="text-red-600">❌ Cannot join profiles: {results.applicationsWithProfiles.error}</li>
                  )}
                  {results.applicationsWithProfiles?.data?.length > 0 && (
                    <li className="text-green-600">✅ Can fetch applications with profiles ({results.applicationsWithProfiles.data.length})</li>
                  )}
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="bg-blue-50">
        <CardHeader>
          <CardTitle>How to Fix RLS Issues</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p><strong>If you see "RLS POLICY ISSUE" above:</strong></p>
          <ol className="list-decimal list-inside space-y-2">
            <li>Open Supabase Dashboard → SQL Editor</li>
            <li>Copy contents of <code className="bg-white px-2 py-1 rounded">lib/fix-job-applications-rls.sql</code></li>
            <li>Paste and click Run</li>
            <li>Refresh this page and test again</li>
          </ol>
        </CardContent>
      </Card>
    </div>
  );
}

