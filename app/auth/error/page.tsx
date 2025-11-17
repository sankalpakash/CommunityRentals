'use client'

import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Card, CardBody } from '@/components/ui'

export default function AuthErrorPage() {
  const searchParams = useSearchParams()
  const error = searchParams.get('error')

  const errorMessages: Record<string, string> = {
    Configuration: 'There is a problem with the server configuration.',
    AccessDenied: 'Access denied. You do not have permission to sign in.',
    Verification: 'The verification link has expired or has already been used.',
    OTPExpired: 'Your OTP has expired. Please request a new one.',
    InvalidOTP: 'Invalid OTP. Please try again.',
    TooManyAttempts: 'Too many failed attempts. Please try again later.',
    AccountBlocked: 'Your account has been blocked. Please contact support.',
    Default: 'An error occurred during sign in. Please try again.',
  }

  const message = error ? errorMessages[error] || errorMessages.Default : errorMessages.Default

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 mb-4">
            <svg
              className="w-8 h-8 text-red-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Authentication Error
          </h1>
        </div>

        <Card>
          <CardBody>
            <p className="text-gray-700 text-center mb-6">{message}</p>

            <Link
              href="/auth/signin"
              className="block w-full text-center px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-hover transition-colors"
            >
              Try Again
            </Link>
          </CardBody>
        </Card>

        <div className="mt-6 text-center">
          <Link href="/" className="text-sm text-gray-600 hover:text-primary">
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  )
}
