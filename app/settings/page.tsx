"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/auth-context";
import { ArrowLeft, Mail, Shield } from "lucide-react";

type EnrollPayload = {
  id: string;
  totp?: { qr_code?: string; secret?: string };
};

export default function SettingsPage() {
  const { session, refreshProfile } = useAuth();
  const { toast } = useToast();
  const user = session?.user;

  const [emailJobAlerts, setEmailJobAlerts] = useState(true);
  const [prefsLoading, setPrefsLoading] = useState(true);

  const [mfaFactors, setMfaFactors] = useState<{ id: string; friendly_name?: string }[]>([]);
  const [mfaLoading, setMfaLoading] = useState(false);
  const [enrollPayload, setEnrollPayload] = useState<EnrollPayload | null>(null);
  const [verifyCode, setVerifyCode] = useState("");

  const loadPrefs = useCallback(async () => {
    if (!user?.id) return;
    setPrefsLoading(true);
    const { data, error } = await supabase
      .from("profiles")
      .select("email_job_alerts")
      .eq("id", user.id)
      .single();
    if (error) {
      console.error(error);
      setEmailJobAlerts(true);
    } else {
      setEmailJobAlerts((data as { email_job_alerts?: boolean })?.email_job_alerts !== false);
    }
    setPrefsLoading(false);
  }, [user?.id]);

  const loadMfa = useCallback(async () => {
    if (!user?.id) return;
    const { data, error } = await supabase.auth.mfa.listFactors();
    if (error) {
      console.error(error);
      return;
    }
    setMfaFactors(data?.totp?.map((f) => ({ id: f.id, friendly_name: f.friendly_name })) || []);
  }, [user?.id]);

  useEffect(() => {
    void loadPrefs();
    void loadMfa();
  }, [loadPrefs, loadMfa]);

  const saveEmailPref = async (checked: boolean) => {
    if (!user?.id) return;
    setEmailJobAlerts(checked);
    const { error } = await supabase
      .from("profiles")
      .update({ email_job_alerts: checked, updated_at: new Date().toISOString() })
      .eq("id", user.id);
    if (error) {
      toast({ title: "Could not save", description: error.message, variant: "destructive" });
      setEmailJobAlerts(!checked);
      return;
    }
    toast({ title: checked ? "Job alert emails on" : "Job alert emails off" });
    void refreshProfile();
  };

  const startEnroll = async () => {
    if (!user?.id) return;
    setMfaLoading(true);
    setEnrollPayload(null);
    setVerifyCode("");
    try {
      const { data, error } = await supabase.auth.mfa.enroll({
        factorType: "totp",
        friendlyName: "Authenticator app",
      });
      if (error) throw error;
      if (data?.id) setEnrollPayload(data as EnrollPayload);
      else toast({ title: "MFA", description: "No factor returned", variant: "destructive" });
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Enrollment failed";
      toast({ title: "MFA enrollment", description: msg, variant: "destructive" });
    } finally {
      setMfaLoading(false);
    }
  };

  const confirmEnroll = async () => {
    if (!enrollPayload?.id || !verifyCode.trim()) return;
    setMfaLoading(true);
    try {
      const { error } = await supabase.auth.mfa.challengeAndVerify({
        factorId: enrollPayload.id,
        code: verifyCode.replace(/\s/g, ""),
      });
      if (error) throw error;
      toast({ title: "Two-factor authentication enabled" });
      setEnrollPayload(null);
      setVerifyCode("");
      await loadMfa();
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Verification failed";
      toast({ title: "Invalid code", description: msg, variant: "destructive" });
    } finally {
      setMfaLoading(false);
    }
  };

  const removeFactor = async (factorId: string) => {
    setMfaLoading(true);
    try {
      const { error } = await supabase.auth.mfa.unenroll({ factorId });
      if (error) throw error;
      toast({ title: "Authenticator removed" });
      await loadMfa();
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Could not remove";
      toast({ title: "Unenroll failed", description: msg, variant: "destructive" });
    } finally {
      setMfaLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="container max-w-lg py-16 text-center text-sm text-muted-foreground">
        <Link href="/auth/login" className="text-primary underline">
          Sign in
        </Link>{" "}
        to manage settings.
      </div>
    );
  }

  return (
    <div className="container max-w-2xl py-8 px-4 pb-24 md:pb-8">
      <div className="mb-6">
        <Button variant="ghost" size="sm" asChild className="mb-2 -ml-2">
          <Link href="/feed" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back
          </Link>
        </Button>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-sm text-muted-foreground mt-1">Security and notification preferences</p>
      </div>

      <Tabs defaultValue="security">
        <TabsList className="mb-4">
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
        </TabsList>

        <TabsContent value="security" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Two-factor authentication (TOTP)
              </CardTitle>
              <CardDescription>
                Use an authenticator app (Google Authenticator, 1Password, etc.). Enable TOTP in the
                Supabase dashboard under Authentication → Multi-factor authentication.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {mfaFactors.length > 0 && (
                <div className="rounded-lg border p-3 space-y-2">
                  <p className="text-sm font-medium">Active authenticators</p>
                  <ul className="text-sm space-y-2">
                    {mfaFactors.map((f) => (
                      <li key={f.id} className="flex items-center justify-between gap-2">
                        <span>{f.friendly_name || "Authenticator"}</span>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          disabled={mfaLoading}
                          onClick={() => void removeFactor(f.id)}
                        >
                          Remove
                        </Button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {enrollPayload?.totp?.qr_code && (
                <div className="space-y-3 rounded-lg border p-4">
                  <p className="text-sm">Scan this QR code with your authenticator app.</p>
                  {/* TOTP SVG from Supabase (data URL) */}
                  <img
                    src={enrollPayload.totp.qr_code}
                    alt="TOTP QR"
                    className="w-40 h-40 border rounded"
                  />
                  {enrollPayload.totp.secret && (
                    <p className="text-xs text-muted-foreground break-all">
                      Secret: {enrollPayload.totp.secret}
                    </p>
                  )}
                  <div>
                    <Label htmlFor="mfa-verify">6-digit code</Label>
                    <Input
                      id="mfa-verify"
                      inputMode="numeric"
                      autoComplete="one-time-code"
                      value={verifyCode}
                      onChange={(e) => setVerifyCode(e.target.value)}
                      placeholder="000000"
                      className="mt-1 max-w-xs"
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      disabled={mfaLoading}
                      onClick={() => void confirmEnroll()}
                    >
                      Confirm &amp; enable
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => {
                        setEnrollPayload(null);
                        setVerifyCode("");
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              )}

              {!enrollPayload && (
                <Button type="button" disabled={mfaLoading} onClick={() => void startEnroll()}>
                  {mfaLoading
                    ? "Working…"
                    : mfaFactors.length
                      ? "Add another authenticator"
                      : "Set up authenticator"}
                </Button>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Mail className="h-5 w-5" />
                Email
              </CardTitle>
              <CardDescription>
                Transactional emails use{" "}
                <a
                  href="https://resend.com"
                  className="text-primary underline"
                  target="_blank"
                  rel="noreferrer"
                >
                  Resend
                </a>{" "}
                when <code className="text-xs bg-muted px-1 rounded">RESEND_API_KEY</code> is set.
                Auth emails (verification, reset password) are configured in Supabase with custom
                SMTP — see{" "}
                <code className="text-xs bg-muted px-1 rounded">
                  lib/phase6-notifications-security.sql
                </code>
                .
              </CardDescription>
            </CardHeader>
            <CardContent>
              {prefsLoading ? (
                <p className="text-sm text-muted-foreground">Loading…</p>
              ) : (
                <div className="flex items-center justify-between gap-4 rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <Label htmlFor="job-email">Job alert emails</Label>
                    <p className="text-xs text-muted-foreground">
                      Receive an email when a posted job matches your saved job alerts (in-app bell
                      always used).
                    </p>
                  </div>
                  <Switch
                    id="job-email"
                    checked={emailJobAlerts}
                    onCheckedChange={(v) => void saveEmailPref(v)}
                  />
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
