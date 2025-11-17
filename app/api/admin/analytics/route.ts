import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin'
import { prisma } from '@/lib/prisma'

// GET /api/admin/analytics - Get platform analytics
export async function GET(request: NextRequest) {
  try {
    await requireAdmin()

    const now = new Date()
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)

    // Top listings by contact count
    const topListings = await prisma.listing.findMany({
      where: {
        status: 'active',
      },
      include: {
        category: {
          select: {
            name: true,
            icon: true,
          },
        },
        _count: {
          select: {
            contacts: true,
          },
        },
      },
      orderBy: {
        contacts: {
          _count: 'desc',
        },
      },
      take: 10,
    })

    // Top owners by listing count
    const topOwners = await prisma.user.findMany({
      where: {
        listings: {
          some: {
            status: { in: ['active', 'paused'] },
          },
        },
      },
      include: {
        _count: {
          select: {
            listings: true,
          },
        },
      },
      orderBy: {
        listings: {
          _count: 'desc',
        },
      },
      take: 10,
    })

    // Top categories by listing count
    const topCategories = await prisma.category.findMany({
      include: {
        _count: {
          select: {
            listings: true,
          },
        },
      },
      orderBy: {
        listings: {
          _count: 'desc',
        },
      },
      take: 10,
    })

    // Recent activity
    const [
      newUsers7Days,
      newListings7Days,
      totalContacts7Days,
      newUsers30Days,
      newListings30Days,
      totalContacts30Days,
    ] = await Promise.all([
      prisma.user.count({
        where: {
          createdAt: {
            gte: sevenDaysAgo,
          },
        },
      }),
      prisma.listing.count({
        where: {
          createdAt: {
            gte: sevenDaysAgo,
          },
        },
      }),
      prisma.contact.count({
        where: {
          createdAt: {
            gte: sevenDaysAgo,
          },
        },
      }),
      prisma.user.count({
        where: {
          createdAt: {
            gte: thirtyDaysAgo,
          },
        },
      }),
      prisma.listing.count({
        where: {
          createdAt: {
            gte: thirtyDaysAgo,
          },
        },
      }),
      prisma.contact.count({
        where: {
          createdAt: {
            gte: thirtyDaysAgo,
          },
        },
      }),
    ])

    return NextResponse.json({
      topListings: topListings.map((listing) => ({
        id: listing.id,
        title: listing.title,
        category: listing.category,
        contactCount: listing._count.contacts,
      })),
      topOwners: topOwners.map((owner) => ({
        id: owner.id,
        name: owner.name,
        flatNumber: owner.flatNumber,
        listingCount: owner._count.listings,
      })),
      topCategories: topCategories.map((category) => ({
        id: category.id,
        name: category.name,
        icon: category.icon,
        listingCount: category._count.listings,
      })),
      recentActivity: {
        last7Days: {
          newUsers: newUsers7Days,
          newListings: newListings7Days,
          totalContacts: totalContacts7Days,
        },
        last30Days: {
          newUsers: newUsers30Days,
          newListings: newListings30Days,
          totalContacts: totalContacts30Days,
        },
      },
    })
  } catch (error: any) {
    console.error('Get analytics error:', error)

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
