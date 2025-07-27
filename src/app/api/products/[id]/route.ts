import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { saveImage } from '@/lib/utils/save-image';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const formData = await request.formData();
  const name = formData.get('name') as string | undefined;
  const points = formData.get('points')
    ? parseInt(formData.get('points') as string, 10)
    : undefined;
  const description = formData.get('description') as string | undefined;
  const imageFile = formData.get('image') as File | undefined;
  const active = formData.get('active')
    ? formData.get('active') === 'true'
    : undefined;

  let image = undefined;
  if (imageFile) {
    image = await saveImage(imageFile);
  }

  const product = await prisma.product.update({
    where: { id },
    data: {
      ...(name && { name }),
      ...(points && { points }),
      ...(image && { image }),
      ...(description && { description }),
      ...(active !== undefined && { active }),
    },
  });
  return NextResponse.json(product);
}
