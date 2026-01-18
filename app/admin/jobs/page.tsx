"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Search, Trash2, Edit, Briefcase, Eye, MapPin, DollarSign, Calendar, Building, Users, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";

interface Job {
  id: string;
  title: string;
  description: string;
  company_id: string;
  location: string;
  type: string;
  salary_range: string;
  created_at: string;
  company: {
    name: string;
    logo_url: string;
  };
}

interface JobDetails {
  job: Job & {
    applications?: Array<{
      id: string;
      user_id: string;
      status: string;
      applied_at: string;
      user: {
        id: string;
        full_name: string;
        username: string;
        avatar_url: string;
        email: string;
      };
    }>;
  };
}

export default function JobsManagementPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [filteredJobs, setFilteredJobs] = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [jobDetails, setJobDetails] = useState<JobDetails | null>(null);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchJobs();
  }, []);

  useEffect(() => {
    if (searchQuery) {
      const filtered = jobs.filter(
        (job) =>
          job.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          job.company?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          job.location?.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredJobs(filtered);
    } else {
      setFilteredJobs(jobs);
    }
  }, [searchQuery, jobs]);

  const fetchJobs = async () => {
    try {
      const response = await fetch("/api/admin/jobs");
      if (response.ok) {
        const data = await response.json();
        setJobs(data.jobs || []);
        setFilteredJobs(data.jobs || []);
      }
    } catch (error) {
      console.error("Error fetching jobs:", error);
      toast({
        title: "Error",
        description: "Failed to fetch jobs",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchJobDetails = async (jobId: string) => {
    setLoadingDetails(true);
    try {
      const response = await fetch(`/api/admin/jobs/${jobId}`);
      if (response.ok) {
        const data = await response.json();
        setJobDetails(data);
      } else {
        throw new Error("Failed to fetch job details");
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to fetch job details",
        variant: "destructive",
      });
    } finally {
      setLoadingDetails(false);
    }
  };

  const handleViewDetails = (job: Job) => {
    setSelectedJob(job);
    setIsDetailDialogOpen(true);
    fetchJobDetails(job.id);
  };

  const handleDelete = async () => {
    if (!selectedJob) return;

    try {
      const response = await fetch(`/api/admin/jobs/${selectedJob.id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: "Job deleted successfully",
        });
        fetchJobs();
        setIsDeleteDialogOpen(false);
        setSelectedJob(null);
      } else {
        throw new Error("Failed to delete job");
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete job",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center gap-2">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          <span className="text-muted-foreground">Loading jobs...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Jobs Management</h1>
          <p className="text-muted-foreground">Manage all job listings</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Jobs</CardTitle>
          <CardDescription>Search and manage job listings</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search jobs by title, company, or location..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Company</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Salary</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredJobs.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      No jobs found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredJobs.map((job) => (
                    <TableRow key={job.id}>
                      <TableCell>
                        <button
                          onClick={() => handleViewDetails(job)}
                          className="font-medium hover:text-primary hover:underline cursor-pointer text-left"
                        >
                          {job.title}
                        </button>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{job.company?.name || "N/A"}</Badge>
                      </TableCell>
                      <TableCell>{job.location || "N/A"}</TableCell>
                      <TableCell>
                        <Badge variant="secondary">{job.type || "N/A"}</Badge>
                      </TableCell>
                      <TableCell>{job.salary_range || "N/A"}</TableCell>
                      <TableCell>
                        {new Date(job.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => handleViewDetails(job)}
                            title="View job details"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" asChild>
                            <Link href={`/jobs/${job.id}/edit`}>
                              <Edit className="h-4 w-4" />
                            </Link>
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              setSelectedJob(job);
                              setIsDeleteDialogOpen(true);
                            }}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Job Details Dialog */}
      <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
        <DialogContent className="max-w-[95vw] sm:max-w-4xl max-h-[95vh] sm:max-h-[90vh] overflow-hidden flex flex-col p-0 gap-0">
          <DialogHeader className="px-6 pt-6 pb-4 border-b flex-shrink-0">
            <DialogTitle className="text-xl sm:text-2xl">Job Details</DialogTitle>
            <DialogDescription className="text-sm">
              Complete information about {selectedJob?.title}
            </DialogDescription>
          </DialogHeader>

          {loadingDetails ? (
            <div className="flex items-center justify-center h-64 flex-1">
              <div className="flex items-center gap-2">
                <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                <span className="text-muted-foreground">Loading job details...</span>
              </div>
            </div>
          ) : jobDetails?.job ? (
            <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-4 min-h-0">
              <div className="space-y-4 sm:space-y-6">
                {/* Job Header */}
                <Card className="border-2">
                  <CardHeader>
                    <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
                      <div className="flex items-start gap-4">
                        <div className="p-3 rounded-lg bg-primary/10">
                          <Briefcase className="h-8 w-8 text-primary" />
                        </div>
                        <div>
                          <h3 className="text-xl sm:text-2xl font-bold">{jobDetails.job.title}</h3>
                          <div className="flex items-center gap-2 mt-2">
                            <Building className="h-4 w-4 text-muted-foreground" />
                            <Badge variant="outline">{jobDetails.job.company?.name || "N/A"}</Badge>
                          </div>
                        </div>
                      </div>
                      <Button variant="outline" size="sm" asChild className="w-full sm:w-auto">
                        <Link href={`/jobs/${jobDetails.job.id}`} target="_blank">
                          View Job <Eye className="h-4 w-4 ml-2" />
                        </Link>
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
                      <div className="flex items-center gap-2 text-sm">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">Location:</span>
                        <span>{jobDetails.job.location || "N/A"}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Briefcase className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">Type:</span>
                        <Badge variant="secondary">{jobDetails.job.type || "N/A"}</Badge>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">Salary:</span>
                        <span>{jobDetails.job.salary_range || "N/A"}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">Posted:</span>
                        <span>{new Date(jobDetails.job.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                    {jobDetails.job.description && (
                      <div className="mt-4 pt-4 border-t">
                        <span className="text-sm font-medium">Description:</span>
                        <p className="text-sm text-muted-foreground mt-2 whitespace-pre-wrap">{jobDetails.job.description}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Applications */}
                <Card className="border-2">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Users className="h-5 w-5" />
                        <CardTitle className="text-lg">
                          Applications ({jobDetails.job.applications?.length || 0})
                        </CardTitle>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {jobDetails.job.applications && jobDetails.job.applications.length > 0 ? (
                      <div className="space-y-3">
                        {jobDetails.job.applications.map((app) => (
                          <div key={app.id} className="flex items-center justify-between p-3 rounded-lg border">
                            <div className="flex items-center gap-3">
                              <Avatar className="h-10 w-10">
                                <AvatarImage src={app.user?.avatar_url || ""} alt={app.user?.full_name || ""} />
                                <AvatarFallback>{app.user?.full_name?.[0] || "U"}</AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="text-sm font-medium">{app.user?.full_name || "Unknown"}</p>
                                <p className="text-xs text-muted-foreground">@{app.user?.username}</p>
                                <p className="text-xs text-muted-foreground">{app.user?.email}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-3">
                              <Badge 
                                variant={
                                  app.status === "accepted" ? "default" : 
                                  app.status === "rejected" ? "destructive" : 
                                  "outline"
                                }
                              >
                                {app.status}
                              </Badge>
                              <span className="text-xs text-muted-foreground">
                                {new Date(app.applied_at).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-muted-foreground">
                        <Users className="h-12 w-12 mx-auto mb-2 opacity-30" />
                        <p className="text-sm">No applications yet</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          ) : null}

          <DialogFooter className="px-6 py-4 border-t flex-shrink-0 flex-col sm:flex-row gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setIsDetailDialogOpen(false)} className="w-full sm:w-auto">
              Close
            </Button>
            <Button variant="destructive" onClick={() => {
              setIsDetailDialogOpen(false);
              setSelectedJob(jobDetails?.job || null);
              setIsDeleteDialogOpen(true);
            }} className="w-full sm:w-auto">
              <Trash2 className="h-4 w-4 mr-2" />
              Delete Job
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Job</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{selectedJob?.title}"? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

