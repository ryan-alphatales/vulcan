DROP INDEX "Repository_provider_externalId_key";
CREATE UNIQUE INDEX "Repository_accountId_provider_externalId_key" ON "Repository"("accountId", "provider", "externalId");
