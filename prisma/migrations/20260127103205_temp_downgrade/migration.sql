-- AlterTable
ALTER TABLE `Announcement` MODIFY `content` VARCHAR(191) NOT NULL;

-- AlterTable
ALTER TABLE `ChurchSettings` MODIFY `description` VARCHAR(191) NULL,
    MODIFY `locationMapUrl` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `Content` MODIFY `body` VARCHAR(191) NULL,
    MODIFY `mediaUrl` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `Event` MODIFY `description` VARCHAR(191) NULL,
    MODIFY `liveUrl` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `GalleryAlbum` MODIFY `description` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `GalleryImage` MODIFY `url` VARCHAR(191) NOT NULL,
    MODIFY `caption` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `Ministry` MODIFY `description` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `Notification` MODIFY `body` VARCHAR(191) NOT NULL,
    MODIFY `data` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `NotificationHistory` MODIFY `body` VARCHAR(191) NOT NULL,
    MODIFY `data` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `PrayerRequest` MODIFY `request` VARCHAR(191) NOT NULL;

-- AlterTable
ALTER TABLE `Sacrament` MODIFY `details` VARCHAR(191) NULL;
