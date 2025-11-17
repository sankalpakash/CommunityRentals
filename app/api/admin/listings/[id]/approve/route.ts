import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin'
import { prisma } from '@/lib/prisma'

// POST /api/admin/listings/[id]/approve - Approve listing
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await requireAdmin()

    const listing = await prisma.listing.update({
      where: { id: params.id },
      data: {
        status: 'active',
        approvedAt: new Date(),
        approvedBy: session.user.id,
        rejectionReason: null,
      },
    })

    return NextResponse.json({
      success: true,
      message: 'Listing approved successfully',
      listing,
    })
  } catch (error: any) {
    console.error('Approve listing error:', error)

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
