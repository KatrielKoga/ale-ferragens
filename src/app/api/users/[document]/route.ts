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
  const userPoints =
    user.orders.reduce((acc, order) => acc + order.points, 0) -
    user.redeems.reduce((acc, redeem) => acc + redeem.points, 0);
  return NextResponse.json({
    ...user,
    points: userPoints,
  });
}
