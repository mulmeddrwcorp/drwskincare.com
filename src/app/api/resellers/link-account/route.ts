import { NextRequest, NextResponse } from 'next/server';
import { auth, clerkClient } from '@clerk/nextjs/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    // 1. Authenticate
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

  // Fetch full user object from Clerk
  const client = await clerkClient();
  const user = await client.users.getUser(userId);
    if (!user) {
      return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });
    }

    // 2. Parse body
    const body = await request.json();
    const { resellerId } = body ?? {};
    if (!resellerId) {
      return NextResponse.json({ success: false, error: 'resellerId is required' }, { status: 400 });
    }

    console.log(`[link-account] request by clerkUser=${userId} for resellerId=${resellerId}`);

    // 3. Step A: Conservative check — ensure this Clerk user isn't already linked to another reseller
    const alreadyLinked = await prisma.reseller.findUnique({ where: { clerk_user_id: userId } });
    if (alreadyLinked && alreadyLinked.id !== resellerId) {
      // fetch minimal profile so frontend can render the reseller profile page
      const existingProfile = await prisma.resellerProfile.findUnique({ where: { resellerId: alreadyLinked.id } });
      console.log(`[link-account] clerkUser ${userId} already linked to reseller ${alreadyLinked.id}`);
      return NextResponse.json({
        success: false,
        error: 'clerk_user_already_linked',
        existingResellerId: alreadyLinked.id,
        existingProfile: existingProfile ?? null
      }, { status: 409 });
    }

    // Idempotent: if already linked to this reseller, skip update
    if (!alreadyLinked) {
      await prisma.reseller.update({ where: { id: resellerId }, data: { clerk_user_id: userId } });
    }

    // 4. Step B: Create or update ResellerProfile
    const email_address = (user as any)?.primaryEmailAddress?.emailAddress ?? (user as any)?.emailAddresses?.[0]?.emailAddress ?? null;
  // We only persist email from Clerk; do not store first/last name
    const clerkPhoto = (user as any)?.imageUrl ?? (user as any)?.image_url ?? null;

    // Prefer existing profile photo (from blob) if present; only use Clerk avatar as fallback
    let photo_url_to_save = null;
    try {
      const existingProfile = await prisma.resellerProfile.findUnique({ where: { resellerId } });
      console.log(`[link-account] existingProfile.photo_url=${existingProfile?.photo_url ?? '<<none>>'}`);
      console.log(`[link-account] clerkPhoto=${clerkPhoto ?? '<<none>>'}`);
      if (existingProfile && existingProfile.photo_url) {
        photo_url_to_save = existingProfile.photo_url;
        console.log('[link-account] decision: keep existing profile.photo_url');
      } else if (clerkPhoto) {
        photo_url_to_save = clerkPhoto;
        console.log('[link-account] decision: use clerk avatar as fallback');
      } else {
        photo_url_to_save = null;
        console.log('[link-account] decision: no photo to save');
      }
    } catch (e) {
      // If lookup fails for any reason, fall back to Clerk photo if available
      photo_url_to_save = clerkPhoto || null;
      console.warn('[link-account] failed to query existing profile, falling back to clerkPhoto', e?.message || e);
    }

    await prisma.resellerProfile.upsert({
      where: { resellerId: resellerId },
      create: {
        resellerId,
        email_address,
        photo_url: photo_url_to_save
      },
      update: {
        email_address,
        // only overwrite photo_url if we don't have an existing blob URL
        photo_url: photo_url_to_save,
        updatedAt: new Date()
      }
    });

  console.log(`[link-account] profile upsert complete for resellerId=${resellerId}, savedPhoto=${photo_url_to_save ?? '<<none>>'}`);

    // 5. Step C: Update Clerk public metadata to mark profileComplete
    const client2 = await clerkClient();
    await client2.users.updateUser(userId, {
      publicMetadata: { profileComplete: true, role: 'reseller' }
    } as any);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('link-account error:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
