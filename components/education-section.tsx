"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { GraduationCap, Calendar, Plus, Edit, Trash2 } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { EducationDialog } from "./education-dialog";
import { format } from "date-fns";

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

interface EducationSectionProps {
  userId: string;
  isOwnProfile: boolean;
}

export function EducationSection({ userId, isOwnProfile }: EducationSectionProps) {
  const [educations, setEducations] = useState<Education[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingEducation, setEditingEducation] = useState<Education | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEducation();
  }, [userId]);

  const fetchEducation = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("education")
      .select("*")
      .eq("user_id", userId)
      .order("start_date", { ascending: false });

    if (!error && data) {
      setEducations(data);
    }
    setLoading(false);
  };

  const handleEdit = (education: Education) => {
    setEditingEducation(education);
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this education?")) return;

    const { error } = await supabase.from("education").delete().eq("id", id);

    if (!error) {
      fetchEducation();
    }
  };

  const handleDialogClose = () => {
    setIsDialogOpen(false);
    setEditingEducation(null);
    fetchEducation();
  };

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), "yyyy");
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <GraduationCap className="h-5 w-5 text-primary" />
            Education
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
            <GraduationCap className="h-5 w-5 text-primary" />
            Education
          </CardTitle>
          {isOwnProfile && (
            <Button
              onClick={() => setIsDialogOpen(true)}
              size="sm"
              variant="outline"
              className="gap-2"
            >
              <Plus className="h-4 w-4" />
              Add Education
            </Button>
          )}
        </CardHeader>
        <CardContent>
          {educations.length === 0 ? (
            <div className="text-center py-8">
              <GraduationCap className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No education added yet</p>
              {isOwnProfile && (
                <Button
                  onClick={() => setIsDialogOpen(true)}
                  variant="link"
                  className="mt-2"
                >
                  Add your education
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-6">
              {educations.map((edu) => (
                <div key={edu.id} className="border-l-2 border-primary/30 pl-4 relative group">
                  {isOwnProfile && (
                    <div className="absolute -top-1 right-0 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                      <Button
                        onClick={() => handleEdit(edu)}
                        size="sm"
                        variant="ghost"
                        className="h-8 w-8 p-0"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        onClick={() => handleDelete(edu.id)}
                        size="sm"
                        variant="ghost"
                        className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                  
                  <h4 className="font-semibold text-gray-900">{edu.school}</h4>
                  
                  {(edu.degree || edu.field_of_study) && (
                    <p className="text-sm text-gray-700 mb-1">
                      {edu.degree}
                      {edu.degree && edu.field_of_study && ", "}
                      {edu.field_of_study}
                    </p>
                  )}
                  
                  {(edu.start_date || edu.end_date) && (
                    <div className="flex items-center text-sm text-muted-foreground mb-2">
                      <Calendar className="h-4 w-4 mr-2" />
                      <span>
                        {edu.start_date && formatDate(edu.start_date)} -{" "}
                        {edu.is_current ? "Present" : edu.end_date ? formatDate(edu.end_date) : "Present"}
                      </span>
                    </div>
                  )}
                  
                  {edu.grade && (
                    <p className="text-sm text-gray-600 mb-2">
                      <span className="font-medium">Grade:</span> {edu.grade}
                    </p>
                  )}
                  
                  {edu.activities && (
                    <p className="text-sm text-gray-600 mb-2">
                      <span className="font-medium">Activities:</span> {edu.activities}
                    </p>
                  )}
                  
                  {edu.description && (
                    <p className="text-sm text-gray-600 whitespace-pre-line">
                      {edu.description}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {isOwnProfile && (
        <EducationDialog
          isOpen={isDialogOpen}
          onClose={handleDialogClose}
          education={editingEducation}
          userId={userId}
        />
      )}
    </>
  );
}

