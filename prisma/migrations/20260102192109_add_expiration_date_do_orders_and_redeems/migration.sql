-- AlterTable
ALTER TABLE "order" ADD COLUMN     "expiredAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "redeem" ADD COLUMN     "expiredAt" TIMESTAMP(3);
