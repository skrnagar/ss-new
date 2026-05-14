"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { safeRedirectPath } from "@/lib/safe-redirect-path";
import { supabase } from "@/lib/supabase";
import { zodResolver } from "@hookform/resolvers/zod";
import { Linkedin, Lock, Mail } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import * as React from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";

const formSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address" }),
  password: z.string().min(8, { message: "Password must be at least 8 characters" }),
});

const registerSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters" }),
  email: z.string().email({ message: "Please enter a valid email address" }),
  password: z.string().min(8, { message: "Password must be at least 8 characters" }),
  professionalRole: z.enum(["job_seeker", "recruiter", "auditor"]),
});

export default function LoginPage() {
  return (
    <React.Suspense
      fallback={
        <div className="container flex min-h-[60vh] items-center justify-center py-12">
          <p className="text-sm text-muted-foreground">Loading sign-in…</p>
        </div>
      }
    >
      <LoginPageContent />
    </React.Suspense>
  );
}

function LoginPageContent() {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = React.useState(false);
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = React.useState(searchParams.get("tab") || "login");
  const [authStep, setAuthStep] = React.useState<"credentials" | "mfa">("credentials");
  const [mfaFactorId, setMfaFactorId] = React.useState<string | null>(null);
  const [mfaChallengeId, setMfaChallengeId] = React.useState<string | null>(null);
  const [otpCode, setOtpCode] = React.useState("");

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const registerForm = useForm<z.infer<typeof registerSchema>>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      professionalRole: "job_seeker" as "job_seeker" | "recruiter" | "auditor",
    },
  });

  async function finishLoginRedirect() {
    toast({
      title: "Login successful",
      description: "Welcome back!",
    });

    const requested = safeRedirectPath(searchParams.get("redirectUrl"));
    const {
      data: { user },
    } = await supabase.auth.getUser();

    let destination = "/feed";
    if (!user) {
      destination = "/feed";
    } else {
      const { data: profile } = await supabase
        .from("profiles")
        .select("username")
        .eq("id", user.id)
        .maybeSingle();

      if (!profile?.username) {
        destination = "/profile/setup";
      } else if (requested) {
        destination = requested;
      }
    }

    router.replace(destination);
    router.refresh();
  }

  async function afterPasswordSignIn(): Promise<"redirect" | "mfa" | "error"> {
    const { data: aalData, error: aalErr } =
      await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
    if (aalErr) {
      toast({
        title: "Could not verify session level",
        description: aalErr.message,
        variant: "destructive",
      });
      return "error";
    }

    const needsMfa = aalData?.nextLevel === "aal2" && aalData?.currentLevel !== "aal2";

    if (!needsMfa) {
      return "redirect";
    }

    const { data: factors, error: fErr } = await supabase.auth.mfa.listFactors();
    if (fErr || !factors?.totp?.length) {
      toast({
        title: "MFA required but no authenticator found",
        description: "Contact support or sign in with a method that supports 2FA setup.",
        variant: "destructive",
      });
      return "error";
    }

    const factor = factors.totp[0];
    const { data: ch, error: chErr } = await supabase.auth.mfa.challenge({ factorId: factor.id });
    if (chErr || !ch?.id) {
      toast({
        title: "MFA challenge failed",
        description: chErr?.message || "Try again",
        variant: "destructive",
      });
      return "error";
    }

    setMfaFactorId(factor.id);
    setMfaChallengeId(ch.id);
    setAuthStep("mfa");
    setOtpCode("");
    return "mfa";
  }

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setLoading(true);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: values.email,
        password: values.password,
      });

      if (error) {
        toast({
          title: "Login failed",
          description: error.message,
          variant: "destructive",
        });
        return;
      }

      const next = await afterPasswordSignIn();
      if (next === "redirect") {
        await finishLoginRedirect();
      } else if (next === "error") {
        await supabase.auth.signOut();
      }
    } catch (_error) {
      toast({
        title: "An error occurred",
        description: "Please try again later",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }

  async function onMfaVerify() {
    if (!mfaFactorId || !mfaChallengeId || !otpCode.trim()) return;
    setLoading(true);
    try {
      const { error } = await supabase.auth.mfa.verify({
        factorId: mfaFactorId,
        challengeId: mfaChallengeId,
        code: otpCode.replace(/\s/g, ""),
      });
      if (error) {
        toast({
          title: "Invalid code",
          description: error.message,
          variant: "destructive",
        });
        return;
      }
      setAuthStep("credentials");
      setMfaFactorId(null);
      setMfaChallengeId(null);
      await finishLoginRedirect();
    } catch (_e) {
      toast({
        title: "Verification failed",
        description: "Please try again",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }

  async function cancelMfa() {
    await supabase.auth.signOut();
    setAuthStep("credentials");
    setMfaFactorId(null);
    setMfaChallengeId(null);
    setOtpCode("");
    toast({ title: "Signed out", description: "You can sign in again." });
  }

  async function onRegister(values: z.infer<typeof registerSchema>) {
    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signUp({
        email: values.email,
        password: values.password,
        options: {
          data: {
            name: values.name,
          },
        },
      });

      if (error) {
        toast({
          title: "Registration failed",
          description: error.message,
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Registration successful",
        description: "Please check your email to verify your account.",
      });

      // If email verification is not required, redirect to profile setup
      if (!data.session) return;

      await supabase
        .from("profiles")
        .update({ professional_role: values.professionalRole })
        .eq("id", data.session.user.id);

      // Redirect to profile setup using replace
      router.replace("/profile/setup");
    } catch (_error) {
      toast({
        title: "An error occurred",
        description: "Please try again later",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }

  function oauthCallbackUrl(): string {
    const next = safeRedirectPath(searchParams.get("redirectUrl"));
    const base = `${window.location.origin}/auth/callback`;
    return next ? `${base}?next=${encodeURIComponent(next)}` : base;
  }

  async function signInWithGoogle() {
    const { error: signInError } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: oauthCallbackUrl(),
      },
    });

    if (signInError) {
      toast({
        title: "Login failed",
        description: signInError.message,
        variant: "destructive",
      });
    }
  }

  async function signInWithLinkedIn() {
    const { error: linkedInError } = await supabase.auth.signInWithOAuth({
      provider: "linkedin_oidc",
      options: {
        redirectTo: oauthCallbackUrl(),
      },
    });

    if (linkedInError) {
      toast({
        title: "Login failed",
        description: linkedInError.message,
        variant: "destructive",
      });
    }
  }

  return (
    <div className="container flex h-screen w-full flex-col items-center justify-center">
      <div className="mx-auto flex w-full flex-col space-y-6 sm:w-[350px] md:w-[500px]">
        <div className="flex flex-col space-y-2 text-center">
          <div className="mx-auto mb-4">
            {/* <Image src="/slogos.png" alt="Safety Shaper Logo" width={70} height={80} /> */}
          </div>
          <h1 className="text-2xl font-semibold tracking-tight">Welcome to Safety Shaper</h1>
          <p className="text-sm text-muted-foreground">
            The premier network for ESG & EHS professionals
          </p>
        </div>

        <Tabs
          defaultValue="login"
          value={activeTab}
          onValueChange={setActiveTab}
          className="w-full"
        >
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="login">Login</TabsTrigger>
            <TabsTrigger value="register">Register</TabsTrigger>
          </TabsList>
          <TabsContent value="login">
            <Card>
              <CardHeader>
                <CardTitle>
                  {authStep === "mfa" ? "Two-step verification" : "Login to your account"}
                </CardTitle>
                <CardDescription>
                  {authStep === "mfa"
                    ? "Enter the 6-digit code from your authenticator app."
                    : "Enter your email and password to access the platform"}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {authStep === "mfa" ? (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="mfa-otp">Authentication code</Label>
                      <Input
                        id="mfa-otp"
                        inputMode="numeric"
                        autoComplete="one-time-code"
                        placeholder="000000"
                        value={otpCode}
                        onChange={(e) => setOtpCode(e.target.value)}
                        disabled={loading}
                      />
                    </div>
                    <Button
                      type="button"
                      className="w-full bg-primary"
                      disabled={loading}
                      onClick={() => void onMfaVerify()}
                    >
                      {loading ? "Verifying…" : "Verify and continue"}
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      className="w-full"
                      onClick={() => void cancelMfa()}
                    >
                      Cancel and sign out
                    </Button>
                  </div>
                ) : (
                  <>
                    <Form {...form}>
                      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                          control={form.control}
                          name="email"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Email</FormLabel>
                              <FormControl>
                                <div className="relative">
                                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                  <Input
                                    className="pl-10"
                                    placeholder="john.doe@example.com"
                                    {...field}
                                  />
                                </div>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="password"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Password</FormLabel>
                              <FormControl>
                                <div className="relative">
                                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                  <Input
                                    className="pl-10"
                                    type="password"
                                    placeholder="••••••••"
                                    {...field}
                                  />
                                </div>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <Button type="submit" className="w-full bg-primary" disabled={loading}>
                          {loading ? "Signing in..." : "Sign In"}
                        </Button>
                      </form>
                    </Form>
                    <div className="relative">
                      <div className="absolute inset-0 flex items-center">
                        <Separator className="w-full" />
                      </div>
                      <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-background px-2 text-muted-foreground">
                          Or continue with
                        </span>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <Button variant="outline" onClick={signInWithGoogle}>
                        <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24" aria-label="Google">
                          <title>Google Sign In</title>
                          <path
                            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                            fill="#4285F4"
                          />
                          <path
                            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                            fill="#34A853"
                          />
                          <path
                            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                            fill="#FBBC05"
                          />
                          <path
                            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                            fill="#EA4335"
                          />
                        </svg>
                        Google
                      </Button>
                      <Button variant="outline" onClick={signInWithLinkedIn}>
                        <Linkedin className="mr-2 h-4 w-4" />
                        LinkedIn
                      </Button>
                    </div>
                  </>
                )}
              </CardContent>
              <CardFooter className="text-xs text-center text-muted-foreground">
                By logging in, you agree to our{" "}
                <Link href="/terms" className="text-primary underline">
                  Terms of Service
                </Link>{" "}
                and{" "}
                <Link href="/privacy" className="text-primary underline">
                  Privacy Policy
                </Link>
              </CardFooter>
            </Card>
          </TabsContent>
          <TabsContent value="register">
            <Card>
              <CardHeader>
                <CardTitle>Create an account</CardTitle>
                <CardDescription>Join the Safety Shaper network</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Form {...registerForm}>
                  <form onSubmit={registerForm.handleSubmit(onRegister)} className="space-y-4">
                    <FormField
                      control={registerForm.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Full Name</FormLabel>
                          <FormControl>
                            <Input placeholder="John Doe" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={registerForm.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                              <Input
                                className="pl-10"
                                placeholder="john.doe@example.com"
                                {...field}
                              />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={registerForm.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Password</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                              <Input
                                className="pl-10"
                                type="password"
                                placeholder="••••••••"
                                {...field}
                              />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={registerForm.control}
                      name="professionalRole"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>I am primarily a</FormLabel>
                          <FormControl>
                            <select
                              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm h-10"
                              value={field.value}
                              onChange={field.onChange}
                            >
                              <option value="job_seeker">Professional / job seeker</option>
                              <option value="recruiter">Recruiter</option>
                              <option value="auditor">Auditor / consultant</option>
                            </select>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button type="submit" className="w-full bg-primary" disabled={loading}>
                      {loading ? "Creating account..." : "Create Account"}
                    </Button>
                  </form>
                </Form>
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <Separator className="w-full" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground">
                      Or continue with
                    </span>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <Button variant="outline" onClick={signInWithGoogle}>
                    <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24" aria-label="Google">
                      <title>Google Sign In</title>
                      <path
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                        fill="#4285F4"
                      />
                      <path
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                        fill="#34A853"
                      />
                      <path
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                        fill="#FBBC05"
                      />
                      <path
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                        fill="#EA4335"
                      />
                    </svg>
                    Google
                  </Button>
                  <Button variant="outline" onClick={signInWithLinkedIn}>
                    <Linkedin className="mr-2 h-4 w-4" />
                    LinkedIn
                  </Button>
                </div>
              </CardContent>
              <CardFooter className="text-xs text-center text-muted-foreground">
                By creating an account, you agree to our{" "}
                <Link href="/terms" className="text-primary underline">
                  Terms of Service
                </Link>{" "}
                and{" "}
                <Link href="/privacy" className="text-primary underline">
                  Privacy Policy
                </Link>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
