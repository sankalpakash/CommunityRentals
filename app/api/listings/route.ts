import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { listingSchema } from '@/lib/validations'

// GET /api/listings - Get all listings (with filters)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)

    const search = searchParams.get('search')
    const categoryId = searchParams.get('categoryId')
    const minPrice = searchParams.get('minPrice')
    const maxPrice = searchParams.get('maxPrice')
    const frequency = searchParams.get('frequency') // daily, weekly, monthly
    const availableNow = searchParams.get('availableNow') === 'true'
    const status = searchParams.get('status') || 'active'
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')

    // Build where clause
    const where: any = {
      status,
    }

    // Search by title/description
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ]
    }

    // Filter by category
    if (categoryId) {
      where.categoryId = categoryId
    }

    // Filter by price
    if (minPrice || maxPrice) {
      const priceFilter: any = {}

      if (frequency === 'daily') {
        if (minPrice) priceFilter.gte = parseInt(minPrice)
        if (maxPrice) priceFilter.lte = parseInt(maxPrice)
        where.dailyPrice = priceFilter
      } else if (frequency === 'weekly') {
        if (minPrice) priceFilter.gte = parseInt(minPrice)
        if (maxPrice) priceFilter.lte = parseInt(maxPrice)
        where.weeklyPrice = priceFilter
      } else if (frequency === 'monthly') {
        if (minPrice) priceFilter.gte = parseInt(minPrice)
        if (maxPrice) priceFilter.lte = parseInt(maxPrice)
        where.monthlyPrice = priceFilter
      }
    }

    // Filter by availability
    if (availableNow) {
      const now = new Date()
      where.OR = [
        { availableFrom: null, availableUntil: null }, // Always available
        { availableFrom: { lte: now }, availableUntil: { gte: now } }, // Available now
        { availableFrom: { lte: now }, availableUntil: null }, // Started, no end
      ]
    }

    const listings = await prisma.listing.findMany({
      where,
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            flatNumber: true,
            block: true,
            verified: true,
          },
        },
        category: {
          select: {
            id: true,
            name: true,
            icon: true,
            color: true,
          },
        },
        _count: {
          select: {
            contacts: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: limit,
      skip: offset,
    })

    return NextResponse.json(listings)
  } catch (error) {
    console.error('Get listings error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST /api/listings - Create new listing
export async function POST(request: NextRequest) {
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
    const validation = listingSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.issues[0].message },
        { status: 400 }
      )
    }

    const data = validation.data

    // Get user's society
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { societyId: true },
    })

    // Create listing
    const listing = await prisma.listing.create({
      data: {
        ownerId: session.user.id,
        title: data.title,
        description: data.description,
        categoryId: data.categoryId,
        photos: data.photos,
        dailyPrice: data.dailyPrice || null,
        weeklyPrice: data.weeklyPrice || null,
        monthlyPrice: data.monthlyPrice || null,
        availableFrom: data.availableFrom || null,
        availableUntil: data.availableUntil || null,
        societyId: user?.societyId || null,
        status: 'pending', // Requires admin approval
      },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            flatNumber: true,
            block: true,
            verified: true,
          },
        },
        category: {
          select: {
            id: true,
            name: true,
            icon: true,
            color: true,
          },
        },
      },
    })

    return NextResponse.json({
      success: true,
      message: 'Listing created successfully and pending approval',
      listing,
    })
  } catch (error) {
    console.error('Create listing error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
