"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/auth-context";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { CheckCircle2, Circle, PlayCircle, FileText, HelpCircle, Award } from "lucide-react";
import type { Json } from "@/types/supabase";

type Course = {
  id: string;
  slug: string;
  title: string;
  description: string | null;
};

type Module = {
  id: string;
  sort_order: number;
  title: string;
  module_type: string;
  video_url: string | null;
  content_md: string | null;
  quiz_json: Json | null;
};

type QuizQ = { prompt: string; choices: string[]; correctIndex: number };

export default function LearnCourseDetailPage() {
  const params = useParams();
  const slug = params.slug as string;
  const { session } = useAuth();
  const { toast } = useToast();
  const userId = session?.user?.id;

  const [course, setCourse] = useState<Course | null>(null);
  const [modules, setModules] = useState<Module[]>([]);
  const [progress, setProgress] = useState(0);
  const [completedAt, setCompletedAt] = useState<string | null>(null);
  const [certCode, setCertCode] = useState<string | null>(null);
  const [doneModules, setDoneModules] = useState<Set<string>>(() => new Set());
  const [quizAnswers, setQuizAnswers] = useState<Record<string, Record<number, string>>>({});

  const load = useCallback(async () => {
    const { data: c } = await supabase
      .from("lms_courses")
      .select("id, slug, title, description")
      .eq("slug", slug)
      .eq("is_published", true)
      .maybeSingle();
    if (!c) {
      setCourse(null);
      return;
    }
    setCourse(c as Course);
    const { data: mods } = await supabase
      .from("lms_modules")
      .select("*")
      .eq("course_id", (c as Course).id)
      .order("sort_order");
    setModules((mods as Module[]) || []);

    if (userId) {
      await supabase.from("lms_enrollments").upsert(
        {
          user_id: userId,
          course_id: (c as Course).id,
          progress_percent: 0,
        },
        { onConflict: "user_id,course_id" }
      );
      const { data: en } = await supabase
        .from("lms_enrollments")
        .select("progress_percent, completed_at")
        .eq("user_id", userId)
        .eq("course_id", (c as Course).id)
        .maybeSingle();
      if (en) {
        setProgress(en.progress_percent ?? 0);
        setCompletedAt(en.completed_at ?? null);
        if (en.progress_percent >= 100) {
          const allIds = (mods as Module[])?.map((m) => m.id) ?? [];
          setDoneModules(new Set(allIds));
        }
      }
      const { data: cert } = await supabase
        .from("lms_certificates")
        .select("credential_code")
        .eq("user_id", userId)
        .eq("course_id", (c as Course).id)
        .maybeSingle();
      setCertCode(cert?.credential_code ?? null);
    }
  }, [slug, userId]);

  useEffect(() => {
    void load();
  }, [load]);

  const moduleCount = modules.length || 1;
  const derivedProgress = Math.round((doneModules.size / moduleCount) * 100);

  async function syncProgress(nextDone: Set<string>) {
    if (!userId || !course) return;
    const pct = Math.round((nextDone.size / moduleCount) * 100);
    setProgress(pct);
    await supabase
      .from("lms_enrollments")
      .upsert(
        {
          user_id: userId,
          course_id: course.id,
          progress_percent: pct,
          completed_at: pct >= 100 ? new Date().toISOString() : null,
        },
        { onConflict: "user_id,course_id" }
      );
    if (pct >= 100) {
      await issueCertificate();
    }
  }

  function markModuleDone(id: string) {
    const next = new Set(doneModules);
    next.add(id);
    setDoneModules(next);
    void syncProgress(next);
  }

  function parseQuiz(mod: Module): QuizQ[] {
    const raw = mod.quiz_json as { questions?: QuizQ[] } | null;
    return raw?.questions ?? [];
  }

  function submitQuiz(mod: Module) {
    const qs = parseQuiz(mod);
    const answers = quizAnswers[mod.id] || {};
    let ok = true;
    qs.forEach((q, i) => {
      const sel = answers[i];
      if (sel == null || Number(sel) !== q.correctIndex) ok = false;
    });
    if (!ok) {
      toast({ title: "Not quite right", description: "Review the answers and try again.", variant: "destructive" });
      return;
    }
    toast({ title: "Quiz passed" });
    markModuleDone(mod.id);
  }

  async function issueCertificate() {
    if (!userId || !course) return;
    if (certCode) return;
    const code = `SS-${course.slug.replace(/[^a-z0-9]/gi, "").toUpperCase().slice(0, 6)}-${Date.now().toString(36).toUpperCase()}`;
    const { error } = await supabase.from("lms_certificates").insert({
      user_id: userId,
      course_id: course.id,
      credential_code: code,
    });
    if (error) {
      if (!error.message.includes("duplicate")) {
        toast({ title: "Certificate issue failed", description: error.message, variant: "destructive" });
      }
      return;
    }
    setCertCode(code);
    toast({ title: "Certificate issued", description: code });
  }

  if (!userId) {
    return (
      <div className="container py-16 text-center text-sm text-muted-foreground">
        <Link href="/auth/login" className="text-primary underline">
          Sign in
        </Link>{" "}
        to take courses.
      </div>
    );
  }

  if (!course) {
    return (
      <div className="container py-16 text-sm">
        Course not found. <Link href="/learn/courses">Back</Link>
      </div>
    );
  }

  const dispProgress = Math.max(progress, derivedProgress);

  return (
    <div className="container max-w-3xl py-8 px-4 space-y-6">
      <div>
        <p className="text-sm text-muted-foreground mb-1">
          <Link href="/learn/courses" className="hover:text-primary">
            Courses
          </Link>{" "}
          / {course.title}
        </p>
        <h1 className="text-2xl font-bold">{course.title}</h1>
        {course.description && <p className="text-muted-foreground mt-1">{course.description}</p>}
        <div className="mt-4 space-y-1">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Progress</span>
            <span>{dispProgress}%</span>
          </div>
          <Progress value={dispProgress} />
        </div>
        {completedAt && (
          <Badge variant="default" className="mt-2">
            Completed
          </Badge>
        )}
        {certCode && (
          <Card className="mt-4 border-amber-200 bg-amber-50/50 dark:bg-amber-950/20">
            <CardHeader className="py-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Award className="h-4 w-4 text-amber-600" />
                Certificate
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm font-mono pt-0">{certCode}</CardContent>
          </Card>
        )}
      </div>

      <ul className="space-y-6">
        {modules.map((mod) => {
          const done = doneModules.has(mod.id);
          return (
            <li key={mod.id}>
              <Card className={done ? "border-emerald-200" : ""}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0">
                  <CardTitle className="text-base flex items-center gap-2">
                    {mod.module_type === "video" && <PlayCircle className="h-4 w-4 text-primary" />}
                    {mod.module_type === "article" && <FileText className="h-4 w-4 text-primary" />}
                    {mod.module_type === "quiz" && <HelpCircle className="h-4 w-4 text-primary" />}
                    {mod.sort_order}. {mod.title}
                  </CardTitle>
                  {done ? (
                    <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                  ) : (
                    <Circle className="h-5 w-5 text-muted-foreground" />
                  )}
                </CardHeader>
                <CardContent className="space-y-3">
                  {mod.module_type === "video" && (
                    <div className="space-y-2">
                      {mod.video_url ? (
                        <p className="text-sm">
                          <a href={mod.video_url} className="text-primary underline" target="_blank" rel="noreferrer">
                            Open video
                          </a>
                        </p>
                      ) : (
                        <p className="text-sm text-muted-foreground">
                          Video URL placeholder — attach a file or streaming link in Supabase{" "}
                          <code className="text-xs">lms_modules.video_url</code>.
                        </p>
                      )}
                      {!done && (
                        <Button size="sm" onClick={() => markModuleDone(mod.id)}>
                          Mark as watched
                        </Button>
                      )}
                    </div>
                  )}
                  {mod.module_type === "article" && (
                    <div className="space-y-2">
                      <pre className="text-sm whitespace-pre-wrap bg-muted/50 rounded-md p-3 border">
                        {mod.content_md || "No content yet."}
                      </pre>
                      {!done && (
                        <Button size="sm" onClick={() => markModuleDone(mod.id)}>
                          Mark as read
                        </Button>
                      )}
                    </div>
                  )}
                  {mod.module_type === "quiz" && (
                    <div className="space-y-4">
                      {parseQuiz(mod).map((q, qi) => (
                        <div key={qi} className="space-y-2">
                          <p className="text-sm font-medium">{q.prompt}</p>
                          <RadioGroup
                            value={quizAnswers[mod.id]?.[qi] ?? ""}
                            onValueChange={(v) =>
                              setQuizAnswers((prev) => ({
                                ...prev,
                                [mod.id]: { ...(prev[mod.id] || {}), [qi]: v },
                              }))
                            }
                          >
                            {q.choices.map((choice, ci) => (
                              <div key={ci} className="flex items-center gap-2">
                                <RadioGroupItem value={String(ci)} id={`${mod.id}-${qi}-${ci}`} />
                                <Label htmlFor={`${mod.id}-${qi}-${ci}`} className="font-normal text-sm">
                                  {choice}
                                </Label>
                              </div>
                            ))}
                          </RadioGroup>
                        </div>
                      ))}
                      {!done && (
                        <Button size="sm" onClick={() => submitQuiz(mod)}>
                          Submit quiz
                        </Button>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
