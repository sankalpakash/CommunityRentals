// OTP generation and sending utilities

/**
 * Generate a random 6-digit OTP
 */
export function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

/**
 * Send OTP via SMS using Twilio
 * @param mobile - 10-digit mobile number
 * @param otp - 6-digit OTP
 */
export async function sendOTP(mobile: string, otp: string): Promise<boolean> {
  // Check if Twilio credentials are configured
  const accountSid = process.env.TWILIO_ACCOUNT_SID
  const authToken = process.env.TWILIO_AUTH_TOKEN
  const twilioNumber = process.env.TWILIO_PHONE_NUMBER

  if (!accountSid || !authToken || !twilioNumber) {
    console.warn('Twilio credentials not configured. OTP:', otp)
    // In development, just log the OTP
    if (process.env.NODE_ENV === 'development') {
      console.log(`📱 OTP for ${mobile}: ${otp}`)
      return true
    }
    return false
  }

  try {
    // Import Twilio dynamically only when needed
    let twilio
    try {
      twilio = require('twilio')
    } catch (requireError) {
      console.error('Twilio module not installed:', requireError)
      return false
    }

    const client = twilio(accountSid, authToken)

    const message = await client.messages.create({
      body: `Your Community Rentals verification code is: ${otp}. Valid for 10 minutes.`,
      from: twilioNumber,
      to: `+91${mobile}`, // Assuming Indian numbers
    })

    console.log('OTP sent successfully:', message.sid)
    return true
  } catch (error) {
    console.error('Failed to send OTP:', error)
    return false
  }
}

/**
 * Mock OTP sender for development (logs to console)
 */
export async function sendOTPMock(mobile: string, otp: string): Promise<boolean> {
  console.log(`\n📱 === MOCK OTP ===`)
  console.log(`Mobile: ${mobile}`)
  console.log(`OTP: ${otp}`)
  console.log(`Valid for: 10 minutes`)
  console.log(`==================\n`)
  return true
}
