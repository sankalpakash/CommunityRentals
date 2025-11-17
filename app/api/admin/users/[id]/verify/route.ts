import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin'
import { prisma } from '@/lib/prisma'

// POST /api/admin/users/[id]/verify - Verify user
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await requireAdmin()

    const user = await prisma.user.update({
      where: { id: params.id },
      data: {
        verified: true,
        verifiedAt: new Date(),
        verifiedBy: session.user.id,
      },
    })

    return NextResponse.json({
      success: true,
      message: 'User verified successfully',
      user,
    })
  } catch (error: any) {
    console.error('Verify user error:', error)

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
