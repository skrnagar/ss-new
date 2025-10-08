"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Briefcase, Calendar, MapPin, Plus, Edit, Trash2 } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { ExperienceDialog } from "./experience-dialog";
import { format } from "date-fns";

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

interface ExperienceSectionProps {
  userId: string;
  isOwnProfile: boolean;
}

export function ExperienceSection({ userId, isOwnProfile }: ExperienceSectionProps) {
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingExperience, setEditingExperience] = useState<Experience | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchExperiences();
  }, [userId]);

  const fetchExperiences = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("experiences")
      .select("*")
      .eq("user_id", userId)
      .order("start_date", { ascending: false });

    if (!error && data) {
      setExperiences(data);
    }
    setLoading(false);
  };

  const handleEdit = (experience: Experience) => {
    setEditingExperience(experience);
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this experience?")) return;

    const { error } = await supabase.from("experiences").delete().eq("id", id);

    if (!error) {
      fetchExperiences();
    }
  };

  const handleDialogClose = () => {
    setIsDialogOpen(false);
    setEditingExperience(null);
    fetchExperiences();
  };

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), "MMM yyyy");
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Briefcase className="h-5 w-5 text-primary" />
            Experience
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-500 text-center py-4">Loading...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Briefcase className="h-5 w-5 text-primary" />
            Experience
          </CardTitle>
          {isOwnProfile && (
            <Button
              onClick={() => setIsDialogOpen(true)}
              size="sm"
              variant="outline"
              className="gap-2"
            >
              <Plus className="h-4 w-4" />
              Add Experience
            </Button>
          )}
        </CardHeader>
        <CardContent>
          {experiences.length === 0 ? (
            <div className="text-center py-8">
              <Briefcase className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No experience added yet</p>
              {isOwnProfile && (
                <Button
                  onClick={() => setIsDialogOpen(true)}
                  variant="link"
                  className="mt-2"
                >
                  Add your first experience
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-6">
              {experiences.map((exp) => (
                <div key={exp.id} className="border-l-2 border-primary/30 pl-4 relative group">
                  {isOwnProfile && (
                    <div className="absolute -top-1 right-0 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                      <Button
                        onClick={() => handleEdit(exp)}
                        size="sm"
                        variant="ghost"
                        className="h-8 w-8 p-0"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        onClick={() => handleDelete(exp.id)}
                        size="sm"
                        variant="ghost"
                        className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                  
                  <h4 className="font-semibold text-gray-900">{exp.title}</h4>
                  <div className="flex items-center text-sm mb-1">
                    <Briefcase className="h-4 w-4 text-muted-foreground mr-2" />
                    <span className="text-gray-700">
                      {exp.company}
                      {exp.employment_type && ` • ${exp.employment_type}`}
                    </span>
                  </div>
                  
                  <div className="flex items-center text-sm text-muted-foreground mb-2">
                    <Calendar className="h-4 w-4 mr-2" />
                    <span>
                      {formatDate(exp.start_date)} -{" "}
                      {exp.is_current ? "Present" : exp.end_date ? formatDate(exp.end_date) : "Present"}
                    </span>
                  </div>
                  
                  {exp.location && (
                    <div className="flex items-center text-sm text-muted-foreground mb-2">
                      <MapPin className="h-4 w-4 mr-2" />
                      <span>{exp.location}</span>
                    </div>
                  )}
                  
                  {exp.description && (
                    <p className="text-sm text-gray-600 mb-3 whitespace-pre-line">
                      {exp.description}
                    </p>
                  )}
                  
                  {exp.skills && exp.skills.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {exp.skills.map((skill, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {isOwnProfile && (
        <ExperienceDialog
          isOpen={isDialogOpen}
          onClose={handleDialogClose}
          experience={editingExperience}
          userId={userId}
        />
      )}
    </>
  );
}

