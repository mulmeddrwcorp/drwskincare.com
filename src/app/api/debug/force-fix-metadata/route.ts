import { NextRequest, NextResponse } from 'next/server';
import { auth, clerkClient } from '@clerk/nextjs/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    console.log('Force fix metadata for user:', userId);
    
    if (!userId) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

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
        error: 'User is not linked to any reseller. Please complete role selection first.',
        action: 'redirect_to_pilih_peran',
        currentMetadata: user.publicMetadata
      }, { status: 404 });
    }

    // Force update Clerk metadata with all the necessary fields
    const newMetadata = { 
      role: 'reseller', 
      profileComplete: true,
      resellerId: linkedReseller.id,
      lastMetadataUpdate: new Date().toISOString(),
      // Legacy support
      public_metadata: {
        role: 'reseller', 
        profileComplete: true
      }
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
      message: 'Metadata force updated successfully',
      oldMetadata: user.publicMetadata,
      newMetadata: updatedUser.publicMetadata,
      reseller: {
        id: linkedReseller.id,
        apiResellerId: linkedReseller.apiResellerId,
        hasProfile: !!linkedReseller.profile
      }
    });

  } catch (error) {
    console.error('Force fix metadata error:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
