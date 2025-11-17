import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin'
import { prisma } from '@/lib/prisma'

// POST /api/admin/listings/[id]/reject - Reject listing
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requireAdmin()

    const body = await request.json()
    const { reason } = body

    const listing = await prisma.listing.update({
      where: { id: params.id },
      data: {
        status: 'rejected',
        rejectionReason: reason || 'Does not meet community guidelines',
      },
    })

    return NextResponse.json({
      success: true,
      message: 'Listing rejected',
      listing,
    })
  } catch (error: any) {
    console.error('Reject listing error:', error)

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
