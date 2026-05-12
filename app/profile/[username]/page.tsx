import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { UserActivity } from "@/components/user-activity";
import { BioDisplay } from "@/components/bio-display";
import { ExperienceSection } from "@/components/experience-section";
import { EducationSection } from "@/components/education-section";
import { ProfessionalHeader } from "@/components/profile/professional-header";
import { SkillsEndorsementsSection } from "@/components/profile/skills-endorsements-section";
import { ProjectsSection } from "@/components/profile/projects-section";
import { AchievementsSection } from "@/components/profile/achievements-section";
import { ResumeCvSection } from "@/components/profile/resume-cv-section";
import { createLegacyClient } from "@/lib/supabase-server";
import { computeProfileCompletion } from "@/lib/profile-completion";
import {
  Briefcase,
  Calendar,
  Edit,
  MapPin,
  MessageSquare,
  User,
  UserPlus,
  Linkedin,
  Twitter,
  Globe,
  Users,
  FileText,
} from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ConnectButton } from "@/components/connect-button";
import { FollowButton } from "@/components/follow-button";
import { AuditorReviewsSection } from "@/components/profile/auditor-reviews-section";
import { AuditorVerificationCta } from "@/components/profile/auditor-verification-cta";

/** Ensure social / website links work when stored without a scheme (e.g. linkedin.com/in/…). */
function normalizeExternalHref(url: string): string {
  const u = url.trim();
  if (!u) return u;
  if (/^https?:\/\//i.test(u)) return u;
  return `https://${u.replace(/^\/+/, "")}`;
}

export const revalidate = 3600;

export default async function ProfilePage({ params }: { params: { username: string } }) {
  const { username } = params;
  const supabase = createLegacyClient();

  const {
    data: { session },
  } = await supabase.auth.getSession();

  const { data: profile, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("username", username)
    .single();

  if (error || !profile) {
    return notFound();
  }

  const isOwnProfile = session?.user?.id === profile.id;
  const isPublic =
    profile.is_profile_public === undefined ||
    profile.is_profile_public === null ||
    profile.is_profile_public === true;

  if (!isPublic && !isOwnProfile) {
    return notFound();
  }

  const [
    connectionsRes,
    followersRes,
    postsRes,
    expRes,
    eduRes,
    skillsRes,
    projectsRes,
    achievementsRes,
  ] = await Promise.all([
    supabase
      .from("connections")
      .select("id", { count: "exact", head: true })
      .or(`user_id.eq.${profile.id},connected_user_id.eq.${profile.id}`)
      .eq("status", "accepted"),
    supabase
      .from("follows")
      .select("follower_id", { count: "exact", head: true })
      .eq("following_id", profile.id),
    supabase.from("posts").select("id", { count: "exact", head: true }).eq("author_id", profile.id),
    supabase.from("experiences").select("id", { count: "exact", head: true }).eq("user_id", profile.id),
    supabase.from("education").select("id", { count: "exact", head: true }).eq("user_id", profile.id),
    supabase.from("profile_skills").select("id", { count: "exact", head: true }).eq("user_id", profile.id),
    supabase.from("profile_projects").select("id", { count: "exact", head: true }).eq("user_id", profile.id),
    supabase.from("profile_achievements").select("id", { count: "exact", head: true }).eq("user_id", profile.id),
  ]);

  const connectionsCount = connectionsRes.count ?? 0;
  const followersCount = followersRes.count ?? 0;
  const postsCount = postsRes.count ?? 0;
  const expCount = expRes.count ?? 0;
  const eduCount = eduRes.count ?? 0;
  const skillsCount = skillsRes.count ?? 0;
  const projectsCount = projectsRes.count ?? 0;
  const achievementsCount = achievementsRes.count ?? 0;

  const completionPercent = computeProfileCompletion(
    {
      avatar_url: profile.avatar_url,
      cover_image_url: profile.cover_image_url,
      headline: profile.headline,
      bio: profile.bio,
      full_name: profile.full_name,
      company: profile.company,
      position: profile.position,
      location: profile.location,
      cv_url: profile.cv_url,
    },
    {
      experience: expCount,
      education: eduCount,
      skills: skillsCount,
      projects: projectsCount,
      achievements: achievementsCount,
    }
  );

  const joinDate = new Date(profile.created_at).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
  });

  const socialLinks = [
    profile.linkedin && { icon: Linkedin, url: normalizeExternalHref(profile.linkedin) },
    profile.twitter && { icon: Twitter, url: normalizeExternalHref(profile.twitter) },
    profile.website && { icon: Globe, url: normalizeExternalHref(profile.website) },
  ].filter(Boolean) as { icon: typeof Linkedin; url: string }[];

  const stats = [
    { icon: Users, label: "Connections", value: connectionsCount },
    { icon: UserPlus, label: "Followers", value: followersCount },
    { icon: FileText, label: "Posts", value: postsCount },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <ProfessionalHeader
          profileId={profile.id}
          username={username}
          fullName={profile.full_name}
          headline={profile.headline}
          avatarUrl={profile.avatar_url}
          coverImageUrl={profile.cover_image_url ?? null}
          verified={profile.verified === true}
          approvedPlatformAuditor={
            profile.professional_role === "auditor" &&
            profile.auditor_verification_status === "approved"
          }
          isOwnProfile={isOwnProfile}
          completionPercent={completionPercent}
          isProfilePublic={isPublic}
          recruiterVisible={profile.recruiter_visible !== false}
          auditorVisible={profile.auditor_visible !== false}
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="space-y-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex justify-center gap-3 mb-6">
                  {socialLinks.map((link, i) => (
                    <a
                      key={i}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 rounded-full bg-gray-100 hover:bg-primary/10 hover:text-primary transition-all duration-200"
                    >
                      <link.icon className="h-5 w-5" />
                    </a>
                  ))}
                </div>

                <div className="flex justify-center gap-6 mb-6">
                  {stats.map((stat, i) => (
                    <div key={i} className="flex flex-col items-center">
                      <stat.icon className="h-5 w-5 text-primary mb-1" />
                      <span className="font-bold text-lg text-gray-900">{stat.value}</span>
                      <span className="text-xs text-gray-500">{stat.label}</span>
                    </div>
                  ))}
                </div>

                <div className="w-full flex gap-2 flex-wrap">
                  {isOwnProfile ? (
                    <Button
                      className="w-full bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-lg"
                      asChild
                    >
                      <Link href="/profile/edit">
                        <Edit className="h-4 w-4 mr-2" />
                        Edit profile
                      </Link>
                    </Button>
                  ) : (
                    <>
                      <Button className="flex-1 bg-primary hover:bg-primary/90 shadow-lg" asChild>
                        <Link href={`/messages?userId=${profile.id}`}>
                          <MessageSquare className="h-4 w-4 mr-2" />
                          Message
                        </Link>
                      </Button>
                      {session?.user && (
                        <ConnectButton userId={session.user.id} profileId={profile.id} />
                      )}
                      {session?.user && !isOwnProfile && (
                        <FollowButton userId={session.user.id} profileId={profile.id} />
                      )}
                    </>
                  )}
                  {profile.professional_role === "auditor" &&
                    profile.auditor_verification_status === "approved" &&
                    !isOwnProfile &&
                    session?.user && (
                      <Button variant="secondary" className="w-full" asChild>
                        <Link href={`/audits/book/${username}`}>Request professional audit</Link>
                      </Button>
                    )}
                </div>
                {profile.professional_role === "auditor" && isOwnProfile && (
                  <div className="mt-4 client-only-component" suppressHydrationWarning>
                    <AuditorVerificationCta status={profile.auditor_verification_status} />
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <User className="h-5 w-5 text-primary" />
                  Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {profile.company && (
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <Briefcase className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {profile.position ? `${profile.position} at ` : "Works at "}
                        {profile.company}
                      </p>
                    </div>
                  </div>
                )}
                {profile.location && (
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <MapPin className="h-4 w-4 text-primary" />
                    </div>
                    <p className="text-sm text-gray-900">{profile.location}</p>
                  </div>
                )}
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Calendar className="h-4 w-4 text-primary" />
                  </div>
                  <p className="text-sm text-gray-900">Joined {joinDate}</p>
                </div>
                <p className="text-sm text-muted-foreground">@{profile.username}</p>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <FileText className="h-5 w-5 text-primary" />
                  About
                </CardTitle>
              </CardHeader>
              <CardContent>
                <BioDisplay bio={profile.bio} isOwnProfile={isOwnProfile} />
              </CardContent>
            </Card>

            {profile.professional_role === "auditor" && profile.auditor_services_summary && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg font-semibold text-gray-900">Audit services</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-700 whitespace-pre-wrap">{profile.auditor_services_summary}</p>
                </CardContent>
              </Card>
            )}

            {profile.professional_role === "auditor" && (
              <div className="client-only-component" suppressHydrationWarning>
                <AuditorReviewsSection auditorId={profile.id} />
              </div>
            )}

            <div className="client-only-component" suppressHydrationWarning>
              <SkillsEndorsementsSection userId={profile.id} isOwnProfile={isOwnProfile} />
            </div>

            <div className="client-only-component" suppressHydrationWarning>
              <ResumeCvSection
                userId={profile.id}
                isOwnProfile={isOwnProfile}
                cvUrl={profile.cv_url ?? null}
                cvVisibility={profile.cv_visibility ?? "private"}
                resumeParsed={profile.resume_parsed_json ?? null}
              />
            </div>

            <div className="client-only-component" suppressHydrationWarning>
              <ExperienceSection userId={profile.id} isOwnProfile={isOwnProfile} />
            </div>

            <div className="client-only-component" suppressHydrationWarning>
              <EducationSection userId={profile.id} isOwnProfile={isOwnProfile} />
            </div>

            <div className="client-only-component" suppressHydrationWarning>
              <ProjectsSection userId={profile.id} isOwnProfile={isOwnProfile} />
            </div>

            <div className="client-only-component" suppressHydrationWarning>
              <AchievementsSection userId={profile.id} isOwnProfile={isOwnProfile} />
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <Users className="h-5 w-5 text-primary" />
                  Recent activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="client-only-component" suppressHydrationWarning>
                  <UserActivity
                    userId={profile.id}
                    isOwnProfile={isOwnProfile}
                    currentUser={session?.user}
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
