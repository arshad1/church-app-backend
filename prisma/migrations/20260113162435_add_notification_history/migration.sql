-- CreateTable
CREATE TABLE "NotificationHistory" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'BROADCAST',
    "data" TEXT,
    "sentAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "sentBy" INTEGER,

    CONSTRAINT "NotificationHistory_pkey" PRIMARY KEY ("id")
);
