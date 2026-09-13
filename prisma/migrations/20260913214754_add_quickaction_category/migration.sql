-- AddForeignKey
ALTER TABLE "QuickAction" ADD CONSTRAINT "QuickAction_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
