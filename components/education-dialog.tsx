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

interface Education {
  id: string;
  school: string;
  degree?: string;
  field_of_study?: string;
  start_date?: string;
  end_date?: string;
  is_current: boolean;
  grade?: string;
  activities?: string;
  description?: string;
}

interface EducationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  education: Education | null;
  userId: string;
}

export function EducationDialog({ isOpen, onClose, education, userId }: EducationDialogProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    school: "",
    degree: "",
    field_of_study: "",
    start_date: "",
    end_date: "",
    is_current: false,
    grade: "",
    activities: "",
    description: "",
  });

  useEffect(() => {
    if (education) {
      setFormData({
        school: education.school || "",
        degree: education.degree || "",
        field_of_study: education.field_of_study || "",
        start_date: education.start_date ? education.start_date.substring(0, 7) : "",
        end_date: education.end_date ? education.end_date.substring(0, 7) : "",
        is_current: education.is_current || false,
        grade: education.grade || "",
        activities: education.activities || "",
        description: education.description || "",
      });
    } else {
      setFormData({
        school: "",
        degree: "",
        field_of_study: "",
        start_date: "",
        end_date: "",
        is_current: false,
        grade: "",
        activities: "",
        description: "",
      });
    }
  }, [education, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const educationData = {
      user_id: userId,
      school: formData.school,
      degree: formData.degree || null,
      field_of_study: formData.field_of_study || null,
      start_date: formData.start_date ? `${formData.start_date}-01` : null,
      end_date: formData.is_current ? null : (formData.end_date ? `${formData.end_date}-01` : null),
      is_current: formData.is_current,
      grade: formData.grade || null,
      activities: formData.activities || null,
      description: formData.description || null,
    };

    let error;
    if (education) {
      // Update
      const result = await supabase
        .from("education")
        .update(educationData)
        .eq("id", education.id);
      error = result.error;
    } else {
      // Insert
      const result = await supabase.from("education").insert([educationData]);
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
        description: education ? "Education updated successfully" : "Education added successfully",
      });
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{education ? "Edit Education" : "Add Education"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="school">School *</Label>
            <Input
              id="school"
              value={formData.school}
              onChange={(e) => setFormData({ ...formData, school: e.target.value })}
              placeholder="e.g. Harvard University"
              required
            />
          </div>

          <div>
            <Label htmlFor="degree">Degree</Label>
            <select
              id="degree"
              value={formData.degree}
              onChange={(e) => setFormData({ ...formData, degree: e.target.value })}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              <option value="">Select degree</option>
              <option value="High School">High School</option>
              <option value="Associate's">Associate's</option>
              <option value="Bachelor's">Bachelor's</option>
              <option value="Master's">Master's</option>
              <option value="MBA">MBA</option>
              <option value="PhD">PhD</option>
              <option value="Certificate">Certificate</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div>
            <Label htmlFor="field_of_study">Field of Study</Label>
            <Input
              id="field_of_study"
              value={formData.field_of_study}
              onChange={(e) => setFormData({ ...formData, field_of_study: e.target.value })}
              placeholder="e.g. Environmental Health and Safety"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="start_date">Start Date</Label>
              <Input
                id="start_date"
                type="month"
                value={formData.start_date}
                onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
              />
            </div>

            <div>
              <Label htmlFor="end_date">End Date (or expected)</Label>
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
              I currently study here
            </Label>
          </div>

          <div>
            <Label htmlFor="grade">Grade / GPA</Label>
            <Input
              id="grade"
              value={formData.grade}
              onChange={(e) => setFormData({ ...formData, grade: e.target.value })}
              placeholder="e.g. 3.8 GPA or First Class"
            />
          </div>

          <div>
            <Label htmlFor="activities">Activities and Societies</Label>
            <Input
              id="activities"
              value={formData.activities}
              onChange={(e) => setFormData({ ...formData, activities: e.target.value })}
              placeholder="e.g. Safety Club, Student Council"
            />
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Describe your studies, achievements, etc..."
              rows={3}
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Saving..." : education ? "Update" : "Add"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

