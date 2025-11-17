import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { mobileSchema, otpSchema } from '@/lib/validations'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { mobile, otp } = body

    // Validate inputs
    const mobileValidation = mobileSchema.safeParse(mobile)
    if (!mobileValidation.success) {
      return NextResponse.json(
        { error: mobileValidation.error.issues[0].message },
        { status: 400 }
      )
    }

    const otpValidation = otpSchema.safeParse(otp)
    if (!otpValidation.success) {
      return NextResponse.json(
        { error: otpValidation.error.issues[0].message },
        { status: 400 }
      )
    }

    // Find user
    const user = await prisma.user.findUnique({
      where: { mobile },
    })

    if (!user) {
      return NextResponse.json(
        { error: 'User not found. Please request OTP first.' },
        { status: 404 }
      )
    }

    // Check if blocked
    if (user.otpBlockedUntil && user.otpBlockedUntil > new Date()) {
      return NextResponse.json(
        { error: 'Too many failed attempts. Try again later.' },
        { status: 429 }
      )
    }

    // Verify OTP
    if (!user.otp || user.otp !== otp) {
      const attempts = user.otpAttempts + 1
      const updateData: any = {
        otpAttempts: attempts,
      }

      if (attempts >= 3) {
        updateData.otpBlockedUntil = new Date(Date.now() + 5 * 60 * 1000)
        updateData.otpAttempts = 0
      }

      await prisma.user.update({
        where: { id: user.id },
        data: updateData,
      })

      return NextResponse.json(
        { error: 'Invalid OTP', attemptsLeft: 3 - attempts },
        { status: 400 }
      )
    }

    // Check expiry
    if (user.otpExpiry && user.otpExpiry < new Date()) {
      return NextResponse.json(
        { error: 'OTP expired. Request a new one.' },
        { status: 400 }
      )
    }

    // OTP is valid - check if profile is complete
    const isProfileComplete = !!(user.name && user.flatNumber)

    return NextResponse.json({
      success: true,
      message: 'OTP verified successfully',
      user: {
        id: user.id,
        mobile: user.mobile,
        name: user.name,
        isProfileComplete,
      },
    })
  } catch (error) {
    console.error('Verify OTP error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
