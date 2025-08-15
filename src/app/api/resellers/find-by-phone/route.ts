import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    // Protect route with Clerk
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const phoneNumber = body?.phoneNumber ?? body?.nomorHp ?? null;

    if (!phoneNumber) {
      return NextResponse.json({ error: 'phoneNumber is required' }, { status: 400 });
    }

    // Normalize digits for robust matching
    const normalize = (s: string | null | undefined) => (s ? s.replace(/\D/g, '') : '');
    const target = normalize(String(phoneNumber));

    // Fetch candidates and match normalized number
    const candidates = await prisma.reseller.findMany({ where: { nomorHp: { not: null } }, include: { profile: true } });
    const reseller = candidates.find((r) => normalize(r.nomorHp) === target) ?? null;

    if (!reseller) {
      return NextResponse.json({ success: false, error: 'Reseller not found' }, { status: 404 });
    }

    const publicData = {
      id: reseller.id,
      apiResellerId: reseller.apiResellerId,
  namaReseller: reseller.profile?.nama_reseller ?? null,
      area: reseller.profile?.city ?? null,
      profile: reseller.profile
        ? {
            whatsapp_number: reseller.profile.whatsapp_number,
            photo_url: reseller.profile.photo_url,
          }
        : null,
    };

    return NextResponse.json({ success: true, data: publicData }, { status: 200 });
  } catch (error) {
    console.error('find-by-phone error:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
