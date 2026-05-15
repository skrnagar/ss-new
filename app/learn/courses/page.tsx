"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let ignore = false;
    async function load() {
      setLoadError(null);
      const { data, error } = await supabase
        .from("lms_courses")
        .select("id, slug, title, description, duration_minutes")
        .eq("is_published", true)
        .order("title");
      if (ignore) return;
      if (error) {
        setCourses([]);
        setLoadError(error.message);
        return;
      }
      setCourses((data as Course[]) || []);
    }
    void load();
    return () => {
      ignore = true;
    };
  }, []);

  return (
    <div className="container max-w-3xl py-10 px-4">
      <p className="text-sm text-muted-foreground mb-2">
        <Link href="/learn" className="hover:text-primary">
          Training
        </Link>{" "}
        / Courses
      </p>
      <h1 className="text-2xl font-bold mb-6">Courses</h1>
      {loadError ? (
        <p className="text-sm text-destructive">
          Could not load courses: {loadError}. If the table is missing, run{" "}
          <code className="rounded bg-muted px-1 text-foreground">lib/phase5-dashboards.sql</code> in the
          Supabase SQL Editor.
        </p>
      ) : courses.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          No published courses yet. In the Supabase project for this app, open SQL Editor and run the full
          script{" "}
          <code className="rounded bg-muted px-1">lib/phase5-dashboards.sql</code> (creates LMS tables, RLS,
          and seeds <strong>EHS Induction (starter)</strong>). If you ran an older version of the script,
          run it again so catalog <code className="text-xs">SELECT</code> works for signed-out visitors,
          then refresh this page.
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
                    <div className="flex gap-2 mt-2">
                      {c.duration_minutes != null && (
                        <Badge variant="secondary" className="gap-1 font-normal">
                          <Clock className="h-3 w-3" />
                          ~{c.duration_minutes} min
                        </Badge>
                      )}
                    </div>
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
