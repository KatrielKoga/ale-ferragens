import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function PATCH() {
  const now = new Date();

  try {
    await prisma.$transaction(async (tx) => {
      await tx.order.updateMany({
        where: {
          expiredAt: null,
        },
        data: {
          expiredAt: now,
        },
      });

      await tx.redeem.updateMany({
        where: {
          expiredAt: null,
        },
        data: {
          expiredAt: now,
        },
      });
    });

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.log(error);
    throw new Error('Error expiring points');
  }
}
