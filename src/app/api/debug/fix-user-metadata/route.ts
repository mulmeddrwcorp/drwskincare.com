import { NextRequest, NextResponse } from 'next/server';
import { clerkClient } from '@clerk/nextjs/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId');
  
  return NextResponse.json({
    message: 'Use POST method to fix metadata',
    example: `POST /api/debug/fix-user-metadata?userId=${userId || 'user_id_here'}`,
    userId: userId || 'not provided'
  });
}

export async function POST(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    
    if (!userId) {
      return NextResponse.json({ 
        error: 'userId parameter required',
        example: '/api/debug/fix-user-metadata?userId=user_31DidogIs2TuRd6sSX6rxxnStLE'
      }, { status: 400 });
    }

    console.log('Fixing metadata for user:', userId);

    // Get current user info from Clerk
    const client = await clerkClient();
    const user = await client.users.getUser(userId);
    
    console.log('Current Clerk metadata:', {
      publicMetadata: user.publicMetadata,
      privateMetadata: user.privateMetadata
    });

    // Check if user is linked to reseller
    const linkedReseller = await prisma.reseller.findUnique({
      where: { clerk_user_id: userId },
      include: { profile: true }
    });

    console.log('Linked reseller:', linkedReseller ? {
      id: linkedReseller.id,
      apiResellerId: linkedReseller.apiResellerId,
      hasProfile: !!linkedReseller.profile
    } : null);

    if (!linkedReseller) {
      return NextResponse.json({ 
        error: 'User is not linked to any reseller',
        userId,
        currentMetadata: user.publicMetadata
      }, { status: 404 });
    }

    // Force update Clerk metadata
    const newMetadata = { 
      role: 'reseller', 
      profileComplete: true,
      resellerId: linkedReseller.id,
      lastMetadataUpdate: new Date().toISOString()
    };

    console.log('Updating metadata to:', newMetadata);

    await client.users.updateUser(userId, {
      publicMetadata: newMetadata
    });

    // Verify the update
    const updatedUser = await client.users.getUser(userId);
    console.log('Updated metadata:', updatedUser.publicMetadata);

    return NextResponse.json({
      success: true,
      message: 'User metadata fixed successfully',
      userId,
      oldMetadata: user.publicMetadata,
      newMetadata: updatedUser.publicMetadata,
      reseller: {
        id: linkedReseller.id,
        apiResellerId: linkedReseller.apiResellerId,
        hasProfile: !!linkedReseller.profile
      }
    });

  } catch (error) {
    console.error('Fix user metadata error:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
