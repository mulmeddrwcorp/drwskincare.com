import { NextResponse } from 'next/server';
import { put } from '@vercel/blob';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: Request) {
  const formData = await request.formData();
  const file = formData.get('file') as File;
  const resellerId = formData.get('resellerId') as string;

  if (!file || !resellerId) {
    return NextResponse.json({ error: 'File dan resellerId wajib diisi' }, { status: 400 });
  }

  // Upload ke Vercel Blob
  const blob = await put(file.name, file, { access: 'public' });

  // Simpan URL ke database Neon - update ResellerProfile
  await prisma.resellerProfile.upsert({
    where: { resellerId: resellerId },
    update: { photo_url: blob.url },
    create: { 
      resellerId: resellerId,
      photo_url: blob.url 
    },
  });

  return NextResponse.json({ url: blob.url });
}
