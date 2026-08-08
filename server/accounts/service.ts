import { createHash, randomBytes } from "node:crypto";

import { registerAccountInputSchema, type AccountStatus, type RegisterAccountInput } from "@/lib/contracts";
import { hashPassword, verifyPassword } from "@/server/auth/passwords";

export type AccountRecord = {
  id: string;
  email: string;
  emailNormalized: string;
  displayName?: string;
  passwordHash: string;
  status: AccountStatus;
  emailVerifiedAt?: Date;
  activatedAt?: Date;
};

export type VerificationRecord = {
  accountId: string;
  tokenHash: string;
  expiresAt: Date;
  consumedAt?: Date;
};

export interface AccountStore {
  findByNormalizedEmail(email: string): Promise<AccountRecord | null>;
  findById(id: string): Promise<AccountRecord | null>;
  create(input: Omit<AccountRecord, "id">): Promise<AccountRecord>;
  updateStatus(accountId: string, status: AccountStatus, now: Date): Promise<AccountRecord>;
  saveVerification(record: VerificationRecord): Promise<void>;
  consumeVerification(tokenHash: string, now: Date): Promise<VerificationRecord | null>;
}

export type VerificationEmailSender = {
  sendVerification(input: { email: string; token: string }): Promise<void>;
};

export class AccountError extends Error {
  constructor(public readonly code: "duplicate_email" | "invalid_verification" | "inactive_account" | "invalid_credentials", message: string) {
    super(message);
  }
}

const normalizeEmail = (email: string) => email.trim().toLocaleLowerCase("en-US");
const hashToken = (token: string) => createHash("sha256").update(token).digest("hex");

export class AccountService {
  constructor(private readonly store: AccountStore, private readonly emailSender: VerificationEmailSender) {}

  async register(input: RegisterAccountInput | unknown): Promise<AccountRecord> {
    const data = registerAccountInputSchema.parse(input);
    const emailNormalized = normalizeEmail(data.email);
    if (await this.store.findByNormalizedEmail(emailNormalized)) {
      throw new AccountError("duplicate_email", "An account already exists for this email address.");
    }
    return this.store.create({
      email: data.email,
      emailNormalized,
      displayName: data.displayName,
      passwordHash: await hashPassword(data.password),
      status: "unverified",
    });
  }

  async issueVerification(account: AccountRecord, now = new Date()): Promise<void> {
    if (account.status === "active") return;
    const token = randomBytes(32).toString("base64url");
    await this.store.saveVerification({
      accountId: account.id,
      tokenHash: hashToken(token),
      expiresAt: new Date(now.getTime() + 24 * 60 * 60 * 1000),
    });
    await this.emailSender.sendVerification({ email: account.email, token });
  }

  async resendVerification(email: string): Promise<void> {
    const account = await this.store.findByNormalizedEmail(normalizeEmail(email));
    if (!account || account.status === "active" || account.status === "deactivated") return;
    await this.issueVerification(account);
  }

  async verifyAndActivate(token: string, now = new Date()): Promise<AccountRecord> {
    const verification = await this.store.consumeVerification(hashToken(token), now);
    // consumeVerification performs the expiry and single-use check atomically.
    if (!verification) {
      throw new AccountError("invalid_verification", "This verification link is invalid or has expired.");
    }
    const account = await this.store.findById(verification.accountId);
    if (!account || account.status === "deactivated") {
      throw new AccountError("invalid_verification", "This verification link is invalid or has expired.");
    }
    return account.status === "active" ? account : this.store.updateStatus(account.id, "active", now);
  }

  async authenticate(email: string, password: string): Promise<AccountRecord> {
    const account = await this.store.findByNormalizedEmail(normalizeEmail(email));
    if (!account || !(await verifyPassword(password, account.passwordHash))) {
      throw new AccountError("invalid_credentials", "Invalid email or password.");
    }
    if (account.status !== "active") {
      throw new AccountError("inactive_account", "Verify your email before signing in.");
    }
    return account;
  }
}
