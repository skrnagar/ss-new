"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { SchemaSetupCard } from "@/components/schema-setup-card";
import { supabase } from "@/lib/supabase";
import { isRelationMissing } from "@/lib/schema-utils";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, ArrowRight } from "lucide-react";

type Course = {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  duration_minutes: number | null;
};

export default function LearnCoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [schemaSetupNeeded, setSchemaSetupNeeded] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoadError(null);
    setSchemaSetupNeeded(false);
    const { data, error } = await supabase
      .from("lms_courses")
      .select("id, slug, title, description, duration_minutes")
      .eq("is_published", true)
      .order("title");
    if (error) {
      setCourses([]);
      if (isRelationMissing(error, "lms_courses")) {
        setSchemaSetupNeeded(true);
        return;
      }
      setLoadError(error.message);
      return;
    }
    setCourses((data as Course[]) || []);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <div className="container max-w-3xl py-10 px-4">
      <p className="text-sm text-muted-foreground mb-2">
        <Link href="/learn" className="hover:text-primary">
          Training
        </Link>{" "}
        / Courses
      </p>
      <h1 className="text-2xl font-bold mb-6">Courses</h1>
      {schemaSetupNeeded ? (
        <SchemaSetupCard
          title="Training courses need a one-time database setup"
          description="The lms_courses table is not in your Supabase project yet."
          scriptHint="lib/production/02-phase5-dashboards.sql"
          onRefresh={load}
        />
      ) : loadError ? (
        <p className="text-sm text-destructive">Could not load courses: {loadError}</p>
      ) : courses.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          No published courses yet. Run <code className="rounded bg-muted px-1">npm run db:bootstrap</code>{" "}
          to seed demo courses, then refresh.
        </p>
      ) : (
        <ul className="space-y-4">
          {courses.map((c) => (
            <li key={c.id}>
              <Card>
                <CardHeader className="flex flex-row items-start justify-between gap-2">
                  <div>
                    <CardTitle className="text-lg">{c.title}</CardTitle>
                    <CardDescription className="mt-1">{c.description}</CardDescription>
                    {c.duration_minutes != null && (
                      <Badge variant="secondary" className="gap-1 font-normal mt-2">
                        <Clock className="h-3 w-3" />
                        ~{c.duration_minutes} min
                      </Badge>
                    )}
                  </div>
                  <Button asChild size="sm">
                    <Link href={`/learn/courses/${c.slug}`}>
                      Start <ArrowRight className="h-4 w-4 ml-1" />
                    </Link>
                  </Button>
                </CardHeader>
              </Card>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
