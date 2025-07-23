import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  const { userId, productId } = await request.json();
  const user = await prisma.user.findFirst({
    where: {
      id: userId,
    },
  });
  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }
  const product = await prisma.product.findFirst({
    where: {
      id: productId,
      active: true,
    },
  });
  if (!product) {
    return NextResponse.json({ error: 'Product not found' }, { status: 404 });
  }
  const redeem = await prisma.redeem.create({
    data: {
      userId,
      productId,
      points: product.points,
    },
  });
  return NextResponse.json(redeem);
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const search = searchParams.get('search');
  const limit = searchParams.get('limit');
  const page = searchParams.get('page');

  let user = null;
  if (search) {
    user = await prisma.user.findFirst({
      where: {
        document: search,
      },
    });
  }

  const redeems = await prisma.redeem.findMany({
    where: {
      ...(user && {
        userId: user.id,
      }),
    },
    orderBy: {
      createdAt: 'desc',
    },
    include: {
      user: {
        select: {
          name: true,
        },
      },
      product: {
        select: {
          name: true,
        },
      },
    },
    take: limit ? parseInt(limit) : 10,
    skip: page ? parseInt(page) * (limit ? parseInt(limit) : 10) : 0,
  });
  return NextResponse.json(redeems);
}
