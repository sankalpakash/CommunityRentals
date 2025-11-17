'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Button, Card, CardBody, Badge, Spinner } from '@/components/ui'

interface Category {
  id: string
  name: string
  icon?: string
  color?: string
}

interface Listing {
  id: string
  title: string
  description: string
  photos: string[]
  dailyPrice: number | null
  weeklyPrice: number | null
  monthlyPrice: number | null
  category: {
    id: string
    name: string
    icon?: string
  }
  owner: {
    id: string
    name: string
    flatNumber: string
    block?: string
    verified: boolean
  }
  _count: {
    contacts: number
  }
}

export default function BrowsePage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [listings, setListings] = useState<Listing[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  // Filter states
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [selectedFrequency, setSelectedFrequency] = useState<'daily' | 'weekly' | 'monthly' | ''>('')
  const [minPrice, setMinPrice] = useState('')
  const [maxPrice, setMaxPrice] = useState('')
  const [availableNow, setAvailableNow] = useState(false)

  useEffect(() => {
    fetchCategories()
  }, [])

  useEffect(() => {
    fetchListings()
  }, [searchQuery, selectedCategory, selectedFrequency, minPrice, maxPrice, availableNow])

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

  const fetchListings = async () => {
    setIsLoading(true)
    setError('')

    try {
      const params = new URLSearchParams()
      params.append('status', 'active')

      if (searchQuery) params.append('search', searchQuery)
      if (selectedCategory) params.append('categoryId', selectedCategory)
      if (selectedFrequency) params.append('frequency', selectedFrequency)
      if (minPrice) params.append('minPrice', minPrice)
      if (maxPrice) params.append('maxPrice', maxPrice)
      if (availableNow) params.append('availableNow', 'true')

      const response = await fetch(`/api/listings?${params.toString()}`)
      if (response.ok) {
        const data = await response.json()
        setListings(data)
      } else {
        setError('Failed to load listings')
      }
    } catch (error) {
      console.error('Failed to fetch listings:', error)
      setError('Failed to load listings')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    fetchListings()
  }

  const clearFilters = () => {
    setSearchQuery('')
    setSelectedCategory('')
    setSelectedFrequency('')
    setMinPrice('')
    setMaxPrice('')
    setAvailableNow(false)
  }

  const formatPrice = (listing: Listing) => {
    if (selectedFrequency === 'daily' && listing.dailyPrice) {
      return `₹${listing.dailyPrice}/day`
    }
    if (selectedFrequency === 'weekly' && listing.weeklyPrice) {
      return `₹${listing.weeklyPrice}/week`
    }
    if (selectedFrequency === 'monthly' && listing.monthlyPrice) {
      return `₹${listing.monthlyPrice}/month`
    }

    // Default: show the cheapest option
    if (listing.dailyPrice) return `₹${listing.dailyPrice}/day`
    if (listing.weeklyPrice) return `₹${listing.weeklyPrice}/week`
    if (listing.monthlyPrice) return `₹${listing.monthlyPrice}/month`
    return 'Price not set'
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <Link href="/" className="text-2xl font-bold text-primary">
              Community Rentals
            </Link>
            <div className="flex gap-3">
              <Link href="/dashboard">
                <Button variant="outline">My Listings</Button>
              </Link>
              <Link href="/auth/signin">
                <Button variant="primary">Sign In</Button>
              </Link>
            </div>
          </div>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="flex gap-2">
            <input
              type="text"
              placeholder="Search for items..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            />
            <Button type="submit" variant="primary">
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </Button>
          </form>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Filters Sidebar */}
          <aside className="lg:col-span-1">
            <Card>
              <CardBody>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-lg">Filters</h3>
                  <button
                    onClick={clearFilters}
                    className="text-sm text-primary hover:underline"
                  >
                    Clear All
                  </button>
                </div>

                <div className="space-y-6">
                  {/* Category Filter */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Category
                    </label>
                    <select
                      value={selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                      <option value="">All Categories</option>
                      {categories.map((category) => (
                        <option key={category.id} value={category.id}>
                          {category.icon ? `${category.icon} ` : ''}
                          {category.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Rental Frequency Filter */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Rental Period
                    </label>
                    <div className="space-y-2">
                      {[
                        { value: '', label: 'All' },
                        { value: 'daily', label: 'Daily' },
                        { value: 'weekly', label: 'Weekly' },
                        { value: 'monthly', label: 'Monthly' },
                      ].map((option) => (
                        <label key={option.value} className="flex items-center">
                          <input
                            type="radio"
                            name="frequency"
                            value={option.value}
                            checked={selectedFrequency === option.value}
                            onChange={(e) =>
                              setSelectedFrequency(e.target.value as any)
                            }
                            className="h-4 w-4 text-primary focus:ring-primary border-gray-300"
                          />
                          <span className="ml-2 text-gray-700">{option.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Price Range Filter */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Price Range (₹)
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="number"
                        placeholder="Min"
                        value={minPrice}
                        onChange={(e) => setMinPrice(e.target.value)}
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                        min="0"
                      />
                      <input
                        type="number"
                        placeholder="Max"
                        value={maxPrice}
                        onChange={(e) => setMaxPrice(e.target.value)}
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                        min="0"
                      />
                    </div>
                  </div>

                  {/* Availability Filter */}
                  <div>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={availableNow}
                        onChange={(e) => setAvailableNow(e.target.checked)}
                        className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                      />
                      <span className="ml-2 text-gray-700">Available Now</span>
                    </label>
                  </div>
                </div>
              </CardBody>
            </Card>
          </aside>

          {/* Listings Grid */}
          <main className="lg:col-span-3">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900">
                Browse Rental Items
              </h2>
              <p className="text-gray-600 mt-1">
                {listings.length} items available
              </p>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-600">{error}</p>
              </div>
            )}

            {isLoading ? (
              <div className="flex justify-center items-center py-20">
                <Spinner size="lg" className="text-primary" />
              </div>
            ) : listings.length === 0 ? (
              <Card>
                <CardBody className="text-center py-12">
                  <svg
                    className="w-16 h-16 text-gray-400 mx-auto mb-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                    />
                  </svg>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    No Items Found
                  </h3>
                  <p className="text-gray-600 mb-6">
                    Try adjusting your filters or search terms
                  </p>
                  <Button variant="primary" onClick={clearFilters}>
                    Clear Filters
                  </Button>
                </CardBody>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {listings.map((listing) => (
                  <Link
                    key={listing.id}
                    href={`/listings/${listing.id}`}
                    className="group"
                  >
                    <Card className="h-full hover:shadow-lg transition-shadow">
                      <CardBody className="p-0">
                        {/* Image */}
                        <div className="relative h-48 bg-gray-200 rounded-t-lg overflow-hidden">
                          <img
                            src={listing.photos[0] || '/placeholder.png'}
                            alt={listing.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                          />
                          {listing.owner.verified && (
                            <div className="absolute top-2 right-2 bg-primary text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
                              <svg
                                className="w-3 h-3"
                                fill="currentColor"
                                viewBox="0 0 20 20"
                              >
                                <path
                                  fillRule="evenodd"
                                  d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                  clipRule="evenodd"
                                />
                              </svg>
                              Verified
                            </div>
                          )}
                        </div>

                        {/* Content */}
                        <div className="p-4">
                          <div className="flex items-start justify-between mb-2">
                            <h3 className="font-semibold text-gray-900 line-clamp-2 flex-1">
                              {listing.title}
                            </h3>
                          </div>

                          <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                            {listing.description}
                          </p>

                          <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
                            <span className="inline-flex items-center">
                              {listing.category.icon && (
                                <span className="mr-1">{listing.category.icon}</span>
                              )}
                              {listing.category.name}
                            </span>
                            <span>•</span>
                            <span>
                              {listing.owner.flatNumber}
                              {listing.owner.block && `-${listing.owner.block}`}
                            </span>
                          </div>

                          <div className="flex items-center justify-between">
                            <div className="text-lg font-bold text-primary">
                              {formatPrice(listing)}
                            </div>
                            <Badge variant="info">
                              {listing._count.contacts} inquiries
                            </Badge>
                          </div>
                        </div>
                      </CardBody>
                    </Card>
                  </Link>
                ))}
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  )
}
