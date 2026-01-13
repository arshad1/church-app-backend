-- DropForeignKey
ALTER TABLE "GalleryAlbum" DROP CONSTRAINT "GalleryAlbum_categoryId_fkey";

-- AddForeignKey
ALTER TABLE "GalleryAlbum" ADD CONSTRAINT "GalleryAlbum_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "GalleryCategory"("id") ON DELETE CASCADE ON UPDATE CASCADE;
