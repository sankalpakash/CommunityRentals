import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// POST /api/contacts - Track when a renter contacts an owner
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    // Require authentication for tracking contacts
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Please sign in to contact the owner' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { listingId, ownerId, method } = body

    // Validate required fields
    if (!listingId || !ownerId || !method) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Validate method
    if (!['whatsapp', 'call', 'email'].includes(method)) {
      return NextResponse.json(
        { error: 'Invalid contact method' },
        { status: 400 }
      )
    }

    // Create contact record
    const contact = await prisma.contact.create({
      data: {
        listingId,
        ownerId,
        renterId: session.user.id,
        method,
      },
    })

    return NextResponse.json({
      success: true,
      message: 'Contact tracked successfully',
      contact: {
        id: contact.id,
        method: contact.method,
        createdAt: contact.createdAt,
      },
    })
  } catch (error) {
    console.error('Create contact error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// GET /api/contacts - Get contacts for current user (as owner)
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const listingId = searchParams.get('listingId')

    // Build where clause
    const where: any = {
      ownerId: session.user.id,
    }

    if (listingId) {
      where.listingId = listingId
    }

    const contacts = await prisma.contact.findMany({
      where,
      include: {
        renter: {
          select: {
            id: true,
            name: true,
            flatNumber: true,
            block: true,
          },
        },
        listing: {
          select: {
            id: true,
            title: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    return NextResponse.json(contacts)
  } catch (error) {
    console.error('Get contacts error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
