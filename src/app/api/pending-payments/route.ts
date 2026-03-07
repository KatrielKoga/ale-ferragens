import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import {
  PendingPaymentByUserResponse,
  PendingPaymentCreateBody,
} from '@/lib/interfaces/pending-payments';

export async function POST(request: NextRequest) {
  const { userId, valueInCents, createdAt }: PendingPaymentCreateBody =
    await request.json();
  const user = await prisma.user.findFirst({
    where: {
      id: userId,
    },
  });
  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }
  const pendingPayment = await prisma.pendingPayments.create({
    data: {
      userId,
      valueInCents,
      createdAt: createdAt || new Date(),
    },
  });
  return NextResponse.json(pendingPayment, { status: 201 });
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const document = searchParams.get('document');
  const limit = searchParams.get('limit') || '10';
  const page = searchParams.get('page') || '1';

  let user = null;
  if (document) {
    user = await prisma.user.findFirst({
      where: {
        document: document,
      },
    });
  }

  if (user) {
    const pendingPayments = await prisma.pendingPayments.findMany({
      where: {
        userId: user.id,
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: parseInt(limit),
      skip: (parseInt(page) - 1) * parseInt(limit),
      select: {
        id: true,
        valueInCents: true,
        createdAt: true,
      },
    });

    const balanceInCents = await prisma.pendingPayments.aggregate({
      where: {
        userId: user.id,
      },
      _sum: {
        valueInCents: true,
      },
    });

    const response: PendingPaymentByUserResponse = [
      {
        user: {
          name: user.name,
          document: user.document,
        },
        pendingPayments: pendingPayments,
        balanceInCents: balanceInCents._sum.valueInCents || 0,
      },
    ];

    return NextResponse.json(response);
  } else {
    const groupedPayments = await prisma.pendingPayments.groupBy({
      by: ['userId'],
      _sum: {
        valueInCents: true,
      },
      orderBy: {
        userId: 'asc',
      },
      take: parseInt(limit),
      skip: (parseInt(page) - 1) * parseInt(limit),
    });

    const userIds = groupedPayments.map((gp) => gp.userId);

    const users = await prisma.user.findMany({
      where: {
        id: { in: userIds },
      },
      select: {
        id: true,
        name: true,
        document: true,
      },
    });

    const response: PendingPaymentByUserResponse = users.map((user) => {
      const group = groupedPayments.find((gp) => gp.userId === user.id);
      return {
        user: {
          name: user.name,
          document: user.document,
        },
        balanceInCents: group?._sum?.valueInCents || 0,
      };
    });

    return NextResponse.json(response);
  }
}

export async function DELETE(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  if (!id) {
    return NextResponse.json({ error: 'ID is required' }, { status: 400 });
  }
  await prisma.pendingPayments.delete({
    where: {
      id,
    },
  });
  return NextResponse.json({ message: 'Pending payment deleted successfully' });
}
