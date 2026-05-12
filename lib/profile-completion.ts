/** Heuristic profile completion for LinkedIn-style dashboard (0–100). */

export type ProfileLike = {
  avatar_url?: string | null;
  cover_image_url?: string | null;
  headline?: string | null;
  bio?: string | null;
  full_name?: string | null;
  company?: string | null;
  position?: string | null;
  location?: string | null;
  cv_url?: string | null;
};

export type ProfileSectionCounts = {
  experience: number;
  education: number;
  skills: number;
  projects: number;
  achievements: number;
};

const has = (v: string | null | undefined) =>
  typeof v === "string" && v.trim().length > 0;

export function computeProfileCompletion(
  profile: ProfileLike,
  counts: ProfileSectionCounts
): number {
  let score = 0;
  const step = 100 / 12;

  if (has(profile.full_name)) score += step;
  if (has(profile.headline)) score += step;
  if (has(profile.bio) && (profile.bio?.length ?? 0) >= 30) score += step;
  if (has(profile.avatar_url)) score += step;
  if (has(profile.cover_image_url)) score += step;
  if (has(profile.company) && has(profile.position)) score += step;
  if (has(profile.location)) score += step;
  if (has(profile.cv_url)) score += step;

  if (counts.experience > 0) score += step;
  if (counts.education > 0) score += step;
  if (counts.skills > 0) score += step;
  if (counts.projects > 0 || counts.achievements > 0) score += step;

  return Math.min(100, Math.round(score));
}
