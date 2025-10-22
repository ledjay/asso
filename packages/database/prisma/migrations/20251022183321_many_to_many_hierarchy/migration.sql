/*
  Warnings:

  - You are about to drop the column `groupId` on the `Member` table. All the data in the column will be lost.
  - You are about to drop the column `roleId` on the `Member` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."Member" DROP CONSTRAINT "Member_groupId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Member" DROP CONSTRAINT "Member_roleId_fkey";

-- DropIndex
DROP INDEX "public"."Member_groupId_idx";

-- DropIndex
DROP INDEX "public"."Member_roleId_idx";

-- AlterTable
ALTER TABLE "GroupType" ADD COLUMN     "parentId" TEXT;

-- AlterTable
ALTER TABLE "Member" DROP COLUMN "groupId",
DROP COLUMN "roleId";

-- CreateTable
CREATE TABLE "MemberRole" (
    "id" TEXT NOT NULL,
    "memberId" TEXT NOT NULL,
    "roleId" TEXT NOT NULL,
    "assignedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MemberRole_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MemberGroup" (
    "id" TEXT NOT NULL,
    "memberId" TEXT NOT NULL,
    "groupId" TEXT NOT NULL,
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MemberGroup_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "MemberRole_memberId_idx" ON "MemberRole"("memberId");

-- CreateIndex
CREATE INDEX "MemberRole_roleId_idx" ON "MemberRole"("roleId");

-- CreateIndex
CREATE UNIQUE INDEX "MemberRole_memberId_roleId_key" ON "MemberRole"("memberId", "roleId");

-- CreateIndex
CREATE INDEX "MemberGroup_memberId_idx" ON "MemberGroup"("memberId");

-- CreateIndex
CREATE INDEX "MemberGroup_groupId_idx" ON "MemberGroup"("groupId");

-- CreateIndex
CREATE UNIQUE INDEX "MemberGroup_memberId_groupId_key" ON "MemberGroup"("memberId", "groupId");

-- CreateIndex
CREATE INDEX "GroupType_parentId_idx" ON "GroupType"("parentId");

-- AddForeignKey
ALTER TABLE "GroupType" ADD CONSTRAINT "GroupType_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "GroupType"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MemberRole" ADD CONSTRAINT "MemberRole_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "Member"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MemberRole" ADD CONSTRAINT "MemberRole_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "Role"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MemberGroup" ADD CONSTRAINT "MemberGroup_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "Member"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MemberGroup" ADD CONSTRAINT "MemberGroup_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "GroupType"("id") ON DELETE CASCADE ON UPDATE CASCADE;
