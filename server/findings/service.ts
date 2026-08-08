import { TriageState } from "@prisma/client";

import type { TriageState as Triage } from "@/lib/contracts";
import { getPrisma } from "@/server/persistence/prisma";

const states: Record<Triage, TriageState> = { open: "OPEN", fixed: "FIXED", false_positive: "FALSE_POSITIVE" };

export async function listScanHistory(accountId: string) {
  return getPrisma().scanRun.findMany({ where: { accountId }, orderBy: { createdAt: "desc" }, select: { id: true, headBranch: true, status: true, createdAt: true, completedAt: true, repository: { select: { fullName: true } }, _count: { select: { findings: true } } } });
}

export async function getScanForAccount(accountId: string, scanRunId: string) {
  return getPrisma().scanRun.findFirst({ where: { id: scanRunId, accountId }, select: { id: true, status: true, headBranch: true, createdAt: true, repository: { select: { fullName: true } }, findings: { orderBy: [{ severity: "asc" }, { confidence: "desc" }], select: { id: true, title: true, severity: true, confidence: true, explanation: true, suggestedFix: true, filePath: true, startLine: true, endLine: true, riskHighlights: true, triageState: true } } } });
}

export async function updateFindingTriage(accountId: string, findingId: string, state: Triage) {
  const finding = await getPrisma().finding.findFirst({ where: { id: findingId, scanRun: { accountId } }, select: { id: true } });
  if (!finding) return null;
  return getPrisma().$transaction(async (transaction) => {
    const updated = await transaction.finding.update({ where: { id: finding.id }, data: { triageState: states[state], triagedAt: new Date() } });
    await transaction.auditEvent.create({ data: { accountId, category: "finding", action: "triage_updated", metadata: { findingId: finding.id, state } } });
    return updated;
  });
}
