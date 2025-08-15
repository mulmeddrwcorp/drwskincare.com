import { auth, currentUser } from '@clerk/nextjs/server'
import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth()
    const user = await currentUser()

    if (!userId || !user) {
      return NextResponse.json({ 
        error: 'Not authenticated',
        userId: null,
        user: null 
      }, { status: 401 })
    }

    // Check Clerk metadata
    const clerkMetadata = user.privateMetadata || {}
    const publicMetadata = user.publicMetadata || {}

    // Check database reseller
    const reseller = await prisma.reseller_profile.findFirst({
      where: { clerk_user_id: userId }
    })

    const resellerData = reseller ? {
      id: reseller.id,
      nama_reseller: reseller.nama_reseller,
      whatsapp_number: reseller.whatsapp_number,
      level: reseller.level,
      created_at: reseller.created_at,
      last_user_update: reseller.last_user_update,
      area: reseller.area,
      provinsi: reseller.provinsi,
      kabupaten: reseller.kabupaten,
      kecamatan: reseller.kecamatan
    } : null

    const response = {
      userId,
      userEmail: user.emailAddresses[0]?.emailAddress || 'No email',
      clerkPrivateMetadata: clerkMetadata,
      clerkPublicMetadata: publicMetadata,
      hasReseller: !!reseller,
      resellerData,
      middlewareChecks: {
        hasRole: !!clerkMetadata.role,
        role: clerkMetadata.role,
        hasProfileComplete: !!clerkMetadata.profileComplete,
        profileComplete: clerkMetadata.profileComplete,
        shouldRedirectToRoleSelection: !clerkMetadata.role || !clerkMetadata.profileComplete,
        isResellerInDB: !!reseller
      },
      recommendations: []
    }

    // Add recommendations
    if (!reseller && clerkMetadata.role === 'reseller') {
      response.recommendations.push('Clerk says user is reseller but no reseller found in database')
    }
    
    if (reseller && !clerkMetadata.role) {
      response.recommendations.push('Reseller exists in database but Clerk metadata missing role')
    }
    
    if (reseller && clerkMetadata.role === 'reseller' && !clerkMetadata.profileComplete) {
      response.recommendations.push('Reseller exists and role is set, but profileComplete flag is false')
    }

    return NextResponse.json(response)

  } catch (error) {
    console.error('Complete status check error:', error)
    return NextResponse.json({ 
      error: 'Failed to check status',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
