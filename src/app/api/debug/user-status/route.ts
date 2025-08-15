import { NextResponse } from 'next/server';
import { auth, clerkClient } from '@clerk/nextjs/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
    // 1. Get auth info
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    // 2. Get full user from Clerk
    const client = await clerkClient();
    const user = await client.users.getUser(userId);

    // 3. Check if linked to reseller
    const reseller = await prisma.reseller.findUnique({
      where: { clerk_user_id: userId },
      include: { profile: true }
    });

    // 4. Return debug info
    return NextResponse.json({
      userId,
      userEmail: user.primaryEmailAddress?.emailAddress,
      publicMetadata: user.publicMetadata,
      isLinkedToReseller: !!reseller,
      resellerId: reseller?.id || null,
      resellerApiId: reseller?.apiResellerId || null,
      hasProfile: !!reseller?.profile,
      profileComplete: user.publicMetadata?.profileComplete || false,
      role: user.publicMetadata?.role || null,
    });

  } catch (error) {
    console.error('Debug API error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
