BEGIN;

-- Legacy owners were MongoDB users. Populated databases need an explicit owner-to-organization backfill.
LOCK TABLE "Category", "Supplier", "Item", "Transaction", "Purchase", "Sale" IN ACCESS EXCLUSIVE MODE;

DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM "Category")
        OR EXISTS (SELECT 1 FROM "Supplier")
        OR EXISTS (SELECT 1 FROM "Item")
        OR EXISTS (SELECT 1 FROM "Transaction")
        OR EXISTS (SELECT 1 FROM "Purchase")
        OR EXISTS (SELECT 1 FROM "Sale") THEN
        RAISE EXCEPTION 'Legacy inventory rows require an explicit owner-to-organization backfill before this migration.';
    END IF;
END;
$$;

CREATE TABLE "Organization" (
    "id" TEXT NOT NULL,
    "organizationName" TEXT NOT NULL,
    "createdBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Organization_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Invitation" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "invitedById" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Invitation_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "Category" RENAME COLUMN "ownerId" TO "organizationId";
ALTER TABLE "Supplier" RENAME COLUMN "ownerId" TO "organizationId";
ALTER TABLE "Item" RENAME COLUMN "ownerId" TO "organizationId";
ALTER TABLE "Transaction" RENAME COLUMN "ownerId" TO "organizationId";
ALTER TABLE "Purchase" RENAME COLUMN "ownerId" TO "organizationId";
ALTER TABLE "Sale" RENAME COLUMN "ownerId" TO "organizationId";

ALTER TABLE "Item"
    ADD COLUMN "reorderLevel" INTEGER NOT NULL DEFAULT 10,
    ADD COLUMN "createdBy" TEXT;

ALTER INDEX "Category_ownerId_idx" RENAME TO "Category_organizationId_idx";
ALTER INDEX "Category_ownerId_name_key" RENAME TO "Category_organizationId_name_key";
ALTER INDEX "Supplier_ownerId_idx" RENAME TO "Supplier_organizationId_idx";
ALTER INDEX "Item_ownerId_idx" RENAME TO "Item_organizationId_idx";
ALTER INDEX "Transaction_ownerId_idx" RENAME TO "Transaction_organizationId_idx";
ALTER INDEX "Purchase_ownerId_idx" RENAME TO "Purchase_organizationId_idx";
ALTER INDEX "Sale_ownerId_idx" RENAME TO "Sale_organizationId_idx";

CREATE UNIQUE INDEX "Organization_organizationName_key" ON "Organization"("organizationName");
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
CREATE INDEX "User_organizationId_idx" ON "User"("organizationId");
CREATE INDEX "Invitation_organizationId_idx" ON "Invitation"("organizationId");
CREATE INDEX "Invitation_email_idx" ON "Invitation"("email");

ALTER TABLE "User" ADD CONSTRAINT "User_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Invitation" ADD CONSTRAINT "Invitation_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Invitation" ADD CONSTRAINT "Invitation_invitedById_fkey" FOREIGN KEY ("invitedById") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Category" ADD CONSTRAINT "Category_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Supplier" ADD CONSTRAINT "Supplier_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Item" ADD CONSTRAINT "Item_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Purchase" ADD CONSTRAINT "Purchase_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Sale" ADD CONSTRAINT "Sale_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

COMMIT;
