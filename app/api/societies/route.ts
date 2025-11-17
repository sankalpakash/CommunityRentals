import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/societies - Get all societies
export async function GET(request: NextRequest) {
  try {
    const societies = await prisma.society.findMany({
      orderBy: {
        name: 'asc',
      },
      select: {
        id: true,
        name: true,
        address: true,
        city: true,
        state: true,
        blocks: true,
      },
    })

    return NextResponse.json(societies)
  } catch (error) {
    console.error('Get societies error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
