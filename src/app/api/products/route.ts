import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';
import { saveImage } from '@/lib/utils/save-image';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const name = searchParams.get('name');
  const code = searchParams.get('code');
  const products = await prisma.product.findMany({
    select: {
      id: true,
      name: true,
      points: true,
      description: true,
      image: true,
      createdAt: true,
      code: true,
    },
    where: {
      active: true,
      name: name ? { contains: name, mode: 'insensitive' } : undefined,
      code: code ? parseInt(code) : undefined,
    },
    orderBy: {
      points: 'asc',
    },
  });
  return NextResponse.json(products);
}

export async function POST(request: NextRequest) {
  let formData: FormData;
  try {
    formData = await request.formData();
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: 'Failed to parse form data' },
      { status: 400 }
    );
  }
  const name = formData.get('name') as string;
  const points = parseInt(formData.get('points') as string, 10);
  const description = formData.get('description') as string | null;
  const imageFile = formData.get('image') as File | null;

  let image = null;
  if (imageFile) {
    image = await saveImage(imageFile);
  }
  if (!image) {
    return NextResponse.json({ error: 'Image is required' }, { status: 400 });
  }
  const product = await prisma.product.create({
    data: { name, points, image, description },
  });
  return NextResponse.json(product);
}
