"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { CompanySelector } from "@/components/company-selector";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/auth-context";
import { Briefcase, ArrowLeft, DollarSign, MapPin } from "lucide-react";
import Link from "next/link";

export default function PostJobPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { session } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    company_name: "",
    company_id: null as string | null,
    description: "",
    employment_type: "",
    workplace_type: "",
    location: "",
    salary_min: "",
    salary_max: "",
    salary_currency: "USD",
    experience_level: "",
    skills_required: "",
    benefits: "",
    application_deadline: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!session?.user?.id) {
      toast({
        title: "Authentication required",
        description: "Please sign in to post jobs",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const skillsArray = formData.skills_required
        ? formData.skills_required.split(",").map((s) => s.trim()).filter(Boolean)
        : [];

      const benefitsArray = formData.benefits
        ? formData.benefits.split(",").map((s) => s.trim()).filter(Boolean)
        : [];

      const jobData = {
        title: formData.title,
        company_name: formData.company_name,
        company_id: formData.company_id,
        posted_by: session.user.id,
        description: formData.description,
        employment_type: formData.employment_type || null,
        workplace_type: formData.workplace_type || null,
        location: formData.location || null,
        salary_min: formData.salary_min ? parseInt(formData.salary_min) : null,
        salary_max: formData.salary_max ? parseInt(formData.salary_max) : null,
        salary_currency: formData.salary_currency,
        experience_level: formData.experience_level || null,
        skills_required: skillsArray.length > 0 ? skillsArray : null,
        benefits: benefitsArray.length > 0 ? benefitsArray : null,
        application_deadline: formData.application_deadline || null,
        is_active: true,
      };

      const { data, error } = await supabase
        .from("jobs")
        .insert([jobData])
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Success!",
        description: "Job posted successfully",
      });

      router.push(`/jobs/${data.id}`);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to post job",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="mb-6">
          <Link href="/jobs" className="inline-flex items-center text-sm text-muted-foreground hover:text-primary">
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to Jobs
          </Link>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-2xl flex items-center gap-2">
              <Briefcase className="h-6 w-6 text-primary" />
              Post a Job
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Job Details */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Job Details</h3>

                <div>
                  <Label htmlFor="title">Job Title *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="e.g. Safety Manager"
                    required
                  />
                </div>

                <CompanySelector
                  value={formData.company_name}
                  companyId={formData.company_id}
                  onChange={(name, companyId) =>
                    setFormData({ ...formData, company_name: name, company_id: companyId ?? null })
                  }
                  label="Company"
                  placeholder="Your company name"
                  required
                />

                <div>
                  <Label htmlFor="description">Job Description *</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Describe the role, responsibilities, and requirements..."
                    rows={8}
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="employment_type">Employment Type</Label>
                    <select
                      id="employment_type"
                      value={formData.employment_type}
                      onChange={(e) => setFormData({ ...formData, employment_type: e.target.value })}
                      className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    >
                      <option value="">Select type</option>
                      <option value="Full-time">Full-time</option>
                      <option value="Part-time">Part-time</option>
                      <option value="Contract">Contract</option>
                      <option value="Internship">Internship</option>
                      <option value="Freelance">Freelance</option>
                    </select>
                  </div>

                  <div>
                    <Label htmlFor="workplace_type">Workplace Type</Label>
                    <select
                      id="workplace_type"
                      value={formData.workplace_type}
                      onChange={(e) => setFormData({ ...formData, workplace_type: e.target.value })}
                      className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    >
                      <option value="">Select type</option>
                      <option value="On-site">On-site</option>
                      <option value="Remote">Remote</option>
                      <option value="Hybrid">Hybrid</option>
                    </select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="location">Location</Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="location"
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      placeholder="e.g. New York, NY or Remote"
                      className="pl-10"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="experience_level">Experience Level</Label>
                  <select
                    id="experience_level"
                    value={formData.experience_level}
                    onChange={(e) => setFormData({ ...formData, experience_level: e.target.value })}
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  >
                    <option value="">Select level</option>
                    <option value="Entry Level">Entry Level</option>
                    <option value="Mid Level">Mid Level</option>
                    <option value="Senior Level">Senior Level</option>
                    <option value="Executive">Executive</option>
                    <option value="Internship">Internship</option>
                  </select>
                </div>

                {/* Salary Range */}
                <div>
                  <Label>Salary Range (Optional)</Label>
                  <div className="grid grid-cols-3 gap-2">
                    <Input
                      type="number"
                      value={formData.salary_min}
                      onChange={(e) => setFormData({ ...formData, salary_min: e.target.value })}
                      placeholder="Min"
                    />
                    <Input
                      type="number"
                      value={formData.salary_max}
                      onChange={(e) => setFormData({ ...formData, salary_max: e.target.value })}
                      placeholder="Max"
                    />
                    <select
                      value={formData.salary_currency}
                      onChange={(e) => setFormData({ ...formData, salary_currency: e.target.value })}
                      className="rounded-md border border-input bg-background px-3 py-2 text-sm"
                    >
                      <option value="USD">USD</option>
                      <option value="EUR">EUR</option>
                      <option value="GBP">GBP</option>
                      <option value="INR">INR</option>
                    </select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="skills_required">Required Skills (comma separated)</Label>
                  <Input
                    id="skills_required"
                    value={formData.skills_required}
                    onChange={(e) => setFormData({ ...formData, skills_required: e.target.value })}
                    placeholder="e.g. OSHA, Risk Assessment, Safety Audits"
                  />
                </div>

                <div>
                  <Label htmlFor="benefits">Benefits (comma separated)</Label>
                  <Input
                    id="benefits"
                    value={formData.benefits}
                    onChange={(e) => setFormData({ ...formData, benefits: e.target.value })}
                    placeholder="e.g. Health Insurance, 401k, Remote Work"
                  />
                </div>

                <div>
                  <Label htmlFor="application_deadline">Application Deadline (Optional)</Label>
                  <Input
                    id="application_deadline"
                    type="date"
                    value={formData.application_deadline}
                    onChange={(e) => setFormData({ ...formData, application_deadline: e.target.value })}
                  />
                </div>
              </div>

              {/* Submit */}
              <div className="flex justify-end gap-3 pt-6 border-t">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.back()}
                  disabled={loading}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={loading || !formData.title || !formData.company_name}>
                  {loading ? "Posting..." : "Post Job"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

