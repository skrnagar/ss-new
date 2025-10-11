"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/auth-context";
import { 
  Briefcase, 
  Search, 
  MapPin, 
  DollarSign, 
  Clock, 
  Building, 
  Bookmark, 
  BookmarkCheck,
  Plus,
  Filter,
  TrendingUp
} from "lucide-react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";

interface Job {
  id: string;
  title: string;
  company_name: string;
  company_id?: string;
  location?: string;
  employment_type?: string;
  workplace_type?: string;
  salary_min?: number;
  salary_max?: number;
  salary_currency?: string;
  experience_level?: string;
  description: string;
  skills_required?: string[];
  applications_count: number;
  views_count: number;
  created_at: string;
  companies?: {
    slug: string;
    logo_url?: string;
  };
}

export default function JobsPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [savedJobIds, setSavedJobIds] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState("");
  const [locationFilter, setLocationFilter] = useState("");
  const [employmentTypeFilter, setEmploymentTypeFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const { session } = useAuth();

  useEffect(() => {
    fetchJobs();
    if (session?.user?.id) {
      fetchSavedJobs();
    }
  }, [employmentTypeFilter]);

  const fetchJobs = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from("jobs")
        .select(`
          *,
          companies(slug, logo_url)
        `)
        .eq("is_active", true)
        .order("created_at", { ascending: false });

      if (employmentTypeFilter) {
        query = query.eq("employment_type", employmentTypeFilter);
      }

      const { data, error } = await query;

      if (error) throw error;
      setJobs(data || []);
    } catch (error) {
      console.error("Error fetching jobs:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSavedJobs = async () => {
    if (!session?.user?.id) return;

    const { data } = await supabase
      .from("saved_jobs")
      .select("job_id")
      .eq("user_id", session.user.id);

    if (data) {
      setSavedJobIds(new Set(data.map((s) => s.job_id)));
    }
  };

  const handleSaveJob = async (jobId: string) => {
    if (!session?.user?.id) return;

    const isSaved = savedJobIds.has(jobId);

    try {
      if (isSaved) {
        await supabase
          .from("saved_jobs")
          .delete()
          .eq("job_id", jobId)
          .eq("user_id", session.user.id);

        setSavedJobIds((prev) => {
          const next = new Set(prev);
          next.delete(jobId);
          return next;
        });
      } else {
        await supabase
          .from("saved_jobs")
          .insert({ job_id: jobId, user_id: session.user.id });

        setSavedJobIds((prev) => new Set(prev).add(jobId));
      }
    } catch (error) {
      console.error("Error saving job:", error);
    }
  };

  const filteredJobs = jobs.filter((job) => {
    const matchesSearch =
      !searchQuery ||
      job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.company_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.description.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesLocation =
      !locationFilter ||
      job.location?.toLowerCase().includes(locationFilter.toLowerCase());

    return matchesSearch && matchesLocation;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <Briefcase className="h-8 w-8 text-primary" />
                Jobs
              </h1>
              <p className="text-gray-600 mt-1">Find your next opportunity in ESG & EHS</p>
            </div>
            {session && (
              <Button asChild>
                <Link href="/jobs/post" className="gap-2">
                  <Plus className="h-4 w-4" />
                  Post a Job
                </Link>
              </Button>
            )}
          </div>

          {/* Search and Filters */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
            <div className="md:col-span-5 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search jobs by title, company, or keywords..."
                className="pl-10"
              />
            </div>
            <div className="md:col-span-3 relative">
              <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                value={locationFilter}
                onChange={(e) => setLocationFilter(e.target.value)}
                placeholder="Location"
                className="pl-10"
              />
            </div>
            <div className="md:col-span-3">
              <select
                value={employmentTypeFilter}
                onChange={(e) => setEmploymentTypeFilter(e.target.value)}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm h-10"
              >
                <option value="">All Employment Types</option>
                <option value="Full-time">Full-time</option>
                <option value="Part-time">Part-time</option>
                <option value="Contract">Contract</option>
                <option value="Internship">Internship</option>
                <option value="Freelance">Freelance</option>
              </select>
            </div>
            <div className="md:col-span-1">
              <Button variant="outline" className="w-full">
                <Filter className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Job Listings */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Job List */}
          <div className="lg:col-span-2 space-y-4">
            {loading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <Card key={i} className="animate-pulse">
                    <CardContent className="pt-6">
                      <div className="h-6 bg-gray-200 rounded mb-4 w-3/4"></div>
                      <div className="h-4 bg-gray-200 rounded mb-2 w-1/2"></div>
                      <div className="h-3 bg-gray-200 rounded w-full"></div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : filteredJobs.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <Briefcase className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No jobs found</h3>
                  <p className="text-gray-600 mb-4">
                    {searchQuery || locationFilter
                      ? "Try adjusting your search criteria"
                      : "Be the first to post a job"}
                  </p>
                  {session && (
                    <Button asChild>
                      <Link href="/jobs/post">Post a Job</Link>
                    </Button>
                  )}
                </CardContent>
              </Card>
            ) : (
              filteredJobs.map((job) => (
                <Card key={job.id} className="group hover:shadow-lg transition-all duration-200">
                  <CardContent className="pt-6">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex gap-4 flex-1">
                        {/* Company Logo */}
                        {job.companies?.logo_url || job.company_id ? (
                          <Link href={job.companies?.slug ? `/companies/${job.companies.slug}` : "#"}>
                            <Avatar className="h-12 w-12 rounded-lg flex-shrink-0">
                              <AvatarImage src={job.companies?.logo_url} alt={job.company_name} />
                              <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white rounded-lg">
                                {job.company_name.charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                          </Link>
                        ) : (
                          <Avatar className="h-12 w-12 rounded-lg flex-shrink-0">
                            <AvatarFallback className="bg-gray-100 text-gray-600 rounded-lg">
                              <Building className="h-6 w-6" />
                            </AvatarFallback>
                          </Avatar>
                        )}

                        <div className="flex-1 min-w-0">
                          <Link href={`/jobs/${job.id}`}>
                            <h3 className="font-semibold text-lg text-gray-900 group-hover:text-primary transition-colors mb-1">
                              {job.title}
                            </h3>
                          </Link>
                          <p className="text-gray-700 font-medium mb-2">{job.company_name}</p>

                          <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600 mb-3">
                            {job.location && (
                              <div className="flex items-center gap-1">
                                <MapPin className="h-4 w-4" />
                                <span>{job.location}</span>
                              </div>
                            )}
                            {job.workplace_type && (
                              <Badge variant="secondary" className="text-xs">
                                {job.workplace_type}
                              </Badge>
                            )}
                            {job.employment_type && (
                              <Badge variant="outline" className="text-xs">
                                {job.employment_type}
                              </Badge>
                            )}
                          </div>

                          <p className="text-sm text-gray-600 line-clamp-2 mb-3">
                            {job.description}
                          </p>

                          {job.skills_required && job.skills_required.length > 0 && (
                            <div className="flex flex-wrap gap-2 mb-3">
                              {job.skills_required.slice(0, 3).map((skill, idx) => (
                                <Badge key={idx} variant="secondary" className="text-xs">
                                  {skill}
                                </Badge>
                              ))}
                              {job.skills_required.length > 3 && (
                                <Badge variant="secondary" className="text-xs">
                                  +{job.skills_required.length - 3} more
                                </Badge>
                              )}
                            </div>
                          )}

                          <div className="flex items-center gap-4 text-xs text-gray-500">
                            <div className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              <span>{formatDistanceToNow(new Date(job.created_at), { addSuffix: true })}</span>
                            </div>
                            <span>•</span>
                            <span>{job.applications_count} applicants</span>
                          </div>
                        </div>
                      </div>

                      {/* Save Button */}
                      {session && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleSaveJob(job.id)}
                          className="flex-shrink-0"
                        >
                          {savedJobIds.has(job.id) ? (
                            <BookmarkCheck className="h-5 w-5 fill-primary text-primary" />
                          ) : (
                            <Bookmark className="h-5 w-5" />
                          )}
                        </Button>
                      )}
                    </div>

                    {/* Apply Button */}
                    <div className="flex gap-2 pt-4 border-t">
                      <Button asChild className="flex-1">
                        <Link href={`/jobs/${job.id}`}>View Details & Apply</Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Filters */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Quick Filters</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button
                  variant={employmentTypeFilter === "" ? "default" : "outline"}
                  onClick={() => setEmploymentTypeFilter("")}
                  className="w-full justify-start"
                  size="sm"
                >
                  All Jobs
                </Button>
                <Button
                  variant={employmentTypeFilter === "Full-time" ? "default" : "outline"}
                  onClick={() => setEmploymentTypeFilter("Full-time")}
                  className="w-full justify-start"
                  size="sm"
                >
                  Full-time
                </Button>
                <Button
                  variant={employmentTypeFilter === "Remote" ? "default" : "outline"}
                  onClick={() => setEmploymentTypeFilter("Remote")}
                  className="w-full justify-start"
                  size="sm"
                >
                  Remote
                </Button>
                <Button
                  variant={employmentTypeFilter === "Contract" ? "default" : "outline"}
                  onClick={() => setEmploymentTypeFilter("Contract")}
                  className="w-full justify-start"
                  size="sm"
                >
                  Contract
                </Button>
              </CardContent>
            </Card>

            {/* Saved Jobs */}
            {session && savedJobIds.size > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <BookmarkCheck className="h-5 w-5 text-primary" />
                    Saved Jobs
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 mb-2">
                    You have {savedJobIds.size} saved job{savedJobIds.size !== 1 ? "s" : ""}
                  </p>
                  <Button variant="outline" size="sm" className="w-full">
                    View Saved Jobs
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Job Posting Tips */}
            <Card className="bg-gradient-to-br from-blue-50 to-purple-50">
              <CardHeader>
                <CardTitle className="text-lg">Looking to Hire?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-700 mb-4">
                  Post jobs and find qualified ESG & EHS professionals
                </p>
                <Button asChild className="w-full">
                  <Link href="/jobs/post">
                    <Plus className="h-4 w-4 mr-2" />
                    Post a Job
                  </Link>
                </Button>
              </CardContent>
            </Card>

            {/* Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Job Market Insights</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Active Jobs</span>
                  <span className="font-semibold text-primary">{jobs.length}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Total Applications</span>
                  <span className="font-semibold">
                    {jobs.reduce((sum, job) => sum + job.applications_count, 0)}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
