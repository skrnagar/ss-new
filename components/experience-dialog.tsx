"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";

interface Experience {
  id: string;
  title: string;
  company: string;
  employment_type?: string;
  location?: string;
  start_date: string;
  end_date?: string;
  is_current: boolean;
  description?: string;
  skills?: string[];
}

interface ExperienceDialogProps {
  isOpen: boolean;
  onClose: () => void;
  experience: Experience | null;
  userId: string;
}

export function ExperienceDialog({ isOpen, onClose, experience, userId }: ExperienceDialogProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    company: "",
    employment_type: "",
    location: "",
    start_date: "",
    end_date: "",
    is_current: false,
    description: "",
    skills: "",
  });

  useEffect(() => {
    if (experience) {
      setFormData({
        title: experience.title || "",
        company: experience.company || "",
        employment_type: experience.employment_type || "",
        location: experience.location || "",
        start_date: experience.start_date ? experience.start_date.substring(0, 7) : "",
        end_date: experience.end_date ? experience.end_date.substring(0, 7) : "",
        is_current: experience.is_current || false,
        description: experience.description || "",
        skills: experience.skills?.join(", ") || "",
      });
    } else {
      setFormData({
        title: "",
        company: "",
        employment_type: "",
        location: "",
        start_date: "",
        end_date: "",
        is_current: false,
        description: "",
        skills: "",
      });
    }
  }, [experience, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const skillsArray = formData.skills
      ? formData.skills.split(",").map((s) => s.trim()).filter(Boolean)
      : [];

    const experienceData = {
      user_id: userId,
      title: formData.title,
      company: formData.company,
      employment_type: formData.employment_type || null,
      location: formData.location || null,
      start_date: formData.start_date ? `${formData.start_date}-01` : null,
      end_date: formData.is_current ? null : (formData.end_date ? `${formData.end_date}-01` : null),
      is_current: formData.is_current,
      description: formData.description || null,
      skills: skillsArray.length > 0 ? skillsArray : null,
    };

    let error;
    if (experience) {
      // Update
      const result = await supabase
        .from("experiences")
        .update(experienceData)
        .eq("id", experience.id);
      error = result.error;
    } else {
      // Insert
      const result = await supabase.from("experiences").insert([experienceData]);
      error = result.error;
    }

    setLoading(false);

    if (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: experience ? "Experience updated successfully" : "Experience added successfully",
      });
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{experience ? "Edit Experience" : "Add Experience"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g. Safety Manager"
              required
            />
          </div>

          <div>
            <Label htmlFor="company">Company *</Label>
            <Input
              id="company"
              value={formData.company}
              onChange={(e) => setFormData({ ...formData, company: e.target.value })}
              placeholder="e.g. ABC Corporation"
              required
            />
          </div>

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
              <option value="Freelance">Freelance</option>
              <option value="Internship">Internship</option>
            </select>
          </div>

          <div>
            <Label htmlFor="location">Location</Label>
            <Input
              id="location"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              placeholder="e.g. New York, NY"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="start_date">Start Date *</Label>
              <Input
                id="start_date"
                type="month"
                value={formData.start_date}
                onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                required
              />
            </div>

            <div>
              <Label htmlFor="end_date">End Date</Label>
              <Input
                id="end_date"
                type="month"
                value={formData.end_date}
                onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                disabled={formData.is_current}
              />
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="is_current"
              checked={formData.is_current}
              onCheckedChange={(checked) =>
                setFormData({ ...formData, is_current: checked as boolean, end_date: "" })
              }
            />
            <Label htmlFor="is_current" className="cursor-pointer">
              I currently work here
            </Label>
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Describe your role and responsibilities..."
              rows={4}
            />
          </div>

          <div>
            <Label htmlFor="skills">Skills (comma separated)</Label>
            <Input
              id="skills"
              value={formData.skills}
              onChange={(e) => setFormData({ ...formData, skills: e.target.value })}
              placeholder="e.g. Safety Management, Risk Assessment, OSHA"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Separate skills with commas
            </p>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Saving..." : experience ? "Update" : "Add"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

