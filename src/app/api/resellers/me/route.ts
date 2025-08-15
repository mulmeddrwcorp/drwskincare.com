import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function PUT(request: NextRequest) {
  try {
    // 1. Proteksi route dengan Clerk auth
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized - Please login first' }, { status: 401 });
    }    // 2. Ambil data dari body request  
    const body = await request.json();
    const { 
      nama_reseller, 
      city, 
      whatsapp_number, 
      bio, 
      photo_url, 
      facebook, 
      instagram, 
      alamat, 
      provinsi, 
      kabupaten, 
      kecamatan, 
      bank, 
      rekening,
      // Legacy support for camelCase fields
      displayName,
      whatsappNumber,
      photoUrl
    } = body;

    // 3. Temukan reseller yang sudah di-link ke Clerk user
    const reseller = await prisma.reseller.findUnique({ where: { clerk_user_id: userId } });
    if (!reseller) {
      return NextResponse.json({ error: 'Reseller not linked to this user' }, { status: 404 });
    }    // 4. Gunakan prisma.resellerProfile.upsert() untuk membuat atau mengupdate profil menggunakan reseller.id
    const updatedProfile = await prisma.resellerProfile.upsert({
      where: { resellerId: reseller.id },
      create: {
        resellerId: reseller.id,
        nama_reseller: nama_reseller || displayName || null,
        city: city || null,
        whatsapp_number: whatsapp_number || whatsappNumber || null,
        bio: bio || null,
        photo_url: photo_url || photoUrl || null,
        last_user_update: new Date(),
        facebook: facebook || null,
        instagram: instagram || null,
        alamat: alamat || null,
        provinsi: provinsi || null,
        kabupaten: kabupaten || null,
        kecamatan: kecamatan || null,
        bank: bank || null,
        rekening: rekening || null,
      },
      update: {
        nama_reseller: nama_reseller || displayName || null,
        city: city || null,
        whatsapp_number: whatsapp_number || whatsappNumber || null,
        bio: bio || null,
        photo_url: photo_url || photoUrl || null,
        updatedAt: new Date(),
        last_user_update: new Date(),
        facebook: facebook || null,
        instagram: instagram || null,
        alamat: alamat || null,
        provinsi: provinsi || null,
        kabupaten: kabupaten || null,
        kecamatan: kecamatan || null,
        bank: bank || null,
        rekening: rekening || null,
      }
    });

    return NextResponse.json({ message: 'Profile updated successfully', profile: updatedProfile }, { status: 200 });

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
        clerk_user_id: userId
      },
      select: {
        id: true,
        apiResellerId: true,
        nomorHp: true,
        status: true,
        joinDate: true,
        createdAt: true,
        updatedAt: true,        profile: {
          select: {
            id: true,
            nama_reseller: true,
            whatsapp_number: true,
            photo_url: true,
            city: true,
            bio: true,
            facebook: true,
            instagram: true,
            alamat: true,
            provinsi: true,
            kabupaten: true,
            kecamatan: true,
            bank: true,
            rekening: true,
            level: true,
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