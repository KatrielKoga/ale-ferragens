import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { searchParams } = new URL(request.url);
  const orderPage = parseInt(searchParams.get('orderPage') || '1', 10);
  const redeemPage = parseInt(searchParams.get('redeemPage') || '1', 10);
  const { id } = await params;
  if (!id) {
    return NextResponse.json({ error: 'id is required' }, { status: 400 });
  }
  const take = 10;
  const user = await prisma.user.findFirst({
    where: {
      id,
    },
    include: {
      orders: {
        select: {
          points: true,
        },
      },
      redeems: {
        select: {
          points: true,
        },
      },
    },
  });
  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }
  const orders = await prisma.order.findMany({
    where: {
      userId: id,
    },
    select: {
      points: true,
      createdAt: true,
    },
    orderBy: {
      createdAt: 'desc',
    },
    take,
    skip: (orderPage - 1) * take,
  });
  const redeems = await prisma.redeem.findMany({
    where: {
      userId: id,
    },
    select: {
      points: true,
      createdAt: true,
      product: {
        select: {
          name: true,
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
    take,
    skip: (redeemPage - 1) * take,
  });

  const userPoints =
    user.orders.reduce((acc, order) => acc + order.points, 0) -
    user.redeems.reduce((acc, redeem) => acc + redeem.points, 0);
  return NextResponse.json({
    ...user,
    points: userPoints,
    orders,
    redeems,
  });
}
