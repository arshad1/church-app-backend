-- AlterTable
ALTER TABLE `Announcement` MODIFY `content` TEXT NOT NULL;

-- AlterTable
ALTER TABLE `ChurchSettings` MODIFY `description` TEXT NULL,
    MODIFY `locationMapUrl` TEXT NULL;

-- AlterTable
ALTER TABLE `Content` MODIFY `body` TEXT NULL,
    MODIFY `mediaUrl` TEXT NULL;

-- AlterTable
ALTER TABLE `Event` MODIFY `description` TEXT NULL,
    MODIFY `liveUrl` TEXT NULL;

-- AlterTable
ALTER TABLE `GalleryAlbum` MODIFY `description` TEXT NULL;

-- AlterTable
ALTER TABLE `GalleryImage` MODIFY `url` TEXT NOT NULL,
    MODIFY `caption` TEXT NULL;

-- AlterTable
ALTER TABLE `Ministry` MODIFY `description` TEXT NULL;

-- AlterTable
ALTER TABLE `Notification` MODIFY `body` TEXT NOT NULL,
    MODIFY `data` TEXT NULL;

-- AlterTable
ALTER TABLE `NotificationHistory` MODIFY `body` TEXT NOT NULL,
    MODIFY `data` TEXT NULL;

-- AlterTable
ALTER TABLE `PrayerRequest` MODIFY `request` TEXT NOT NULL;

-- AlterTable
ALTER TABLE `Sacrament` MODIFY `details` TEXT NULL;
