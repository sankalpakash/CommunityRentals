import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { prisma } from './prisma'
import { mobileSchema, otpSchema } from './validations'

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      id: 'mobile-otp',
      name: 'Mobile OTP',
      credentials: {
        mobile: { label: 'Mobile', type: 'text' },
        otp: { label: 'OTP', type: 'text' },
      },
      async authorize(credentials) {
        if (!credentials?.mobile || !credentials?.otp) {
          throw new Error('Mobile and OTP are required')
        }

        // Validate mobile format
        const mobileValidation = mobileSchema.safeParse(credentials.mobile)
        if (!mobileValidation.success) {
          throw new Error('Invalid mobile number format')
        }

        // Validate OTP format
        const otpValidation = otpSchema.safeParse(credentials.otp)
        if (!otpValidation.success) {
          throw new Error('Invalid OTP format')
        }

        // Find user by mobile
        const user = await prisma.user.findUnique({
          where: { mobile: credentials.mobile },
          include: { society: true },
        })

        if (!user) {
          throw new Error('User not found')
        }

        // Check if user is blocked
        if (user.status === 'blocked') {
          throw new Error('Account is blocked. Contact admin.')
        }

        // Check if OTP is blocked
        if (user.otpBlockedUntil && user.otpBlockedUntil > new Date()) {
          throw new Error('Too many failed attempts. Try again later.')
        }

        // Verify OTP
        if (!user.otp || user.otp !== credentials.otp) {
          // Increment failed attempts
          const attempts = user.otpAttempts + 1
          const updateData: any = {
            otpAttempts: attempts,
          }

          // Block after 3 failed attempts
          if (attempts >= 3) {
            updateData.otpBlockedUntil = new Date(Date.now() + 5 * 60 * 1000) // 5 minutes
            updateData.otpAttempts = 0
          }

          await prisma.user.update({
            where: { id: user.id },
            data: updateData,
          })

          throw new Error('Invalid OTP')
        }

        // Check OTP expiry
        if (user.otpExpiry && user.otpExpiry < new Date()) {
          throw new Error('OTP expired. Request a new one.')
        }

        // Clear OTP and update last login
        await prisma.user.update({
          where: { id: user.id },
          data: {
            otp: null,
            otpExpiry: null,
            otpAttempts: 0,
            lastLoginAt: new Date(),
          },
        })

        return {
          id: user.id,
          mobile: user.mobile,
          name: user.name,
          email: user.email,
          role: user.role,
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.mobile = user.mobile
        token.role = user.role
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
        session.user.mobile = token.mobile as string
        session.user.role = token.role as string
      }
      return session
    },
  },
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
  },
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  secret: process.env.NEXTAUTH_SECRET,
}
