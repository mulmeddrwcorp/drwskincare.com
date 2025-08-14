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
    const { displayName, city, whatsappNumber, facebook, instagram, bio, photoUrl, isPublic, customSlug } = body;

    // 3. Gunakan prisma.resellerProfile.upsert() untuk membuat atau mengupdate profil
    const updatedProfile = await prisma.resellerProfile.upsert({
      where: { 
        resellerId: userId // Kunci relasi yang unik
      },
      create: {
        resellerId: userId, // Wajib untuk membuat relasi
        displayName: displayName || null,
        city: city || null,
        whatsappNumber: whatsappNumber || null,
        facebook: facebook || null,
        instagram: instagram || null,
        bio: bio || null,
        photoUrl: photoUrl || null,
        isPublic: isPublic !== undefined ? isPublic : true,
        customSlug: customSlug || null,
      },
      update: {
        displayName: displayName || null,
        city: city || null,
        whatsappNumber: whatsappNumber || null,
        facebook: facebook || null,
        instagram: instagram || null,
        bio: bio || null,
        photoUrl: photoUrl || null,
        isPublic: isPublic !== undefined ? isPublic : undefined,
        customSlug: customSlug || null,
        updatedAt: new Date(),
      }
    });

    // 4. Kembalikan data profil yang baru diupdate sebagai respons JSON
    return NextResponse.json(
      { 
        message: 'Profile updated successfully',
        profile: updatedProfile 
      },
      { status: 200 }
    );

  } catch (error) {
    // 5. Error handling
    console.error('Error updating reseller profile:', error);
    
    return NextResponse.json(
      { 
        error: 'Internal server error', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      },
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