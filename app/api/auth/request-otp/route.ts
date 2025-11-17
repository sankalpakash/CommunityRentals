import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { mobileSchema } from '@/lib/validations'
import { generateOTP, sendOTP, sendOTPMock } from '@/lib/otp'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { mobile } = body

    // Validate mobile number
    const validation = mobileSchema.safeParse(mobile)
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.errors[0].message },
        { status: 400 }
      )
    }

    // Check rate limiting (5 requests per hour per mobile)
    const recentOTPs = await prisma.user.findUnique({
      where: { mobile },
      select: { updatedAt: true, otpBlockedUntil: true },
    })

    if (recentOTPs?.otpBlockedUntil && recentOTPs.otpBlockedUntil > new Date()) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { status: 429 }
      )
    }

    // Generate OTP
    const otp = generateOTP()
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000) // 10 minutes

    // Find or create user
    const user = await prisma.user.upsert({
      where: { mobile },
      update: {
        otp,
        otpExpiry,
        otpAttempts: 0,
      },
      create: {
        mobile,
        otp,
        otpExpiry,
        status: 'active',
      },
    })

    // Send OTP via SMS
    const sent = process.env.NODE_ENV === 'development'
      ? await sendOTPMock(mobile, otp)
      : await sendOTP(mobile, otp)

    if (!sent) {
      return NextResponse.json(
        { error: 'Failed to send OTP. Please try again.' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'OTP sent successfully',
      expiresIn: 600, // 10 minutes in seconds
    })
  } catch (error) {
    console.error('Request OTP error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
