"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import Link from "next/link";
import * as React from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";

const profileEditSchema = z.object({
  full_name: z.string().min(2, "Full name must be at least 2 characters"),
  username: z
    .string()
    .min(3, "Username must be at least 3 characters")
    .regex(
      /^[a-z0-9_-]+$/,
      "Username can only contain lowercase letters, numbers, underscores, and hyphens"
    ),
  headline: z.string().min(10, "Headline must be at least 10 characters"),
  bio: z.string().min(30, "Bio should be at least 30 characters"),
  company: z.string().min(2, "Company name must be at least 2 characters"),
  position: z.string().min(2, "Position must be at least 2 characters"),
  location: z.string().min(2, "Location must be at least 2 characters"),
  phone: z.string().optional(),
  website: z.string().url("Please enter a valid URL").optional().or(z.literal("")),
  professional_role: z.enum(["job_seeker", "recruiter", "auditor"]),
  auditor_services_summary: z.string().max(4000).optional().or(z.literal("")),
});

export default function ProfileEditPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = React.useState(false);
  const [user, setUser] = React.useState<any>(null);
  const [profile, setProfile] = React.useState<any>(null);
  const [avatarUrl, setAvatarUrl] = React.useState<string | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const form = useForm<z.infer<typeof profileEditSchema>>({
    resolver: zodResolver(profileEditSchema),
    defaultValues: {
      full_name: "",
      username: "",
      headline: "",
      bio: "",
      company: "",
      position: "",
      location: "",
      phone: "",
      website: "",
      professional_role: "job_seeker" as "job_seeker" | "recruiter" | "auditor",
      auditor_services_summary: "",
    },
  });

  const professionalRole = form.watch("professional_role");
  const fullNameWatch = form.watch("full_name");
  const [geoLoading, setGeoLoading] = React.useState(false);

  React.useEffect(() => {
    async function getProfileData() {
      setLoading(true);

      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        setUser(user);

        if (!user) {
          router.push("/auth/login");
          return;
        }

        // Get profile data
        const { data: profileData, error } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single();

        if (error || !profileData) {
          toast({
            title: "Error loading profile",
            description: "Please try again later",
            variant: "destructive",
          });
          router.push("/profile/setup");
          return;
        }

        setProfile(profileData);
        setAvatarUrl(profileData.avatar_url || user?.user_metadata?.avatar_url || null);

        // Set form values
        form.reset({
          full_name:
            profileData.full_name ||
            (user?.user_metadata?.name as string | undefined) ||
            "",
          username: profileData.username || "",
          headline: profileData.headline || "",
          bio: profileData.bio || "",
          company: profileData.company || "",
          position: profileData.position || "",
          location: profileData.location || "",
          phone: profileData.phone || "",
          website: profileData.website || "",
          professional_role: (profileData.professional_role as "job_seeker" | "recruiter" | "auditor") || "job_seeker",
          auditor_services_summary: profileData.auditor_services_summary || "",
        });
      } catch (error) {
        console.error("Error loading profile:", error);
        toast({
          title: "Error loading profile",
          description: "Please try again later",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    }

    getProfileData();
  }, [router, form, toast]);

  async function onSubmit(values: z.infer<typeof profileEditSchema>) {
    setLoading(true);

    try {
      // Check if username is already taken (if changed)
      if (values.username !== profile.username) {
        const { data: taken, error: usernameErr } = await supabase
          .from("profiles")
          .select("id")
          .eq("username", values.username)
          .neq("id", user.id)
          .maybeSingle();

        if (usernameErr) {
          toast({
            title: "Could not verify username",
            description: usernameErr.message,
            variant: "destructive",
          });
          setLoading(false);
          return;
        }

        if (taken) {
          form.setError("username", {
            type: "manual",
            message: "This username is already taken",
          });
          setLoading(false);
          return;
        }
      }

      // Update user profile
      const { error } = await supabase
        .from("profiles")
        .update({
          full_name: values.full_name,
          username: values.username,
          headline: values.headline,
          bio: values.bio,
          company: values.company,
          position: values.position,
          location: values.location,
          phone: values.phone || null,
          website: values.website || null,
          professional_role: values.professional_role,
          auditor_services_summary:
            values.professional_role === "auditor" && values.auditor_services_summary
              ? values.auditor_services_summary
              : null,
          avatar_url: avatarUrl,
          updated_at: new Date().toISOString(),
        })
        .eq("id", user.id);

      if (error) {
        toast({
          title: "Profile update failed",
          description: error.message,
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Profile updated successfully",
        description: "Redirecting to your profile...",
      });

      setTimeout(() => router.push(`/profile/${values.username}`), 1500);
    } catch (error) {
      toast({
        title: "An error occurred",
        description: "Please try again later",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  async function pinLocationOnMap() {
    const loc = form.getValues("location")?.trim();
    if (!loc) {
      toast({ title: "Add a location first", variant: "destructive" });
      return;
    }
    if (!user?.id) return;
    setGeoLoading(true);
    try {
      const res = await fetch(`/api/maps/geocode?address=${encodeURIComponent(loc)}`);
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || data.hint || "Geocode failed");
      }
      const { error } = await supabase
        .from("profiles")
        .update({
          latitude: data.lat,
          longitude: data.lng,
          updated_at: new Date().toISOString(),
        })
        .eq("id", user.id);
      if (error) throw error;
      toast({
        title: "Map coordinates saved",
        description: data.formatted_address || "You can appear on the auditor map search.",
      });
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Could not geocode";
      toast({ title: "Geocoding failed", description: msg, variant: "destructive" });
    } finally {
      setGeoLoading(false);
    }
  }

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Check file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please select an image under 2MB",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);

      // Upload to Supabase Storage
      const fileName = `avatar-${user.id}-${Date.now()}`;
      const { data, error } = await supabase.storage.from("avatars").upload(fileName, file, {
        cacheControl: "3600",
        upsert: true,
      });

      if (error) throw error;

      // Get public URL
      const {
        data: { publicUrl },
      } = supabase.storage.from("avatars").getPublicUrl(fileName);

      setAvatarUrl(publicUrl);

      toast({
        title: "Avatar uploaded",
        description: "Your profile picture has been updated",
      });
    } catch (error) {
      console.error("Error uploading avatar:", error);
      toast({
        title: "Upload failed",
        description: "Please try again later",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getInitials = (name = "") => {
    return (
      name
        .split(" ")
        .map((part) => part[0])
        .join("")
        .toUpperCase()
        .substring(0, 2) || "US"
    );
  };

  return (
    <div className="container max-w-3xl py-10">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Edit Your Profile</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center mb-6">
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              accept="image/*"
              onChange={handleFileChange}
            />
            <Avatar
              className="h-24 w-24 cursor-pointer shadow-md ring-4 ring-background"
              onClick={handleAvatarClick}
            >
              <AvatarImage
                src={avatarUrl || profile?.avatar_url || undefined}
                alt={fullNameWatch || profile?.full_name || "User"}
                className="object-cover"
              />
              <AvatarFallback className="text-xl font-semibold">
                {getInitials(fullNameWatch || profile?.full_name || "")}
              </AvatarFallback>
            </Avatar>
            <Button variant="outline" size="sm" onClick={handleAvatarClick}>
              Change Photo
            </Button>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="full_name"
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
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Username</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormDescription>
                      Your profile URL: {typeof window !== "undefined" ? window.location.host : "yoursite.com"}
                      /profile/{field.value || "username"}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="headline"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Professional Headline</FormLabel>
                    <FormControl>
                      <Input placeholder="ESG Compliance Manager | Safety Specialist" {...field} />
                    </FormControl>
                    <FormDescription>A brief summary of your professional role</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="bio"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Bio</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="I'm a safety professional with 5+ years of experience in..."
                        className="min-h-32"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Tell other professionals about your experience and expertise
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="company"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Current Company</FormLabel>
                      <FormControl>
                        <Input placeholder="GreenTech Solutions" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="position"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Current Position</FormLabel>
                      <FormControl>
                        <Input placeholder="ESG Compliance Manager" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Location</FormLabel>
                    <FormControl>
                      <Input placeholder="San Francisco, CA" {...field} />
                    </FormControl>
                    <FormDescription className="flex flex-col gap-2">
                      <span>Used for auditor “near me” search after you pin coordinates.</span>
                      <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        className="w-fit"
                        disabled={geoLoading}
                        onClick={() => void pinLocationOnMap()}
                      >
                        {geoLoading ? "Geocoding…" : "Save map pin from this address"}
                      </Button>
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="professional_role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Primary professional type</FormLabel>
                    <FormControl>
                      <select
                        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm h-10"
                        value={field.value}
                        onChange={field.onChange}
                      >
                        <option value="job_seeker">Job seeker</option>
                        <option value="recruiter">Recruiter / hiring</option>
                        <option value="auditor">Independent auditor / consultant</option>
                      </select>
                    </FormControl>
                    <FormDescription>
                      Auditors can request platform verification and accept digital audit bookings.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {professionalRole === "auditor" && (
                <FormField
                  control={form.control}
                  name="auditor_services_summary"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Audit services (shown on your profile)</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="ISO 45001 audits, site inspections, gap analysis…"
                          className="min-h-24"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone Number (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="+1 (555) 123-4567" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="website"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Website (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="https://yourwebsite.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <p className="text-sm text-muted-foreground border-t pt-4">
                Security, two-factor authentication, and job-alert emails:{" "}
                <Link href="/settings" className="text-primary font-medium underline underline-offset-2">
                  Account settings
                </Link>
                .
              </p>

              <div className="flex gap-2 pt-4">
                <Button type="submit" disabled={loading}>
                  {loading ? "Saving Changes..." : "Save Changes"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push(`/profile/${profile?.username}`)}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
