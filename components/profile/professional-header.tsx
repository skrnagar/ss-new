"use client";

import { AvatarUpload } from "@/app/components/avatar-upload";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ProfileCompletionBar } from "@/components/profile/profile-completion-bar";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import { Camera, BadgeCheck, Shield } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";

type ProfileHeaderProps = {
  profileId: string;
  username: string;
  fullName: string | null;
  headline: string | null;
  avatarUrl: string | null;
  coverImageUrl: string | null;
  verified?: boolean;
  isOwnProfile: boolean;
  completionPercent: number;
  isProfilePublic: boolean;
  /** Discoverable in recruiter-facing talent search when true (default true). */
  recruiterVisible?: boolean;
  /** Discoverable in auditor-facing talent search when true (default true). */
  auditorVisible?: boolean;
  /** Platform-approved auditor (admin workflow). */
  approvedPlatformAuditor?: boolean;
};

export function ProfessionalHeader({
  profileId,
  username,
  fullName,
  headline,
  avatarUrl,
  coverImageUrl,
  verified,
  approvedPlatformAuditor,
  isOwnProfile,
  completionPercent,
  isProfilePublic: initialPublic,
  recruiterVisible: initialRecruiterVisible = true,
  auditorVisible: initialAuditorVisible = true,
}: ProfileHeaderProps) {
  const { toast } = useToast();
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [coverUrl, setCoverUrl] = useState(coverImageUrl);
  const [uploading, setUploading] = useState(false);
  const [isPublic, setIsPublic] = useState(initialPublic !== false);
  const [recruiterVisible, setRecruiterVisible] = useState(initialRecruiterVisible !== false);
  const [auditorVisible, setAuditorVisible] = useState(initialAuditorVisible !== false);

  const onCoverSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !isOwnProfile) return;
    if (!file.type.startsWith("image/")) {
      toast({
        title: "Invalid file",
        description: "Please upload an image for your cover photo.",
        variant: "destructive",
      });
      return;
    }
    setUploading(true);
    try {
      const path = `covers/${profileId}/${Date.now()}-${file.name.replace(/[^a-z0-9.]/gi, "_")}`;
      const { error: upErr } = await supabase.storage
        .from("post-images")
        .upload(path, file, { upsert: true, contentType: file.type });

      if (upErr) throw upErr;

      const {
        data: { publicUrl },
      } = supabase.storage.from("post-images").getPublicUrl(path);

      const { error: dbErr } = await supabase
        .from("profiles")
        .update({ cover_image_url: publicUrl })
        .eq("id", profileId);

      if (dbErr) throw dbErr;

      setCoverUrl(publicUrl);
      toast({ title: "Cover photo updated" });
      router.refresh();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Upload failed";
      toast({ title: "Could not update cover", description: msg, variant: "destructive" });
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  const togglePublic = async (checked: boolean) => {
    if (!isOwnProfile) return;
    setIsPublic(checked);
    const { error } = await supabase
      .from("profiles")
      .update({ is_profile_public: checked })
      .eq("id", profileId);

    if (error) {
      setIsPublic(!checked);
      toast({
        title: "Could not update visibility",
        description: error.message,
        variant: "destructive",
      });
      return;
    }
    toast({
      title: checked ? "Profile is public" : "Profile is private",
      description: checked
        ? "Others can view your full profile."
        : "Only you can view your profile details (signed-in as you).",
    });
    router.refresh();
  };

  const toggleRecruiterVisible = async (checked: boolean) => {
    if (!isOwnProfile) return;
    setRecruiterVisible(checked);
    const { error } = await supabase
      .from("profiles")
      .update({ recruiter_visible: checked })
      .eq("id", profileId);
    if (error) {
      setRecruiterVisible(!checked);
      toast({ title: "Could not update setting", description: error.message, variant: "destructive" });
      return;
    }
    toast({
      title: checked ? "Visible to recruiters" : "Hidden from recruiter search",
      description: checked
        ? "You can appear in talent search for hiring teams."
        : "Recruiters may not see you in candidate search.",
    });
    router.refresh();
  };

  const toggleAuditorVisible = async (checked: boolean) => {
    if (!isOwnProfile) return;
    setAuditorVisible(checked);
    const { error } = await supabase
      .from("profiles")
      .update({ auditor_visible: checked })
      .eq("id", profileId);
    if (error) {
      setAuditorVisible(!checked);
      toast({ title: "Could not update setting", description: error.message, variant: "destructive" });
      return;
    }
    toast({
      title: checked ? "Visible to auditors" : "Hidden from auditor search",
      description: checked
        ? "You can appear when auditors look for specialists."
        : "Auditors may not see you in candidate search.",
    });
    router.refresh();
  };

  return (
    <div className="relative mb-6 rounded-xl border bg-card shadow-sm">
      {/* overflow-hidden only on the banner — outer overflow clips the overlapping avatar */}
      <div className="relative h-40 sm:h-48 w-full overflow-hidden rounded-t-xl bg-gradient-to-r from-slate-700 via-slate-600 to-primary/80">
        {coverUrl ? (
          <Image
            src={coverUrl}
            alt=""
            fill
            className="object-cover"
            sizes="100vw"
            priority
          />
        ) : null}
        {isOwnProfile && (
          <>
            <input
              ref={inputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={onCoverSelect}
            />
            <Button
              type="button"
              size="sm"
              variant="secondary"
              className="absolute bottom-3 right-3 gap-2 shadow-md"
              disabled={uploading}
              onClick={() => inputRef.current?.click()}
            >
              <Camera className="h-4 w-4" />
              {uploading ? "Uploading…" : "Change cover"}
            </Button>
          </>
        )}
      </div>

      <div className="relative rounded-b-xl bg-card px-6 pb-6 pt-0">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end -mt-16 sm:-mt-20">
          <div className="mx-auto flex w-fit flex-shrink-0 sm:mx-0">
            <div className="rounded-full bg-background p-1 shadow-xl ring-4 ring-background">
              <AvatarUpload
                userId={profileId}
                avatarUrl={avatarUrl}
                name={fullName || username}
                isOwnProfile={isOwnProfile}
              />
            </div>
          </div>
          <div className="flex-1 text-center sm:text-left min-w-0 pt-2 sm:pb-2">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
              <h1 className="text-2xl sm:text-3xl font-bold text-foreground truncate">
                {fullName || username}
              </h1>
              {verified && (
                <BadgeCheck className="h-6 w-6 text-primary flex-shrink-0" aria-label="Verified profile" />
              )}
              {approvedPlatformAuditor && (
                <Badge variant="secondary" className="gap-1 font-normal">
                  <Shield className="h-3.5 w-3.5" />
                  Verified auditor
                </Badge>
              )}
            </div>
            {headline && (
              <p className="text-muted-foreground mt-1 text-sm sm:text-base">{headline}</p>
            )}
            <p className="text-xs text-muted-foreground mt-1">@{username}</p>

            {isOwnProfile && (
              <div className="mt-4 flex flex-col sm:flex-row sm:items-center gap-3 max-w-md mx-auto sm:mx-0">
                <ProfileCompletionBar percent={completionPercent} className="flex-1" />
              </div>
            )}

            {isOwnProfile && (
              <div className="flex items-center justify-center sm:justify-start gap-2 mt-4">
                <Switch
                  id="profile-public"
                  checked={isPublic}
                  onCheckedChange={togglePublic}
                />
                <Label htmlFor="profile-public" className="text-sm cursor-pointer">
                  Public profile
                </Label>
                <Badge variant="outline" className="text-xs">
                  {isPublic ? "Visible to network" : "Private"}
                </Badge>
              </div>
            )}

            {isOwnProfile && (
              <div className="flex flex-col gap-3 mt-4 max-w-md mx-auto sm:mx-0">
                <div className="flex items-center justify-center sm:justify-start gap-2">
                  <Switch
                    id="profile-recruiter-visible"
                    checked={recruiterVisible}
                    onCheckedChange={toggleRecruiterVisible}
                  />
                  <Label htmlFor="profile-recruiter-visible" className="text-sm cursor-pointer">
                    Appear in recruiter talent search
                  </Label>
                </div>
                <div className="flex items-center justify-center sm:justify-start gap-2">
                  <Switch
                    id="profile-auditor-visible"
                    checked={auditorVisible}
                    onCheckedChange={toggleAuditorVisible}
                  />
                  <Label htmlFor="profile-auditor-visible" className="text-sm cursor-pointer">
                    Appear in auditor talent search
                  </Label>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
