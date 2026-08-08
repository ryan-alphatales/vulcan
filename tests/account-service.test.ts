import { describe, expect, it } from "vitest";

import { AccountError, AccountService, type AccountRecord, type AccountStore, type VerificationRecord } from "../server/accounts/service";

function createStore(): AccountStore & { accounts: AccountRecord[]; tokens: VerificationRecord[] } {
  const accounts: AccountRecord[] = [];
  const tokens: VerificationRecord[] = [];
  return {
    accounts, tokens,
    async findByNormalizedEmail(email) { return accounts.find((account) => account.emailNormalized === email) ?? null; },
    async findById(id) { return accounts.find((account) => account.id === id) ?? null; },
    async create(input) { const account = { id: `account_${accounts.length + 1}`, ...input }; accounts.push(account); return account; },
    async updateStatus(id, status, now) {
      const account = accounts.find((item) => item.id === id)!;
      account.status = status; account.emailVerifiedAt = now; account.activatedAt = now; return account;
    },
    async saveVerification(record) { tokens.push(record); },
    async consumeVerification(tokenHash, now) {
      const record = tokens.find((item) => item.tokenHash === tokenHash && !item.consumedAt && item.expiresAt > now);
      if (!record) return null; record.consumedAt = now; return record;
    },
  };
}

describe("account activation", () => {
  it("keeps a new account unverified and rejects its credentials", async () => {
    const store = createStore();
    const service = new AccountService(store, { sendVerification: async () => undefined });
    const account = await service.register({ email: "Dev@Example.com", password: "secure-password" });
    expect(account).toMatchObject({ email: "Dev@Example.com", emailNormalized: "dev@example.com", status: "unverified" });
    await expect(service.authenticate("dev@example.com", "secure-password")).rejects.toMatchObject({ code: "inactive_account" });
  });

  it("prevents case-insensitive duplicate account creation", async () => {
    const service = new AccountService(createStore(), { sendVerification: async () => undefined });
    await service.register({ email: "Dev@Example.com", password: "secure-password" });
    await expect(service.register({ email: "dev@example.com", password: "secure-password" })).rejects.toBeInstanceOf(AccountError);
  });

  it("activates only after a valid verification token is consumed", async () => {
    const store = createStore();
    let deliveredToken = "";
    const service = new AccountService(store, { sendVerification: async ({ token }) => { deliveredToken = token; } });
    const account = await service.register({ email: "dev@example.com", password: "secure-password" });
    await service.issueVerification(account, new Date("2026-01-01T00:00:00Z"));
    await expect(service.verifyAndActivate(deliveredToken, new Date("2026-01-01T01:00:00Z"))).resolves.toMatchObject({ status: "active" });
    await expect(service.authenticate("dev@example.com", "secure-password")).resolves.toMatchObject({ id: account.id });
    await expect(service.verifyAndActivate(deliveredToken, new Date("2026-01-01T02:00:00Z"))).rejects.toMatchObject({ code: "invalid_verification" });
  });

  it("allows a new verification attempt without activating the account", async () => {
    const store = createStore(); let sent = 0;
    const service = new AccountService(store, { sendVerification: async () => { sent += 1; } });
    await service.register({ email: "dev@example.com", password: "secure-password" });
    await service.resendVerification("dev@example.com");
    expect(sent).toBe(1); expect(store.accounts[0].status).toBe("unverified");
  });
});
