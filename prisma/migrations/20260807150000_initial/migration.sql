CREATE SCHEMA IF NOT EXISTS "public";

CREATE TYPE "AccountStatus" AS ENUM ('UNVERIFIED', 'VERIFIED', 'ACTIVE', 'DEACTIVATED');
CREATE TYPE "GitProvider" AS ENUM ('GITHUB', 'GITLAB');
CREATE TYPE "ConnectionStatus" AS ENUM ('PENDING', 'ACTIVE', 'FAILED');
CREATE TYPE "ScanStatus" AS ENUM ('QUEUED', 'RUNNING', 'COMPLETED', 'FAILED', 'SKIPPED');
CREATE TYPE "ScanFailureReason" AS ENUM ('REPOSITORY_ACCESS', 'PROVIDER', 'AI_SERVICE', 'TIMEOUT', 'INTERNAL');
CREATE TYPE "Severity" AS ENUM ('CRITICAL', 'HIGH', 'MEDIUM', 'LOW');
CREATE TYPE "TriageState" AS ENUM ('OPEN', 'FIXED', 'FALSE_POSITIVE');

CREATE TABLE "Account" ("id" TEXT NOT NULL, "email" TEXT NOT NULL, "emailNormalized" TEXT NOT NULL, "displayName" TEXT, "passwordHash" TEXT NOT NULL, "status" "AccountStatus" NOT NULL DEFAULT 'UNVERIFIED', "emailVerifiedAt" TIMESTAMP(3), "activatedAt" TIMESTAMP(3), "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMP(3) NOT NULL, CONSTRAINT "Account_pkey" PRIMARY KEY ("id"));
CREATE TABLE "VerificationToken" ("id" TEXT NOT NULL, "accountId" TEXT NOT NULL, "tokenHash" TEXT NOT NULL, "expiresAt" TIMESTAMP(3) NOT NULL, "consumedAt" TIMESTAMP(3), "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, CONSTRAINT "VerificationToken_pkey" PRIMARY KEY ("id"));
CREATE TABLE "ProviderAccount" ("id" TEXT NOT NULL, "accountId" TEXT NOT NULL, "provider" "GitProvider" NOT NULL, "providerAccountId" TEXT NOT NULL, "accessTokenEncrypted" TEXT NOT NULL, "scopes" TEXT[], "expiresAt" TIMESTAMP(3), "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMP(3) NOT NULL, CONSTRAINT "ProviderAccount_pkey" PRIMARY KEY ("id"));
CREATE TABLE "Repository" ("id" TEXT NOT NULL, "accountId" TEXT NOT NULL, "providerAccountId" TEXT NOT NULL, "provider" "GitProvider" NOT NULL, "externalId" TEXT NOT NULL, "owner" TEXT NOT NULL, "name" TEXT NOT NULL, "fullName" TEXT NOT NULL, "connectionStatus" "ConnectionStatus" NOT NULL DEFAULT 'PENDING', "connectedAt" TIMESTAMP(3), "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMP(3) NOT NULL, CONSTRAINT "Repository_pkey" PRIMARY KEY ("id"));
CREATE TABLE "Webhook" ("id" TEXT NOT NULL, "repositoryId" TEXT NOT NULL, "providerWebhookId" TEXT, "status" "ConnectionStatus" NOT NULL DEFAULT 'PENDING', "installedAt" TIMESTAMP(3), "failureReason" TEXT, "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMP(3) NOT NULL, CONSTRAINT "Webhook_pkey" PRIMARY KEY ("id"));
CREATE TABLE "WebhookDelivery" ("id" TEXT NOT NULL, "provider" "GitProvider" NOT NULL, "deliveryId" TEXT NOT NULL, "repositoryId" TEXT, "eventType" TEXT NOT NULL, "receivedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "processedAt" TIMESTAMP(3), CONSTRAINT "WebhookDelivery_pkey" PRIMARY KEY ("id"));
CREATE TABLE "ScanRun" ("id" TEXT NOT NULL, "accountId" TEXT NOT NULL, "repositoryId" TEXT NOT NULL, "providerPullRequestId" TEXT NOT NULL, "pullRequestNumber" INTEGER NOT NULL, "headSha" TEXT NOT NULL, "headBranch" TEXT, "status" "ScanStatus" NOT NULL DEFAULT 'QUEUED', "failureReason" "ScanFailureReason", "failureNoticePostedAt" TIMESTAMP(3), "resultNoticePostedAt" TIMESTAMP(3), "supersededAt" TIMESTAMP(3), "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "startedAt" TIMESTAMP(3), "completedAt" TIMESTAMP(3), CONSTRAINT "ScanRun_pkey" PRIMARY KEY ("id"));
CREATE TABLE "Finding" ("id" TEXT NOT NULL, "scanRunId" TEXT NOT NULL, "title" TEXT NOT NULL, "severity" "Severity" NOT NULL, "confidence" INTEGER NOT NULL, "explanation" TEXT NOT NULL, "suggestedFix" TEXT NOT NULL, "filePath" TEXT, "startLine" INTEGER, "endLine" INTEGER, "riskHighlights" TEXT[], "triageState" "TriageState" NOT NULL DEFAULT 'OPEN', "triagedAt" TIMESTAMP(3), "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, CONSTRAINT "Finding_pkey" PRIMARY KEY ("id"));
CREATE TABLE "AuditEvent" ("id" TEXT NOT NULL, "accountId" TEXT, "category" TEXT NOT NULL, "action" TEXT NOT NULL, "metadata" JSONB, "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, CONSTRAINT "AuditEvent_pkey" PRIMARY KEY ("id"));

CREATE UNIQUE INDEX "Account_emailNormalized_key" ON "Account"("emailNormalized");
CREATE UNIQUE INDEX "VerificationToken_tokenHash_key" ON "VerificationToken"("tokenHash");
CREATE UNIQUE INDEX "ProviderAccount_accountId_provider_providerAccountId_key" ON "ProviderAccount"("accountId", "provider", "providerAccountId");
CREATE INDEX "Repository_accountId_connectionStatus_idx" ON "Repository"("accountId", "connectionStatus");
CREATE UNIQUE INDEX "Repository_provider_externalId_key" ON "Repository"("provider", "externalId");
CREATE UNIQUE INDEX "Webhook_repositoryId_key" ON "Webhook"("repositoryId");
CREATE UNIQUE INDEX "WebhookDelivery_provider_deliveryId_key" ON "WebhookDelivery"("provider", "deliveryId");
CREATE INDEX "ScanRun_repositoryId_providerPullRequestId_status_idx" ON "ScanRun"("repositoryId", "providerPullRequestId", "status");
CREATE INDEX "ScanRun_accountId_createdAt_idx" ON "ScanRun"("accountId", "createdAt");
CREATE INDEX "Finding_scanRunId_triageState_idx" ON "Finding"("scanRunId", "triageState");
CREATE INDEX "AuditEvent_accountId_createdAt_idx" ON "AuditEvent"("accountId", "createdAt");

ALTER TABLE "VerificationToken" ADD CONSTRAINT "VerificationToken_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ProviderAccount" ADD CONSTRAINT "ProviderAccount_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Repository" ADD CONSTRAINT "Repository_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Repository" ADD CONSTRAINT "Repository_providerAccountId_fkey" FOREIGN KEY ("providerAccountId") REFERENCES "ProviderAccount"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Webhook" ADD CONSTRAINT "Webhook_repositoryId_fkey" FOREIGN KEY ("repositoryId") REFERENCES "Repository"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ScanRun" ADD CONSTRAINT "ScanRun_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ScanRun" ADD CONSTRAINT "ScanRun_repositoryId_fkey" FOREIGN KEY ("repositoryId") REFERENCES "Repository"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Finding" ADD CONSTRAINT "Finding_scanRunId_fkey" FOREIGN KEY ("scanRunId") REFERENCES "ScanRun"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "AuditEvent" ADD CONSTRAINT "AuditEvent_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account"("id") ON DELETE SET NULL ON UPDATE CASCADE;
