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

  useEffect(() => {
    let ignore = false;
    async function load() {
      const { data } = await supabase
        .from("lms_courses")
        .select("id, slug, title, description, duration_minutes")
        .eq("is_published", true)
        .order("title");
      if (!ignore) setCourses((data as Course[]) || []);
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
      {courses.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          No published courses. Run <code className="rounded bg-muted px-1">lib/phase5-dashboards.sql</code>.
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
