/*
  Warnings:

  - You are about to drop the column `userId` on the `MinistryMember` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `PrayerRequest` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `Registration` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `Sacrament` table. All the data in the column will be lost.
  - You are about to drop the column `familyId` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `headOfFamily` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `phone` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `status` on the `User` table. All the data in the column will be lost.
  - Added the required column `memberId` to the `MinistryMember` table without a default value. This is not possible if the table is not empty.
  - Added the required column `memberId` to the `PrayerRequest` table without a default value. This is not possible if the table is not empty.
  - Added the required column `memberId` to the `Registration` table without a default value. This is not possible if the table is not empty.
  - Added the required column `memberId` to the `Sacrament` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Ministry" ADD COLUMN "meetingSchedule" TEXT;

-- CreateTable
CREATE TABLE "Member" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "email" TEXT,
    "phone" TEXT,
    "profileImage" TEXT,
    "familyRole" TEXT,
    "headOfFamily" BOOLEAN NOT NULL DEFAULT false,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "familyId" INTEGER,
    CONSTRAINT "Member_familyId_fkey" FOREIGN KEY ("familyId") REFERENCES "Family" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Event" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "type" TEXT NOT NULL DEFAULT 'EVENT',
    "date" DATETIME NOT NULL,
    "location" TEXT,
    "isLive" BOOLEAN NOT NULL DEFAULT false,
    "liveUrl" TEXT,
    "status" TEXT NOT NULL DEFAULT 'DRAFT'
);
INSERT INTO "new_Event" ("date", "description", "id", "location", "title", "type") SELECT "date", "description", "id", "location", "title", "type" FROM "Event";
DROP TABLE "Event";
ALTER TABLE "new_Event" RENAME TO "Event";
CREATE TABLE "new_MinistryMember" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "ministryId" INTEGER NOT NULL,
    "memberId" INTEGER NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'MEMBER',
    CONSTRAINT "MinistryMember_ministryId_fkey" FOREIGN KEY ("ministryId") REFERENCES "Ministry" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "MinistryMember_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "Member" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_MinistryMember" ("id", "ministryId", "role") SELECT "id", "ministryId", "role" FROM "MinistryMember";
DROP TABLE "MinistryMember";
ALTER TABLE "new_MinistryMember" RENAME TO "MinistryMember";
CREATE TABLE "new_PrayerRequest" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "memberId" INTEGER NOT NULL,
    "request" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "PrayerRequest_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "Member" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_PrayerRequest" ("createdAt", "id", "request", "status") SELECT "createdAt", "id", "request", "status" FROM "PrayerRequest";
DROP TABLE "PrayerRequest";
ALTER TABLE "new_PrayerRequest" RENAME TO "PrayerRequest";
CREATE TABLE "new_Registration" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "eventId" INTEGER NOT NULL,
    "memberId" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'REGISTERED',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Registration_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Registration_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "Member" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Registration" ("createdAt", "eventId", "id", "status") SELECT "createdAt", "eventId", "id", "status" FROM "Registration";
DROP TABLE "Registration";
ALTER TABLE "new_Registration" RENAME TO "Registration";
CREATE TABLE "new_Sacrament" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "type" TEXT NOT NULL,
    "date" DATETIME NOT NULL,
    "details" TEXT,
    "memberId" INTEGER NOT NULL,
    CONSTRAINT "Sacrament_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "Member" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Sacrament" ("date", "details", "id", "type") SELECT "date", "details", "id", "type" FROM "Sacrament";
DROP TABLE "Sacrament";
ALTER TABLE "new_Sacrament" RENAME TO "Sacrament";
CREATE TABLE "new_User" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'MEMBER',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "memberId" INTEGER,
    CONSTRAINT "User_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "Member" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_User" ("createdAt", "email", "id", "password", "role", "updatedAt") SELECT "createdAt", "email", "id", "password", "role", "updatedAt" FROM "User";
DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
CREATE UNIQUE INDEX "User_memberId_key" ON "User"("memberId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
