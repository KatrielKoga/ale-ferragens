-- CreateTable
CREATE TABLE "pendingPayments" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "valueInCents" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pendingPayments_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "pendingPayments" ADD CONSTRAINT "pendingPayments_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
