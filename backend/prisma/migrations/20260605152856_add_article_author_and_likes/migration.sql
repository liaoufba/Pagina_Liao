-- AlterTable
ALTER TABLE "Article" ADD COLUMN     "authorId" INTEGER,
ADD COLUMN     "authorName" TEXT,
ADD COLUMN     "likes" INTEGER NOT NULL DEFAULT 0;

-- AddForeignKey
ALTER TABLE "Article" ADD CONSTRAINT "Article_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "Member"("id") ON DELETE SET NULL ON UPDATE CASCADE;
