'use client'

import { useState, FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import { signIn } from 'next-auth/react'
import { Button, Input, Card, CardBody } from '@/components/ui'

export default function SignInPage() {
  const router = useRouter()
  const [step, setStep] = useState<'mobile' | 'otp'>('mobile')
  const [mobile, setMobile] = useState('')
  const [otp, setOtp] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [otpSent, setOtpSent] = useState(false)

  // Request OTP
  const handleRequestOTP = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      const response = await fetch('/api/auth/request-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mobile }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to send OTP')
      }

      setOtpSent(true)
      setStep('otp')
    } catch (err: any) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  // Verify OTP and sign in
  const handleVerifyOTP = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      // First verify OTP
      const verifyResponse = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mobile, otp }),
      })

      const verifyData = await verifyResponse.json()

      if (!verifyResponse.ok) {
        throw new Error(verifyData.error || 'Invalid OTP')
      }

      // Then sign in with NextAuth
      const result = await signIn('mobile-otp', {
        mobile,
        otp,
        redirect: false,
      })

      if (result?.error) {
        throw new Error(result.error)
      }

      // Check if profile is complete
      if (!verifyData.user.isProfileComplete) {
        router.push('/profile/setup')
      } else {
        router.push('/dashboard')
      }
    } catch (err: any) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  const handleResendOTP = async () => {
    setOtp('')
    setError('')
    await handleRequestOTP(new Event('submit') as any)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Community Rentals
          </h1>
          <p className="text-gray-600">
            Sign in with your mobile number
          </p>
        </div>

        <Card>
          <CardBody>
            {/* Mobile Number Step */}
            {step === 'mobile' && (
              <form onSubmit={handleRequestOTP} className="space-y-4">
                <Input
                  label="Mobile Number"
                  type="tel"
                  placeholder="9876543210"
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value)}
                  maxLength={10}
                  pattern="[0-9]{10}"
                  required
                  helperText="Enter your 10-digit mobile number"
                  error={error}
                  disabled={isLoading}
                />

                <Button
                  type="submit"
                  variant="primary"
                  className="w-full"
                  isLoading={isLoading}
                  disabled={mobile.length !== 10}
                >
                  Send OTP
                </Button>

                <p className="text-xs text-gray-500 text-center">
                  By continuing, you agree to our Terms of Service and Privacy Policy
                </p>
              </form>
            )}

            {/* OTP Verification Step */}
            {step === 'otp' && (
              <form onSubmit={handleVerifyOTP} className="space-y-4">
                <div>
                  <p className="text-sm text-gray-600 mb-4">
                    We've sent a 6-digit OTP to <strong>{mobile}</strong>
                  </p>
                  <button
                    type="button"
                    onClick={() => setStep('mobile')}
                    className="text-sm text-primary hover:underline"
                  >
                    Change number
                  </button>
                </div>

                <Input
                  label="Enter OTP"
                  type="text"
                  placeholder="123456"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                  maxLength={6}
                  pattern="[0-9]{4,6}"
                  required
                  error={error}
                  disabled={isLoading}
                  autoFocus
                />

                <Button
                  type="submit"
                  variant="primary"
                  className="w-full"
                  isLoading={isLoading}
                  disabled={otp.length < 4}
                >
                  Verify & Sign In
                </Button>

                <div className="text-center">
                  <button
                    type="button"
                    onClick={handleResendOTP}
                    className="text-sm text-gray-600 hover:text-primary"
                    disabled={isLoading}
                  >
                    Didn't receive OTP? <span className="text-primary font-medium">Resend</span>
                  </button>
                </div>

                <p className="text-xs text-gray-500 text-center">
                  OTP is valid for 10 minutes
                </p>
              </form>
            )}
          </CardBody>
        </Card>

        {/* Development Helper */}
        {process.env.NODE_ENV === 'development' && otpSent && (
          <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-xs text-yellow-800 font-medium mb-1">
              Development Mode
            </p>
            <p className="text-xs text-yellow-700">
              Check your terminal/console for the OTP code
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
