import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
    const resellers = await prisma.reseller.findMany({
      orderBy: { joinDate: 'asc' },
      include: {
        hargaCustom: {
          include: {
            product: true
          }
        },
        profile: true,
      }
    });

    // Map to legacy UI shape
    const mapped = resellers.map(r => ({
      id: r.id,
      apiResellerId: r.apiResellerId,
      idReseller: r.apiResellerId,
  namaReseller: r.profile?.nama_reseller ?? r.apiResellerId,
      nomorHp: r.nomorHp,
      area: r.profile?.city ?? null,
      level: r.status,
      status: r.status,
      createdAt: r.createdAt,
      updatedAt: r.updatedAt,
      fotoProfil: r.profile?.photo_url ?? null,
      profile: r.profile,
      hargaCustom: r.hargaCustom,
    }));

    return NextResponse.json({
      success: true,
      data: mapped,
      count: mapped.length
    });
  } catch (error) {
    console.error('Error fetching resellers:', error);
    return NextResponse.json({ error: 'Failed to fetch resellers' }, { status: 500 });
  }
}
