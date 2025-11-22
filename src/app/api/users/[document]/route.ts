import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ document: string }> }
) {
  const { document } = await params;
  if (!document) {
    return NextResponse.json(
      { error: 'Document is required' },
      { status: 400 }
    );
  }
  const user = await prisma.user.findFirst({
    where: {
      document,
    },
    include: {
      orders: {
        select: {
          points: true,
          createdAt: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
        take: 5,
      },
      redeems: {
        select: {
          createdAt: true,
          points: true,
          product: {
            select: {
              name: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
        take: 2,
      },
    },
  });
  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  const [orders, redeems] = await Promise.all([
    prisma.order.findMany({
      where: { userId: user.id,  },
      select: { points: true },
    }),
    prisma.redeem.findMany({
      where: { userId: user.id },
      select: { points: true },
    }),
  ]);

  const userPoints =
    orders.reduce((acc: number, order: { points: number }) => acc + order.points, 0) -
    redeems.reduce((acc: number, redeem: { points: number }) => acc + redeem.points, 0);
  return NextResponse.json({
    ...user,
    points: userPoints,
  });
}
