-- AlterTable
ALTER TABLE `Order`
ADD COLUMN `orderCode` VARCHAR(32) NULL;

-- CreateIndex
CREATE UNIQUE INDEX `Order_orderCode_key` ON `Order`(`orderCode`);

