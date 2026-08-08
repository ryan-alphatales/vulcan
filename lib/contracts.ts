import { z } from "zod";

export const gitProviderSchema = z.enum(["github", "gitlab"]);
export type GitProvider = z.infer<typeof gitProviderSchema>;

export const accountStatusSchema = z.enum(["unverified", "verified", "active", "deactivated"]);
export type AccountStatus = z.infer<typeof accountStatusSchema>;

export const scanStatusSchema = z.enum(["queued", "running", "completed", "failed", "skipped"]);
export type ScanStatus = z.infer<typeof scanStatusSchema>;

export const triageStateSchema = z.enum(["open", "fixed", "false_positive"]);
export type TriageState = z.infer<typeof triageStateSchema>;

export const severitySchema = z.enum(["critical", "high", "medium", "low"]);
export type Severity = z.infer<typeof severitySchema>;

export const registerAccountInputSchema = z.object({
  email: z.string().trim().email().max(320),
  password: z.string().min(12).max(256),
  displayName: z.string().trim().min(1).max(120).optional(),
});
export type RegisterAccountInput = z.infer<typeof registerAccountInputSchema>;

export const pullRequestEventSchema = z.object({
  provider: gitProviderSchema,
  deliveryId: z.string().trim().min(1).max(255),
  repositoryExternalId: z.string().trim().min(1).max(255),
  pullRequestExternalId: z.string().trim().min(1).max(255),
  pullRequestNumber: z.number().int().positive(),
  headSha: z.string().trim().min(1).max(255),
  headBranch: z.string().trim().min(1).max(255),
  action: z.enum(["opened", "synchronize"]),
});
export type PullRequestEvent = z.infer<typeof pullRequestEventSchema>;

export const manualScanInputSchema = z.object({
  repositoryId: z.string().trim().min(1).max(255),
  pullRequestNumber: z.coerce.number().int().positive().max(10_000_000),
});
export type ManualScanInput = z.infer<typeof manualScanInputSchema>;

export const findingTriageInputSchema = z.object({
  state: triageStateSchema,
  confirmation: z.boolean(),
});
