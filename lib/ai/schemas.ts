import { z } from "zod";

/** Structured resume parse stored in `profiles.resume_parsed_json`. */
export const resumeParseSchema = z.object({
  summary: z.string().optional(),
  suggested_headline: z.string().nullable(),
  suggested_skills: z.array(z.string()),
  experience: z
    .array(
      z.object({
        title: z.string(),
        company: z.string().optional(),
        duration: z.string().optional(),
        highlights: z.array(z.string()).optional(),
      })
    )
    .optional(),
  education: z
    .array(
      z.object({
        degree: z.string().optional(),
        institution: z.string().optional(),
        year: z.string().optional(),
      })
    )
    .optional(),
  certifications: z.array(z.string()).optional(),
  years_experience_estimate: z.number().nullable().optional(),
});

export type ResumeParseOutput = z.infer<typeof resumeParseSchema>;

const knowledgeCategoryValues = [
  "risk-assessment",
  "safety-plan",
  "compliance",
  "audit",
  "fire-safety",
  "environment",
  "template",
  "infographic",
  "guide",
  "training",
  "other",
] as const;

export const categorizeDocumentSchema = z.object({
  primary_category: z.enum(knowledgeCategoryValues),
  secondary_tags: z.array(z.string()).max(8),
  confidence: z.enum(["low", "medium", "high"]),
  rationale: z.string().max(600),
});

export type CategorizeDocumentOutput = z.infer<typeof categorizeDocumentSchema>;

export const riskPredictionSchema = z.object({
  predicted_risk_band: z.enum(["low", "medium", "high", "critical"]),
  contributing_factors: z.array(z.string()).max(8),
  suggested_controls: z.array(z.string()).max(8),
  disclaimer: z.string().max(400),
});

export type RiskPredictionOutput = z.infer<typeof riskPredictionSchema>;
