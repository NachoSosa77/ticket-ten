-- AlterTable
ALTER TABLE `EventSession`
ADD COLUMN `createdById` INTEGER NULL;

-- Backfill ownership from parent event
UPDATE `EventSession` AS `es`
INNER JOIN `Event` AS `e` ON `e`.`id` = `es`.`eventId`
SET `es`.`createdById` = `e`.`createdById`
WHERE `es`.`createdById` IS NULL;

-- Make owner required
ALTER TABLE `EventSession`
MODIFY `createdById` INTEGER NOT NULL;

-- AddIndex
CREATE INDEX `EventSession_createdById_idx` ON `EventSession`(`createdById`);

-- AddForeignKey
ALTER TABLE `EventSession`
ADD CONSTRAINT `EventSession_createdById_fkey`
FOREIGN KEY (`createdById`) REFERENCES `AdminUser`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
