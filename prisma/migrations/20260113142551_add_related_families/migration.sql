-- CreateTable
CREATE TABLE "_FamilyRelations" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_FamilyRelations_AB_unique" ON "_FamilyRelations"("A", "B");

-- CreateIndex
CREATE INDEX "_FamilyRelations_B_index" ON "_FamilyRelations"("B");

-- AddForeignKey
ALTER TABLE "_FamilyRelations" ADD CONSTRAINT "_FamilyRelations_A_fkey" FOREIGN KEY ("A") REFERENCES "Family"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_FamilyRelations" ADD CONSTRAINT "_FamilyRelations_B_fkey" FOREIGN KEY ("B") REFERENCES "Family"("id") ON DELETE CASCADE ON UPDATE CASCADE;
