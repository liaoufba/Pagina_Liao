-- CreateTable
CREATE TABLE "_EventToPartner" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_EventToPartner_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_EventToPartner_B_index" ON "_EventToPartner"("B");

-- AddForeignKey
ALTER TABLE "_EventToPartner" ADD CONSTRAINT "_EventToPartner_A_fkey" FOREIGN KEY ("A") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_EventToPartner" ADD CONSTRAINT "_EventToPartner_B_fkey" FOREIGN KEY ("B") REFERENCES "Partner"("id") ON DELETE CASCADE ON UPDATE CASCADE;
