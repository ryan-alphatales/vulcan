import { AccountStatus } from "@prisma/client";

import type { AccountRecord, AccountStore, VerificationRecord } from "@/server/accounts/service";
import { getPrisma } from "@/server/persistence/prisma";

const fromPrismaStatus: Record<AccountStatus, AccountRecord["status"]> = {
  UNVERIFIED: "unverified",
  VERIFIED: "verified",
  ACTIVE: "active",
  DEACTIVATED: "deactivated",
};
const toPrismaStatus: Record<AccountRecord["status"], AccountStatus> = {
  unverified: "UNVERIFIED",
  verified: "VERIFIED",
  active: "ACTIVE",
  deactivated: "DEACTIVATED",
};

function mapAccount(account: {
  id: string; email: string; emailNormalized: string; displayName: string | null; passwordHash: string;
  status: AccountStatus; emailVerifiedAt: Date | null; activatedAt: Date | null;
}): AccountRecord {
  return {
    id: account.id, email: account.email, emailNormalized: account.emailNormalized,
    displayName: account.displayName ?? undefined, passwordHash: account.passwordHash,
    status: fromPrismaStatus[account.status], emailVerifiedAt: account.emailVerifiedAt ?? undefined,
    activatedAt: account.activatedAt ?? undefined,
  };
}

export class PrismaAccountStore implements AccountStore {
  async findByNormalizedEmail(emailNormalized: string) {
    const account = await getPrisma().account.findUnique({ where: { emailNormalized } });
    return account ? mapAccount(account) : null;
  }

  async findById(id: string) {
    const account = await getPrisma().account.findUnique({ where: { id } });
    return account ? mapAccount(account) : null;
  }

  async create(input: Omit<AccountRecord, "id">) {
    return mapAccount(await getPrisma().account.create({
      data: { ...input, displayName: input.displayName ?? null, status: toPrismaStatus[input.status] },
    }));
  }

  async updateStatus(accountId: string, status: AccountRecord["status"], now: Date) {
    return mapAccount(await getPrisma().account.update({
      where: { id: accountId },
      data: {
        status: toPrismaStatus[status],
        ...(status === "active" ? { emailVerifiedAt: now, activatedAt: now } : {}),
      },
    }));
  }

  async saveVerification(record: VerificationRecord) {
    await getPrisma().verificationToken.create({ data: record });
  }

  async consumeVerification(tokenHash: string, now: Date): Promise<VerificationRecord | null> {
    return getPrisma().$transaction(async (transaction) => {
      const record = await transaction.verificationToken.findFirst({
        where: { tokenHash, consumedAt: null, expiresAt: { gt: now } },
      });
      if (!record) return null;
      const consumed = await transaction.verificationToken.updateMany({
        where: { id: record.id, consumedAt: null }, data: { consumedAt: now },
      });
      return consumed.count === 1 ? { accountId: record.accountId, tokenHash: record.tokenHash, expiresAt: record.expiresAt, consumedAt: now } : null;
    });
  }
}
