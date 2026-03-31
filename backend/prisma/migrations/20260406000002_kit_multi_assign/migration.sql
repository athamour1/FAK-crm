-- DropForeignKey
ALTER TABLE "kits" DROP CONSTRAINT IF EXISTS "kits_assignedToId_fkey";

-- DropColumn
ALTER TABLE "kits" DROP COLUMN IF EXISTS "assignedToId";

-- CreateTable: implicit M2M join table for Kit <-> User assignees
CREATE TABLE "_KitAssignees" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,
    CONSTRAINT "_KitAssignees_A_fkey" FOREIGN KEY ("A") REFERENCES "kits"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "_KitAssignees_B_fkey" FOREIGN KEY ("B") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE UNIQUE INDEX "_KitAssignees_AB_unique" ON "_KitAssignees"("A", "B");
CREATE INDEX "_KitAssignees_B_index" ON "_KitAssignees"("B");
