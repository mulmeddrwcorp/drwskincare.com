import { NextRequest, NextResponse } from 'next/server';
import { auth, clerkClient } from '@clerk/nextjs/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    // Check if user is linked to reseller
    const linkedReseller = await prisma.reseller.findUnique({
      where: { clerk_user_id: userId },
      include: { profile: true }
    });

    if (!linkedReseller) {
      return NextResponse.json({ 
        error: 'User is not linked to any reseller',
        action: 'redirect_to_pilih_peran'
      }, { status: 404 });
    }

    // Force update Clerk metadata
    const client = await clerkClient();
    await client.users.updateUser(userId, {
      publicMetadata: { 
        role: 'reseller', 
        profileComplete: true,
        resellerId: linkedReseller.id,
        lastMetadataUpdate: new Date().toISOString()
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Metadata updated successfully',
      reseller: {
        id: linkedReseller.id,
        apiResellerId: linkedReseller.apiResellerId,
        hasProfile: !!linkedReseller.profile
      }
    });

  } catch (error) {
    console.error('Fix metadata error:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
