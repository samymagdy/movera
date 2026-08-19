-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateTable
CREATE TABLE "ContentDocument" (
    "id" TEXT NOT NULL,
    "kind" TEXT NOT NULL,
    "payload" TEXT NOT NULL,
    "createdAt" TEXT NOT NULL,
    "updatedAt" TEXT NOT NULL,

    CONSTRAINT "ContentDocument_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MediaAsset" (
    "id" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "alt" TEXT NOT NULL,
    "caption" TEXT,
    "credit" TEXT,
    "focalX" DOUBLE PRECISION NOT NULL DEFAULT 50,
    "focalY" DOUBLE PRECISION NOT NULL DEFAULT 50,
    "zoom" DOUBLE PRECISION NOT NULL DEFAULT 1,
    "createdAt" TEXT NOT NULL,
    "updatedAt" TEXT NOT NULL,

    CONSTRAINT "MediaAsset_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ContactSubmission" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "company" TEXT,
    "subject" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "locale" TEXT NOT NULL,
    "privacyAt" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'new',
    "createdAt" TEXT NOT NULL,

    CONSTRAINT "ContactSubmission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NewsletterSubmission" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "locale" TEXT NOT NULL,
    "consentAt" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "createdAt" TEXT NOT NULL,

    CONSTRAINT "NewsletterSubmission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CareerApplication" (
    "id" TEXT NOT NULL,
    "jobId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "coverNote" TEXT NOT NULL,
    "cvPath" TEXT NOT NULL,
    "cvName" TEXT NOT NULL,
    "locale" TEXT NOT NULL,
    "createdAt" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'new',

    CONSTRAINT "CareerApplication_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AdminUser" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'Viewer',
    "active" BOOLEAN NOT NULL DEFAULT true,
    "forcePasswordReset" BOOLEAN NOT NULL DEFAULT false,
    "lastLoginAt" TEXT,
    "createdAt" TEXT NOT NULL,
    "updatedAt" TEXT NOT NULL,

    CONSTRAINT "AdminUser_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AdminSession" (
    "id" TEXT NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expiresAt" TEXT NOT NULL,
    "createdAt" TEXT NOT NULL,

    CONSTRAINT "AdminSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AdminAuditEvent" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "entity" TEXT NOT NULL,
    "entityId" TEXT,
    "metadata" TEXT,
    "createdAt" TEXT NOT NULL,

    CONSTRAINT "AdminAuditEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AdminIdentitySettings" (
    "id" TEXT NOT NULL,
    "localEnabled" BOOLEAN NOT NULL DEFAULT true,
    "entraEnabled" BOOLEAN NOT NULL DEFAULT false,
    "updatedAt" TEXT NOT NULL,

    CONSTRAINT "AdminIdentitySettings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AdminExternalIdentity" (
    "id" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'Viewer',
    "enabled" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TEXT NOT NULL,
    "updatedAt" TEXT NOT NULL,

    CONSTRAINT "AdminExternalIdentity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AdminIntegrationSettings" (
    "id" TEXT NOT NULL,
    "smtpHost" TEXT,
    "smtpPort" INTEGER,
    "smtpSecure" BOOLEAN NOT NULL DEFAULT true,
    "smtpUsername" TEXT,
    "smtpSenderName" TEXT,
    "smtpSenderEmail" TEXT,
    "smtpTestRecipient" TEXT,
    "smtpPasswordHash" TEXT,
    "smtpPasswordCiphertext" TEXT,
    "newsletterEnabled" BOOLEAN NOT NULL DEFAULT false,
    "newsletterProvider" TEXT,
    "newsletterEndpoint" TEXT,
    "newsletterListId" TEXT,
    "newsletterApiKeyHash" TEXT,
    "newsletterApiKeyCiphertext" TEXT,
    "recaptchaEnabled" BOOLEAN NOT NULL DEFAULT false,
    "recaptchaSiteKey" TEXT,
    "recaptchaSecretHash" TEXT,
    "recaptchaSecretCiphertext" TEXT,
    "recaptchaProtectedPaths" TEXT,
    "redisEnabled" BOOLEAN NOT NULL DEFAULT false,
    "redisUrl" TEXT,
    "redisUsername" TEXT,
    "redisDatabase" INTEGER,
    "redisPasswordHash" TEXT,
    "redisPasswordCiphertext" TEXT,
    "updatedAt" TEXT NOT NULL,

    CONSTRAINT "AdminIntegrationSettings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ContentDocument_kind_key" ON "ContentDocument"("kind");

-- CreateIndex
CREATE INDEX "ContentDocument_kind_idx" ON "ContentDocument"("kind");

-- CreateIndex
CREATE INDEX "ContactSubmission_createdAt_idx" ON "ContactSubmission"("createdAt");

-- CreateIndex
CREATE INDEX "ContactSubmission_status_idx" ON "ContactSubmission"("status");

-- CreateIndex
CREATE INDEX "NewsletterSubmission_createdAt_idx" ON "NewsletterSubmission"("createdAt");

-- CreateIndex
CREATE INDEX "CareerApplication_jobId_idx" ON "CareerApplication"("jobId");

-- CreateIndex
CREATE INDEX "CareerApplication_createdAt_idx" ON "CareerApplication"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "AdminUser_email_key" ON "AdminUser"("email");

-- CreateIndex
CREATE INDEX "AdminUser_role_idx" ON "AdminUser"("role");

-- CreateIndex
CREATE INDEX "AdminUser_active_idx" ON "AdminUser"("active");

-- CreateIndex
CREATE UNIQUE INDEX "AdminSession_tokenHash_key" ON "AdminSession"("tokenHash");

-- CreateIndex
CREATE INDEX "AdminSession_userId_idx" ON "AdminSession"("userId");

-- CreateIndex
CREATE INDEX "AdminSession_expiresAt_idx" ON "AdminSession"("expiresAt");

-- CreateIndex
CREATE INDEX "AdminAuditEvent_userId_createdAt_idx" ON "AdminAuditEvent"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "AdminAuditEvent_entity_entityId_idx" ON "AdminAuditEvent"("entity", "entityId");

-- CreateIndex
CREATE INDEX "AdminExternalIdentity_email_idx" ON "AdminExternalIdentity"("email");

-- CreateIndex
CREATE UNIQUE INDEX "AdminExternalIdentity_provider_providerId_key" ON "AdminExternalIdentity"("provider", "providerId");

-- AddForeignKey
ALTER TABLE "AdminSession" ADD CONSTRAINT "AdminSession_userId_fkey" FOREIGN KEY ("userId") REFERENCES "AdminUser"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AdminAuditEvent" ADD CONSTRAINT "AdminAuditEvent_userId_fkey" FOREIGN KEY ("userId") REFERENCES "AdminUser"("id") ON DELETE CASCADE ON UPDATE CASCADE;
