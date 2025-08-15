import { NextRequest, NextResponse } from 'next/server';
import { auth, clerkClient } from '@clerk/nextjs/server';

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json().catch(() => ({}));
    const role = (body?.role as string) || 'user';

    // Validate role (allow only known roles)
    const allowed = ['user', 'reseller'];
    if (!allowed.includes(role)) {
      return NextResponse.json({ success: false, error: 'Invalid role' }, { status: 400 });
    }

    const client = await clerkClient();
    await client.users.updateUser(userId, {
      publicMetadata: { role, profileComplete: true }
    } as any);

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('set-role error:', err);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
