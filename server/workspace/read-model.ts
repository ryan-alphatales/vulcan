import { getPrisma } from "@/server/persistence/prisma";

export async function getWorkspace(accountId: string) {
  const prisma = getPrisma();
  const [repositories, scans, pendingFindings] = await Promise.all([
    prisma.repository.findMany({ where: { accountId, connectionStatus: "ACTIVE" }, orderBy: { updatedAt: "desc" }, select: { id: true, fullName: true, connectedAt: true } }),
    prisma.scanRun.findMany({ where: { accountId }, orderBy: { createdAt: "desc" }, take: 10, select: { id: true, headBranch: true, status: true, createdAt: true, repository: { select: { fullName: true } }, _count: { select: { findings: true } } } }),
    prisma.finding.findMany({ where: { scanRun: { accountId }, triageState: "OPEN" }, orderBy: { createdAt: "desc" }, take: 10, select: { id: true, title: true, severity: true, confidence: true, scanRun: { select: { repository: { select: { fullName: true } } } } } }),
  ]);
  return { repositories, scans, pendingFindings };
}
