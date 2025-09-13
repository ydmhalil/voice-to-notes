-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Note" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "transcript" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "keyPoints" TEXT NOT NULL DEFAULT '',
    "questions" TEXT NOT NULL DEFAULT '',
    "actionItems" TEXT,
    "tags" TEXT NOT NULL,
    "folder" TEXT,
    "starred" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT NOT NULL,
    "publicShareId" TEXT,
    "sharedWith" TEXT,
    CONSTRAINT "Note_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Note" ("createdAt", "folder", "id", "publicShareId", "sharedWith", "starred", "summary", "tags", "transcript", "userId") SELECT "createdAt", "folder", "id", "publicShareId", "sharedWith", "starred", "summary", "tags", "transcript", "userId" FROM "Note";
DROP TABLE "Note";
ALTER TABLE "new_Note" RENAME TO "Note";
CREATE UNIQUE INDEX "Note_publicShareId_key" ON "Note"("publicShareId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
