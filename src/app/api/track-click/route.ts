import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    // 1. Mendapatkan parameter dari query string
    const { searchParams } = request.nextUrl;
    const resellerId = searchParams.get('resellerId');
    const redirectTo = searchParams.get('redirectTo');
    const productId = searchParams.get('productId'); // Optional parameter

    // 2. Mencatat click ke database jika resellerId ada
    if (resellerId) {
      try {
        await prisma.clickLog.create({
          data: {
            resellerId: resellerId,
            productId: productId || undefined, // Optional field
          },
        });
        
        console.log(`Click tracked: resellerId=${resellerId}, productId=${productId || 'N/A'}`);
      } catch (dbError) {
        // Jangan stop proses redirect jika gagal menyimpan ke database
        console.error('Failed to save click log:', dbError);
      }
    }

    // 3. Redirect ke URL yang dituju
    if (redirectTo) {
      // Validasi bahwa redirectTo adalah URL WhatsApp yang valid
      const decodedUrl = decodeURIComponent(redirectTo);
      
      // Basic validation untuk memastikan URL aman
      if (decodedUrl.startsWith('https://wa.me/') || decodedUrl.startsWith('https://api.whatsapp.com/')) {
        return NextResponse.redirect(decodedUrl);
      } else {
        console.warn('Invalid redirect URL detected:', decodedUrl);
        // Redirect ke halaman utama jika URL tidak valid
        return NextResponse.redirect(new URL('/', request.url));
      }
    }

    // 4. Fallback: redirect ke halaman utama jika redirectTo tidak ada
    return NextResponse.redirect(new URL('/', request.url));

  } catch (error) {
    console.error('Error in track-click API:', error);
    
    // Fallback: redirect ke halaman utama jika terjadi error
    return NextResponse.redirect(new URL('/', request.url));
  }
}