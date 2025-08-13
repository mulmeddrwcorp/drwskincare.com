import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
    const resellers = await prisma.reseller.findMany({
      orderBy: { namaReseller: 'asc' },
      include: {
        hargaCustom: {
          include: {
            product: true
          }
        }
      }
    });

    return NextResponse.json({
      success: true,
      data: resellers,
      count: resellers.length
    });
  } catch (error) {
    console.error('Error fetching resellers:', error);
    return NextResponse.json({ error: 'Failed to fetch resellers' }, { status: 500 });
  }
}
