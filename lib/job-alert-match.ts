/** Pure matching for job_alerts rows (used by API). */

export type JobAlertRow = {
  user_id: string;
  keywords: string[] | null;
  location: string | null;
  employment_type: string | null;
  experience_level: string | null;
  industry: string | null;
  is_active: boolean | null;
};

export type JobRow = {
  id: string;
  title: string;
  description: string;
  company_name: string;
  location: string | null;
  employment_type: string | null;
  experience_level: string | null;
  industry: string | null;
  skills_required: string[] | null;
  job_category: string | null;
};

export function jobMatchesAlert(job: JobRow, alert: JobAlertRow): boolean {
  if (alert.is_active === false) return false;

  const skills = (job.skills_required || []).join(" ");
  const haystack = `${job.title} ${job.description} ${job.company_name} ${skills}`.toLowerCase();

  if (alert.keywords && alert.keywords.length > 0) {
    const hit = alert.keywords.some(
      (k) => k && haystack.includes(String(k).trim().toLowerCase())
    );
    if (!hit) return false;
  }

  if (alert.location?.trim() && job.location) {
    if (!job.location.toLowerCase().includes(alert.location.trim().toLowerCase())) {
      return false;
    }
  }

  if (alert.employment_type?.trim() && job.employment_type) {
    if (job.employment_type !== alert.employment_type) return false;
  }

  if (alert.experience_level?.trim() && job.experience_level) {
    if (job.experience_level !== alert.experience_level) return false;
  }

  if (alert.industry?.trim() && job.industry) {
    if (!job.industry.toLowerCase().includes(alert.industry.trim().toLowerCase())) {
      return false;
    }
  }

  return true;
}
