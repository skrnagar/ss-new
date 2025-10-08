"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/auth-context";
import { Building, ArrowLeft, Upload, Globe, Linkedin, Twitter, Users, MapPin, Calendar, Briefcase } from "lucide-react";
import Link from "next/link";

export default function CreateCompanyPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { session } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    tagline: "",
    description: "",
    industry: "",
    company_size: "",
    company_type: "",
    founded_year: "",
    website_url: "",
    linkedin_url: "",
    twitter_url: "",
    headquarters_location: "",
    specialties: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!session?.user?.id) {
      toast({
        title: "Authentication required",
        description: "Please sign in to create a company page",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      // Create slug from company name
      const slug = formData.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "");

      // Parse specialties
      const specialtiesArray = formData.specialties
        ? formData.specialties.split(",").map((s) => s.trim()).filter(Boolean)
        : [];

      const companyData = {
        name: formData.name,
        slug,
        tagline: formData.tagline || null,
        description: formData.description || null,
        industry: formData.industry || null,
        company_size: formData.company_size || null,
        company_type: formData.company_type || null,
        founded_year: formData.founded_year ? parseInt(formData.founded_year) : null,
        website_url: formData.website_url || null,
        linkedin_url: formData.linkedin_url || null,
        twitter_url: formData.twitter_url || null,
        headquarters_location: formData.headquarters_location || null,
        specialties: specialtiesArray.length > 0 ? specialtiesArray : null,
        created_by: session.user.id,
      };

      const { data, error } = await supabase
        .from("companies")
        .insert([companyData])
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Success!",
        description: "Company page created successfully",
      });

      router.push(`/companies/${data.slug}`);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to create company page",
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
          <Link href="/feed" className="inline-flex items-center text-sm text-muted-foreground hover:text-primary">
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to Feed
          </Link>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-2xl flex items-center gap-2">
              <Building className="h-6 w-6 text-primary" />
              Create Company Page
            </CardTitle>
            <CardDescription>
              Create a professional page for your company to showcase your brand, connect with professionals, and share updates.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Basic Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Building className="h-5 w-5" />
                  Basic Information
                </h3>

                <div>
                  <Label htmlFor="name">Company Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. ABC Safety Corporation"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="tagline">Tagline</Label>
                  <Input
                    id="tagline"
                    value={formData.tagline}
                    onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
                    placeholder="e.g. Building a safer world"
                    maxLength={255}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    A short, catchy description of your company
                  </p>
                </div>

                <div>
                  <Label htmlFor="description">About the Company</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Describe your company, mission, and what you do..."
                    rows={5}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="industry">Industry</Label>
                    <select
                      id="industry"
                      value={formData.industry}
                      onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                      className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    >
                      <option value="">Select industry</option>
                      <option value="Environmental Health & Safety">Environmental Health & Safety</option>
                      <option value="Manufacturing">Manufacturing</option>
                      <option value="Construction">Construction</option>
                      <option value="Energy & Utilities">Energy & Utilities</option>
                      <option value="Healthcare">Healthcare</option>
                      <option value="Technology">Technology</option>
                      <option value="Consulting">Consulting</option>
                      <option value="Education">Education</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  <div>
                    <Label htmlFor="company_size">Company Size</Label>
                    <select
                      id="company_size"
                      value={formData.company_size}
                      onChange={(e) => setFormData({ ...formData, company_size: e.target.value })}
                      className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    >
                      <option value="">Select size</option>
                      <option value="1-10">1-10 employees</option>
                      <option value="11-50">11-50 employees</option>
                      <option value="51-200">51-200 employees</option>
                      <option value="201-500">201-500 employees</option>
                      <option value="501-1000">501-1000 employees</option>
                      <option value="1001-5000">1001-5000 employees</option>
                      <option value="5001+">5001+ employees</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="company_type">Company Type</Label>
                    <select
                      id="company_type"
                      value={formData.company_type}
                      onChange={(e) => setFormData({ ...formData, company_type: e.target.value })}
                      className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    >
                      <option value="">Select type</option>
                      <option value="Public Company">Public Company</option>
                      <option value="Private Company">Private Company</option>
                      <option value="Partnership">Partnership</option>
                      <option value="Non-profit">Non-profit</option>
                      <option value="Government Agency">Government Agency</option>
                      <option value="Educational">Educational</option>
                      <option value="Self-Employed">Self-Employed</option>
                    </select>
                  </div>

                  <div>
                    <Label htmlFor="founded_year">Founded Year</Label>
                    <Input
                      id="founded_year"
                      type="number"
                      value={formData.founded_year}
                      onChange={(e) => setFormData({ ...formData, founded_year: e.target.value })}
                      placeholder="e.g. 2010"
                      min="1800"
                      max={new Date().getFullYear()}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="headquarters_location">Headquarters Location</Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="headquarters_location"
                      value={formData.headquarters_location}
                      onChange={(e) => setFormData({ ...formData, headquarters_location: e.target.value })}
                      placeholder="e.g. New York, NY, USA"
                      className="pl-10"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="specialties">Specialties (comma separated)</Label>
                  <Input
                    id="specialties"
                    value={formData.specialties}
                    onChange={(e) => setFormData({ ...formData, specialties: e.target.value })}
                    placeholder="e.g. Safety Audits, Risk Assessment, OSHA Compliance"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Separate multiple specialties with commas
                  </p>
                </div>
              </div>

              {/* Online Presence */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Globe className="h-5 w-5" />
                  Online Presence
                </h3>

                <div>
                  <Label htmlFor="website_url">Website URL</Label>
                  <div className="relative">
                    <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="website_url"
                      type="url"
                      value={formData.website_url}
                      onChange={(e) => setFormData({ ...formData, website_url: e.target.value })}
                      placeholder="https://www.example.com"
                      className="pl-10"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="linkedin_url">LinkedIn Page URL</Label>
                  <div className="relative">
                    <Linkedin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="linkedin_url"
                      type="url"
                      value={formData.linkedin_url}
                      onChange={(e) => setFormData({ ...formData, linkedin_url: e.target.value })}
                      placeholder="https://www.linkedin.com/company/example"
                      className="pl-10"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="twitter_url">Twitter/X Profile URL</Label>
                  <div className="relative">
                    <Twitter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="twitter_url"
                      type="url"
                      value={formData.twitter_url}
                      onChange={(e) => setFormData({ ...formData, twitter_url: e.target.value })}
                      placeholder="https://twitter.com/example"
                      className="pl-10"
                    />
                  </div>
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex justify-end gap-3 pt-6 border-t">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.back()}
                  disabled={loading}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={loading || !formData.name}>
                  {loading ? "Creating..." : "Create Company Page"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

