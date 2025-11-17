import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin'
import { prisma } from '@/lib/prisma'

// POST /api/admin/users/[id]/block - Block user
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requireAdmin()

    // Check if user is admin (can't block admins)
    const targetUser = await prisma.user.findUnique({
      where: { id: params.id },
      select: { role: true },
    })

    if (targetUser?.role === 'admin') {
      return NextResponse.json(
        { error: 'Cannot block admin users' },
        { status: 400 }
      )
    }

    const user = await prisma.user.update({
      where: { id: params.id },
      data: {
        status: 'blocked',
      },
    })

    return NextResponse.json({
      success: true,
      message: 'User blocked successfully',
      user,
    })
  } catch (error: any) {
    console.error('Block user error:', error)

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
