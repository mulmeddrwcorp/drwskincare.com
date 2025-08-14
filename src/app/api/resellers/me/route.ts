import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function PUT(request: NextRequest) {
  try {
    // 1. Proteksi route dengan Clerk auth
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized - Please login first' },
        { status: 401 }
      );
    }

    // 2. Ambil data dari body request
    const body = await request.json();
    const { name, city, whatsappNumber, facebook, instagram } = body;

    // Validasi data yang diperlukan
    if (!name || !city) {
      return NextResponse.json(
        { error: 'Name and city are required fields' },
        { status: 400 }
      );
    }

    // 3. Update data reseller profile (data yang bisa diedit pengguna)
    const updatedReseller = await prisma.reseller.update({
      where: { 
        apiResellerId: userId // Pastikan reseller hanya bisa update datanya sendiri
      },
      data: {
        updatedAt: new Date(),
        profile: {
          upsert: {
            create: {
              displayName: name,
              city: city,
              whatsappNumber: whatsappNumber || undefined,
              facebook: facebook || undefined,
              instagram: instagram || undefined,
            },
            update: {
              displayName: name,
              city: city,
              whatsappNumber: whatsappNumber || undefined,
              facebook: facebook || undefined,
              instagram: instagram || undefined,
              updatedAt: new Date(),
            }
          }
        }
      },
      select: {
        id: true,
        apiResellerId: true,
        namaReseller: true,
        nomorHp: true,
        area: true,
        level: true,
        status: true,
        profile: {
          select: {
            displayName: true,
            whatsappNumber: true,
            city: true,
            facebook: true,
            instagram: true,
            photoUrl: true,
            bio: true,
          }
        }
      }
    });

    // 4. Kembalikan respons JSON dengan data yang sudah terupdate
    return NextResponse.json(
      { 
        message: 'Profile updated successfully',
        reseller: updatedReseller 
      },
      { status: 200 }
    );

  } catch (error) {
    // 5. Handle error
    console.error('Error updating reseller profile:', error);
    
    // Check if it's a Prisma error (reseller not found)
    if (error instanceof Error && error.message.includes('Record to update not found')) {
      return NextResponse.json(
        { error: 'Reseller profile not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// Optional: Tambahkan method GET untuk mengambil data reseller
export async function GET() {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized - Please login first' },
        { status: 401 }
      );
    }

    const reseller = await prisma.reseller.findUnique({
      where: { 
        apiResellerId: userId 
      },
      select: {
        id: true,
        apiResellerId: true,
        namaReseller: true,
        nomorHp: true,
        area: true,
        level: true,
        status: true,
        createdAt: true,
        updatedAt: true,
        profile: {
          select: {
            id: true,
            displayName: true,
            whatsappNumber: true,
            photoUrl: true,
            city: true,
            bio: true,
            facebook: true,
            instagram: true,
            isPublic: true,
            customSlug: true,
          }
        }
      }
    });

    if (!reseller) {
      return NextResponse.json(
        { error: 'Reseller profile not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { reseller },
      { status: 200 }
    );

  } catch (error) {
    console.error('Error fetching reseller profile:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}