-- CreateTable
CREATE TABLE `BuyerUser` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `passwordHash` VARCHAR(191) NOT NULL,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `BuyerUser_email_key`(`email`),
    INDEX `BuyerUser_email_idx`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `BuyerSession` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `buyerUserId` INTEGER NOT NULL,
    `tokenHash` VARCHAR(191) NOT NULL,
    `expiresAt` DATETIME(3) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `BuyerSession_tokenHash_key`(`tokenHash`),
    INDEX `BuyerSession_buyerUserId_idx`(`buyerUserId`),
    INDEX `BuyerSession_expiresAt_idx`(`expiresAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AlterTable
ALTER TABLE `Order`
ADD COLUMN `buyerUserId` INTEGER NULL;

-- CreateIndex
CREATE INDEX `Order_buyerUserId_idx` ON `Order`(`buyerUserId`);

-- AddForeignKey
ALTER TABLE `Order`
ADD CONSTRAINT `Order_buyerUserId_fkey`
FOREIGN KEY (`buyerUserId`) REFERENCES `BuyerUser`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `BuyerSession`
ADD CONSTRAINT `BuyerSession_buyerUserId_fkey`
FOREIGN KEY (`buyerUserId`) REFERENCES `BuyerUser`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
