import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const limit = searchParams.get('limit');
  const page = searchParams.get('page');
  const search = searchParams.get('search');
  const users = await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      document: true,
      createdAt: true,
      orders: {
        select: {
          expiredAt: true,
          points: true,
        },
      },
      redeems: {
        select: {
          expiredAt: true,
          points: true,
        },
      },
    },
    where: {
      OR: [
        { name: { contains: search || '', mode: 'insensitive' } },
        { document: { contains: search || '', mode: 'insensitive' } },
      ],
    },
    orderBy: {
      createdAt: 'desc',
    },
    take: limit ? parseInt(limit) : 5,
    skip: page ? (parseInt(page) - 1) * (limit ? parseInt(limit) : 5) : 0,
  });
  const usersWithPoints = users.map((user) => ({
    ...user,
    orders: undefined,
    redeems: undefined,
    points:
      user.orders
        .filter((o) => o.expiredAt === null)
        .reduce((acc, order) => acc + order.points, 0) -
      user.redeems
        .filter((r) => r.expiredAt === null)
        .reduce((acc, redeem) => acc + redeem.points, 0),
  }));
  return NextResponse.json(usersWithPoints);
}

export async function POST(request: NextRequest) {
  const { document, name } = await request.json();
  const user = await prisma.user.findFirst({
    where: {
      document,
    },
  });
  if (user) {
    return NextResponse.json({ error: 'User already exists' }, { status: 400 });
  }
  const newUser = await prisma.user.create({
    data: {
      document,
      name,
    },
  });
  return NextResponse.json(newUser);
}
