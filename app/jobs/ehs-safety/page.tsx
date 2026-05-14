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
  Clock,
  Building,
  Bookmark,
  BookmarkCheck,
  Plus,
} from "lucide-react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { JobAlertsPanel } from "@/components/jobs/job-alerts-panel";

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
  job_category?: string | null;
  industry?: string | null;
  companies?: {
    slug: string;
    logo_url?: string;
  };
}

/** Title/description/category heuristics for roles without job_category set */
const EHS_KEYWORD_RE =
  /\b(ehs|eh&s|osha|hse|health\s*&\s*safety|occupational safety|incident investigation|near miss|permit to work|ptw|jha|jsa|job safety|iso\s*45001|iso\s*14001|behavioral safety|bbs|ergonomics|industrial hygiene|confined space|lockout|loto|tagout|process safety|psm|risk assessment|job hazard|environmental compliance|ems|tier ii|epcra|spill response|rod|remediation|compliance audit|lead auditor|ehs manager|safety manager|safety officer)\b/i;

function isEhsSafetyJob(job: Job): boolean {
  const cat = (job.job_category || "general").toLowerCase();
  if (cat === "ehs_safety" || cat === "environmental" || cat === "compliance") {
    return true;
  }
  const blob = `${job.title}\n${job.description}`;
  return EHS_KEYWORD_RE.test(blob);
}

export default function EhsSafetyJobsPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [savedJobIds, setSavedJobIds] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState("");
  const [locationFilter, setLocationFilter] = useState("");
  const [employmentTypeFilter, setEmploymentTypeFilter] = useState("");
  const [sectorFilter, setSectorFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
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

  const ehsJobs = jobs.filter(isEhsSafetyJob);

  const filteredJobs = ehsJobs.filter((job) => {
    const matchesSearch =
      !searchQuery ||
      job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.company_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.description.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesLocation =
      !locationFilter ||
      job.location?.toLowerCase().includes(locationFilter.toLowerCase());

    const matchesSector =
      !sectorFilter ||
      (job.industry?.toLowerCase().includes(sectorFilter.toLowerCase()) ?? false);

    const matchesCategory =
      !categoryFilter || (job.job_category || "").toLowerCase() === categoryFilter.toLowerCase();

    return matchesSearch && matchesLocation && matchesSector && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <div>
              <p className="text-sm text-muted-foreground mb-1">
                <Link href="/jobs" className="hover:text-primary">
                  All jobs
                </Link>
                <span className="mx-2">/</span>
                <span className="font-medium text-foreground">EHS &amp; Safety</span>
              </p>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <Briefcase className="h-8 w-8 text-primary" />
                EHS / Safety roles
              </h1>
              <p className="text-gray-600 mt-1">
                Environmental, health, safety, and compliance-focused openings
              </p>
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
            <div className="md:col-span-4 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search jobs by title, company, or keywords..."
                className="pl-10"
              />
            </div>
            <div className="md:col-span-2 relative">
              <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                value={locationFilter}
                onChange={(e) => setLocationFilter(e.target.value)}
                placeholder="Location"
                className="pl-10"
              />
            </div>
            <div className="md:col-span-2 relative">
              <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                value={sectorFilter}
                onChange={(e) => setSectorFilter(e.target.value)}
                placeholder="Sector / industry"
                className="pl-10"
              />
            </div>
            <div className="md:col-span-2">
              <select
                value={employmentTypeFilter}
                onChange={(e) => setEmploymentTypeFilter(e.target.value)}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm h-10"
              >
                <option value="">All employment types</option>
                <option value="Full-time">Full-time</option>
                <option value="Part-time">Part-time</option>
                <option value="Contract">Contract</option>
                <option value="Internship">Internship</option>
                <option value="Freelance">Freelance</option>
              </select>
            </div>
            <div className="md:col-span-2">
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm h-10"
              >
                <option value="">All EHS categories</option>
                <option value="ehs_safety">EHS / Safety (tagged)</option>
                <option value="environmental">Environmental (tagged)</option>
                <option value="compliance">Compliance (tagged)</option>
                <option value="general">General listing (keyword match)</option>
              </select>
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
                    {searchQuery || locationFilter || sectorFilter || categoryFilter
                      ? "Try adjusting your search criteria"
                      : "No EHS-relevant listings yet — post one and tag the category"}
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
                            {job.job_category && job.job_category !== "general" && (
                              <Badge variant="secondary" className="text-xs capitalize">
                                {job.job_category.replace(/_/g, " ")}
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
            <JobAlertsPanel />

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
                  <span className="text-sm text-gray-600">EHS-related jobs</span>
                  <span className="font-semibold text-primary">{ehsJobs.length}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Shown (filters)</span>
                  <span className="font-semibold text-primary">{filteredJobs.length}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Applications (EHS list)</span>
                  <span className="font-semibold">
                    {ehsJobs.reduce((sum, job) => sum + job.applications_count, 0)}
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
