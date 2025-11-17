import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin'
import { prisma } from '@/lib/prisma'

// GET /api/admin/stats - Get dashboard statistics
export async function GET(request: NextRequest) {
  try {
    await requireAdmin()

    const [
      totalUsers,
      verifiedUsers,
      totalListings,
      activeListings,
      pendingListings,
      totalContacts,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { verified: true } }),
      prisma.listing.count({ where: { NOT: { status: 'deleted' } } }),
      prisma.listing.count({ where: { status: 'active' } }),
      prisma.listing.count({ where: { status: 'pending' } }),
      prisma.contact.count(),
    ])

    return NextResponse.json({
      totalUsers,
      verifiedUsers,
      totalListings,
      activeListings,
      pendingListings,
      totalContacts,
    })
  } catch (error: any) {
    console.error('Get admin stats error:', error)

    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (error.message === 'Forbidden: Admin access required') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
