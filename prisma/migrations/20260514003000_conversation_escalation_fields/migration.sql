-- Tier A: escalation triage fields (per-tenant Conversation rows)
ALTER TABLE "Conversation" ADD COLUMN "escalatedReason" TEXT;
ALTER TABLE "Conversation" ADD COLUMN "escalatedCallback" TEXT;
