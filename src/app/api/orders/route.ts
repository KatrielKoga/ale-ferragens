import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { OrderCreateBody } from '@/lib/interfaces';

export async function POST(request: NextRequest) {
  const { userId, points }: OrderCreateBody = await request.json();
  const user = await prisma.user.findFirst({
    where: {
      id: userId,
    },
  });
  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }
  const order = await prisma.order.create({
    data: {
      userId,
      points,
    },
  });
  return NextResponse.json(order);
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const document = searchParams.get('document');
  const limit = searchParams.get('limit');
  const page = searchParams.get('page');

  let user = null;
  if (document) {
    user = await prisma.user.findFirst({
      where: {
        document: document,
      },
    });
  }
  const orders = await prisma.order.findMany({
    select: {
      id: true,
      points: true,
      createdAt: true,
      expiredAt: true,
      user: {
        select: {
          name: true,
          document: true,
        },
      },
    },
    ...(user && {
      where: {
        userId: user.id,
      },
    }),
    orderBy: {
      createdAt: 'desc',
    },
    take: limit ? parseInt(limit) : 10,
    skip: page ? (parseInt(page) - 1) * (limit ? parseInt(limit) : 10) : 0,
  });
  return NextResponse.json(orders);
}
