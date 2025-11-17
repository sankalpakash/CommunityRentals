import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { profileSchema } from '@/lib/validations'

// GET /api/profile - Get current user's profile
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: {
        society: true,
      },
    })

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      id: user.id,
      mobile: user.mobile,
      name: user.name,
      email: user.email,
      flatNumber: user.flatNumber,
      block: user.block,
      society: user.society,
      preferWhatsApp: user.preferWhatsApp,
      preferCall: user.preferCall,
      preferEmail: user.preferEmail,
      verified: user.verified,
      status: user.status,
      role: user.role,
      createdAt: user.createdAt,
    })
  } catch (error) {
    console.error('Get profile error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// PUT /api/profile - Update user profile
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()

    // Validate input
    const validation = profileSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.errors[0].message },
        { status: 400 }
      )
    }

    const data = validation.data

    // Check if society exists
    if (body.societyId) {
      const society = await prisma.society.findUnique({
        where: { id: body.societyId },
      })

      if (!society) {
        return NextResponse.json(
          { error: 'Invalid society selected' },
          { status: 400 }
        )
      }
    }

    // Update user
    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        name: data.name,
        email: data.email || null,
        flatNumber: data.flatNumber,
        block: data.block || null,
        societyId: body.societyId || null,
        preferWhatsApp: data.preferWhatsApp,
        preferCall: data.preferCall,
        preferEmail: data.preferEmail,
      },
      include: {
        society: true,
      },
    })

    return NextResponse.json({
      success: true,
      message: 'Profile updated successfully',
      user: {
        id: updatedUser.id,
        mobile: updatedUser.mobile,
        name: updatedUser.name,
        email: updatedUser.email,
        flatNumber: updatedUser.flatNumber,
        block: updatedUser.block,
        society: updatedUser.society,
        preferWhatsApp: updatedUser.preferWhatsApp,
        preferCall: updatedUser.preferCall,
        preferEmail: updatedUser.preferEmail,
        verified: updatedUser.verified,
        status: updatedUser.status,
        role: updatedUser.role,
      },
    })
  } catch (error) {
    console.error('Update profile error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
