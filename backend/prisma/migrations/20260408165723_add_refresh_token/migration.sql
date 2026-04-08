-- AlterTable
ALTER TABLE "_KitAssignees" ADD CONSTRAINT "_KitAssignees_AB_pkey" PRIMARY KEY ("A", "B");

-- DropIndex
DROP INDEX "_KitAssignees_AB_unique";

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "refreshTokenHash" TEXT;
