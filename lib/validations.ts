import { z } from 'zod'

// Mobile number validation (10 digits, Indian format)
export const mobileSchema = z.string()
  .regex(/^[0-9]{10}$/, 'Enter a valid 10-digit mobile number')

// OTP validation (4-6 digits)
export const otpSchema = z.string()
  .regex(/^[0-9]{4,6}$/, 'OTP must be 4-6 digits')

// Product title validation
export const titleSchema = z.string()
  .min(1, 'Title is required')
  .max(60, 'Title cannot exceed 60 characters')

// Description validation
export const descriptionSchema = z.string()
  .min(1, 'Description is required')
  .max(500, 'Description cannot exceed 500 characters')

// Price validation (positive integer, max 99,999)
export const priceSchema = z.number()
  .int('Price must be a whole number')
  .min(1, 'Enter a price between ₹1–99,999')
  .max(99999, 'Enter a price between ₹1–99,999')

// Email validation
export const emailSchema = z.string()
  .email('Enter a valid email address')
  .optional()

// Flat number validation
export const flatNumberSchema = z.string()
  .min(1, 'Flat number is required')

// User profile schema
export const profileSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  flatNumber: flatNumberSchema,
  block: z.string().optional(),
  email: emailSchema,
  preferWhatsApp: z.boolean().default(false),
  preferCall: z.boolean().default(false),
  preferEmail: z.boolean().default(false),
}).refine(
  (data) => data.preferWhatsApp || data.preferCall || data.preferEmail,
  {
    message: 'Select at least one contact preference',
    path: ['preferWhatsApp'],
  }
)

// Listing creation schema
export const listingSchema = z.object({
  title: titleSchema,
  description: descriptionSchema,
  categoryId: z.string().min(1, 'Category is required'),
  dailyPrice: priceSchema.optional(),
  weeklyPrice: priceSchema.optional(),
  monthlyPrice: priceSchema.optional(),
  availableFrom: z.date().optional(),
  availableUntil: z.date().optional(),
  photos: z.array(z.string()).min(1, 'Upload at least 1 photo').max(5, 'Maximum 5 photos allowed'),
}).refine(
  (data) => data.dailyPrice || data.weeklyPrice || data.monthlyPrice,
  {
    message: 'Set at least one rental price',
    path: ['dailyPrice'],
  }
)

// Category schema
export const categorySchema = z.object({
  name: z.string().min(1, 'Category name is required'),
  description: z.string().optional(),
  icon: z.string().optional(),
  color: z.string().optional(),
})

// Society schema
export const societySchema = z.object({
  name: z.string().min(1, 'Society name is required'),
  address: z.string().min(1, 'Address is required'),
  city: z.string().optional(),
  state: z.string().optional(),
  blocks: z.array(z.string()).min(1, 'Add at least one block'),
  adminContact: z.string().optional(),
  adminEmail: emailSchema,
  estimatedUsers: z.number().int().positive().optional(),
})

// Flag/Report schema
export const flagSchema = z.object({
  reason: z.enum(['spam', 'inappropriate', 'duplicate', 'suspicious', 'other']),
  description: z.string().optional(),
})
