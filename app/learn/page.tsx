import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookOpen, Award, ListOrdered } from "lucide-react";

export default function LearnHubPage() {
  return (
    <div className="container max-w-3xl py-10 px-4">
      <h1 className="text-3xl font-bold tracking-tight mb-2">Training</h1>
      <p className="text-muted-foreground mb-8">
        LMS skeleton: courses with video, reading, and quiz modules plus certificates on completion.
      </p>
      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <ListOrdered className="h-5 w-5 text-primary" />
              Course catalog
            </CardTitle>
            <CardDescription>Browse published courses and enroll automatically on open.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild>
              <Link href="/learn/courses">View courses</Link>
            </Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Award className="h-5 w-5 text-amber-600" />
              Certificates
            </CardTitle>
            <CardDescription>Issued to your profile after a course is marked complete.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild variant="secondary">
              <Link href="/learn/courses">Complete a course to earn one</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
      <p className="text-xs text-muted-foreground mt-10 flex items-center gap-2">
        <BookOpen className="h-4 w-4" />
        Admin-authored content can be added directly in Supabase or via future CMS APIs.
      </p>
    </div>
  );
}
