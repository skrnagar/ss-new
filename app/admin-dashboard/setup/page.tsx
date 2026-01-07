"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Shield, Loader2, CheckCircle2, XCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function AdminSetupPage() {
  const [email, setEmail] = useState("admin@example.com");
  const [password, setPassword] = useState("admin123");
  const [fullName, setFullName] = useState("Administrator");
  const [isLoading, setIsLoading] = useState(false);
  const [setupStatus, setSetupStatus] = useState<{
    checked: boolean;
    tablesExist: boolean;
    hasUsers: boolean;
    error?: string;
  } | null>(null);
  const router = useRouter();
  const { toast } = useToast();

  const checkSetup = async () => {
    try {
      const response = await fetch("/api/admin/debug");
      const data = await response.json();

      setSetupStatus({
        checked: true,
        tablesExist: data.admin_users_table_exists,
        hasUsers: (data.admin_users_count || 0) > 0,
        error: data.error,
      });
    } catch (error: any) {
      setSetupStatus({
        checked: true,
        tablesExist: false,
        hasUsers: false,
        error: error.message,
      });
    }
  };

  const handleCreateAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch("/api/admin/debug", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "create",
          email,
          password,
          full_name: fullName,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        console.error("Setup error response:", data);
        throw new Error(data.error || "Failed to create admin user");
      }

      console.log("Admin user created successfully:", data);

      if (data.success) {
        toast({
          title: "Success!",
          description: `Admin user ${data.message}. You can now login with email: ${email}`,
        });

        // Redirect to login after a short delay
        setTimeout(() => {
          router.push("/admin-dashboard/login");
        }, 2000);
      } else {
        throw new Error(data.error || "Failed to create admin user");
      }
    } catch (error: any) {
      console.error("Setup error:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to create admin user. Check console for details.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-secondary/5 p-4">
      <div className="w-full max-w-2xl space-y-6">
        <Card className="border-2 shadow-xl">
          <CardHeader className="space-y-4 text-center">
            <div className="flex justify-center">
              <div className="rounded-full bg-primary/10 p-3">
                <Shield className="h-8 w-8 text-primary" />
              </div>
            </div>
            <div>
              <CardTitle className="text-2xl font-bold">Admin Setup</CardTitle>
              <CardDescription className="mt-2">
                Create your first admin user to access the admin dashboard
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Check Setup Button */}
            <div>
              <Button onClick={checkSetup} variant="outline" className="w-full">
                Check Database Setup
              </Button>
              {setupStatus?.checked && (
                <div className="mt-4 space-y-2">
                  <Alert
                    variant={setupStatus.tablesExist ? "default" : "destructive"}
                  >
                    <div className="flex items-center gap-2">
                      {setupStatus.tablesExist ? (
                        <CheckCircle2 className="h-4 w-4" />
                      ) : (
                        <XCircle className="h-4 w-4" />
                      )}
                      <AlertDescription>
                        {setupStatus.tablesExist
                          ? "Admin tables exist"
                          : "Admin tables not found. Please run the database schema first."}
                      </AlertDescription>
                    </div>
                  </Alert>
                  {setupStatus.tablesExist && (
                    <Alert
                      variant={setupStatus.hasUsers ? "default" : "destructive"}
                    >
                      <div className="flex items-center gap-2">
                        {setupStatus.hasUsers ? (
                          <CheckCircle2 className="h-4 w-4" />
                        ) : (
                          <XCircle className="h-4 w-4" />
                        )}
                        <AlertDescription>
                          {setupStatus.hasUsers
                            ? "Admin users found"
                            : "No admin users found. Create one below."}
                        </AlertDescription>
                      </div>
                    </Alert>
                  )}
                  {setupStatus.error && (
                    <Alert variant="destructive">
                      <AlertDescription>{setupStatus.error}</AlertDescription>
                    </Alert>
                  )}
                </div>
              )}
            </div>

            {/* Create Admin Form */}
            <form onSubmit={handleCreateAdmin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name</Label>
                <Input
                  id="fullName"
                  type="text"
                  placeholder="Administrator"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                  disabled={isLoading}
                  className="h-11"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="admin@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={isLoading}
                  className="h-11"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter a secure password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={isLoading}
                  className="h-11"
                />
              </div>
              <Button
                type="submit"
                className="w-full h-11"
                disabled={isLoading || !setupStatus?.tablesExist}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating admin user...
                  </>
                ) : (
                  "Create Admin User"
                )}
              </Button>
            </form>

            {!setupStatus?.tablesExist && (
              <Alert>
                <AlertDescription>
                  <strong>Database schema not found.</strong>
                  <br />
                  Please run the SQL schema in Supabase:
                  <br />
                  <code className="text-xs mt-2 block p-2 bg-muted rounded">
                    lib/admin-schema.sql
                  </code>
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
        <div className="text-center">
          <p className="text-sm text-muted-foreground">
            Safety Shaper Admin Panel Setup
          </p>
        </div>
      </div>
    </div>
  );
}

