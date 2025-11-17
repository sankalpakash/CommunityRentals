'use client'

import { useState, FormEvent, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import {
  Button,
  Input,
  Card,
  CardBody,
  CardHeader,
  PhotoUpload,
} from '@/components/ui'

interface Category {
  id: string
  name: string
  icon?: string
}

export default function NewListingPage() {
  const router = useRouter()
  const { data: session, status } = useSession()
  const [isLoading, setIsLoading] = useState(false)
  const [categories, setCategories] = useState<Category[]>([])
  const [error, setError] = useState('')

  // Form fields
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    categoryId: '',
    photos: [] as string[],
    dailyPrice: '',
    weeklyPrice: '',
    monthlyPrice: '',
    availableFrom: '',
    availableUntil: '',
  })

  // Redirect if not authenticated
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin')
    }
  }, [status, router])

  // Fetch categories on mount
  useEffect(() => {
    fetchCategories()
  }, [])

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/categories')
      if (response.ok) {
        const data = await response.json()
        setCategories(data)
      }
    } catch (error) {
      console.error('Failed to fetch categories:', error)
    }
  }

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    // Validate at least one price
    if (!formData.dailyPrice && !formData.weeklyPrice && !formData.monthlyPrice) {
      setError('Set at least one rental price')
      setIsLoading(false)
      return
    }

    // Validate at least one photo
    if (formData.photos.length === 0) {
      setError('Upload at least 1 photo')
      setIsLoading(false)
      return
    }

    try {
      const payload = {
        title: formData.title,
        description: formData.description,
        categoryId: formData.categoryId,
        photos: formData.photos,
        dailyPrice: formData.dailyPrice ? parseInt(formData.dailyPrice) : null,
        weeklyPrice: formData.weeklyPrice ? parseInt(formData.weeklyPrice) : null,
        monthlyPrice: formData.monthlyPrice ? parseInt(formData.monthlyPrice) : null,
        availableFrom: formData.availableFrom
          ? new Date(formData.availableFrom).toISOString()
          : null,
        availableUntil: formData.availableUntil
          ? new Date(formData.availableUntil).toISOString()
          : null,
      }

      const response = await fetch('/api/listings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create listing')
      }

      // Redirect to dashboard
      router.push('/dashboard?success=listing_created')
    } catch (err: any) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin h-12 w-12 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.back()}
            className="flex items-center text-gray-600 hover:text-primary mb-4"
          >
            <svg
              className="w-5 h-5 mr-1"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            Back
          </button>
          <h1 className="text-3xl font-bold text-gray-900">List Your Item</h1>
          <p className="text-gray-600 mt-2">
            Share your items with the community and earn rental income
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <h2 className="text-xl font-semibold">Basic Information</h2>
            </CardHeader>
            <CardBody className="space-y-4">
              <Input
                label="Product Title"
                type="text"
                placeholder="e.g., Wooden Dining Table (6-seater)"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                required
                maxLength={60}
                helperText={`${formData.title.length}/60 characters`}
              />

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  rows={4}
                  placeholder="Describe your item, its condition, and any rules for usage..."
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  required
                  maxLength={500}
                />
                <p className="mt-1 text-sm text-gray-500">
                  {formData.description.length}/500 characters
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category <span className="text-red-500">*</span>
                </label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  value={formData.categoryId}
                  onChange={(e) => handleInputChange('categoryId', e.target.value)}
                  required
                >
                  <option value="">Select a category</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.icon ? `${category.icon} ` : ''}
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>
            </CardBody>
          </Card>

          {/* Photos */}
          <Card>
            <CardHeader>
              <h2 className="text-xl font-semibold">Photos</h2>
              <p className="text-sm text-gray-600 mt-1">
                Upload 1-5 clear photos of your item
              </p>
            </CardHeader>
            <CardBody>
              <PhotoUpload
                photos={formData.photos}
                onChange={(photos) => handleInputChange('photos', photos)}
                maxPhotos={5}
                maxSizeMB={5}
              />
            </CardBody>
          </Card>

          {/* Pricing */}
          <Card>
            <CardHeader>
              <h2 className="text-xl font-semibold">Rental Pricing</h2>
              <p className="text-sm text-gray-600 mt-1">
                Set prices for different rental periods (at least one required)
              </p>
            </CardHeader>
            <CardBody className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Input
                  label="Daily Price (₹)"
                  type="number"
                  placeholder="200"
                  value={formData.dailyPrice}
                  onChange={(e) => handleInputChange('dailyPrice', e.target.value)}
                  min="1"
                  max="99999"
                />
                <Input
                  label="Weekly Price (₹)"
                  type="number"
                  placeholder="1000"
                  value={formData.weeklyPrice}
                  onChange={(e) => handleInputChange('weeklyPrice', e.target.value)}
                  min="1"
                  max="99999"
                />
                <Input
                  label="Monthly Price (₹)"
                  type="number"
                  placeholder="3000"
                  value={formData.monthlyPrice}
                  onChange={(e) => handleInputChange('monthlyPrice', e.target.value)}
                  min="1"
                  max="99999"
                />
              </div>
              <p className="text-sm text-gray-500">
                Leave empty for rental periods you don't want to offer
              </p>
            </CardBody>
          </Card>

          {/* Availability (Optional) */}
          <Card>
            <CardHeader>
              <h2 className="text-xl font-semibold">Availability (Optional)</h2>
              <p className="text-sm text-gray-600 mt-1">
                Set when your item is available for rent
              </p>
            </CardHeader>
            <CardBody className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Available From"
                  type="date"
                  value={formData.availableFrom}
                  onChange={(e) =>
                    handleInputChange('availableFrom', e.target.value)
                  }
                />
                <Input
                  label="Available Until"
                  type="date"
                  value={formData.availableUntil}
                  onChange={(e) =>
                    handleInputChange('availableUntil', e.target.value)
                  }
                />
              </div>
              <p className="text-sm text-gray-500">
                Leave empty if always available
              </p>
            </CardBody>
          </Card>

          {/* Error Message */}
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {/* Submit Buttons */}
          <div className="flex gap-4">
            <Button
              type="button"
              variant="secondary"
              onClick={() => router.back()}
              disabled={isLoading}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              isLoading={isLoading}
              className="flex-1"
            >
              Create Listing
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
