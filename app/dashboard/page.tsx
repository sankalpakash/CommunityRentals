'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSession, signOut } from 'next-auth/react'
import { Card, CardBody, Button, Badge, Spinner } from '@/components/ui'
import Link from 'next/link'

interface Listing {
  id: string
  title: string
  photos: string[]
  status: string
  dailyPrice: number | null
  weeklyPrice: number | null
  monthlyPrice: number | null
  category: {
    name: string
    icon?: string
  }
  createdAt: string
  _count: {
    contacts: number
  }
}

export default function DashboardPage() {
  const router = useRouter()
  const { data: session, status } = useSession()
  const [listings, setListings] = useState<Listing[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  // Redirect if not authenticated
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin')
    }
  }, [status, router])

  // Fetch user's listings
  useEffect(() => {
    if (status === 'authenticated') {
      fetchListings()
    }
  }, [status])

  const fetchListings = async () => {
    try {
      const response = await fetch('/api/listings/my-listings')
      if (response.ok) {
        const data = await response.json()
        setListings(data)
      } else {
        const errorData = await response.json()
        setError(errorData.error || 'Failed to load listings')
      }
    } catch (error) {
      console.error('Failed to fetch listings:', error)
      setError('Failed to load listings')
    } finally {
      setIsLoading(false)
    }
  }

  const handlePauseListing = async (listingId: string) => {
    try {
      const response = await fetch(`/api/listings/${listingId}/pause`, {
        method: 'POST',
      })

      if (response.ok) {
        fetchListings() // Refresh list
      }
    } catch (error) {
      console.error('Failed to pause listing:', error)
    }
  }

  const handleUnpauseListing = async (listingId: string) => {
    try {
      const response = await fetch(`/api/listings/${listingId}/unpause`, {
        method: 'POST',
      })

      if (response.ok) {
        fetchListings() // Refresh list
      }
    } catch (error) {
      console.error('Failed to unpause listing:', error)
    }
  }

  const handleDeleteListing = async (listingId: string) => {
    if (
      !confirm('Are you sure you want to delete this listing? This cannot be undone.')
    ) {
      return
    }

    try {
      const response = await fetch(`/api/listings/${listingId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        fetchListings() // Refresh list
      }
    } catch (error) {
      console.error('Failed to delete listing:', error)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge variant="success">Active</Badge>
      case 'pending':
        return <Badge variant="warning">Pending Approval</Badge>
      case 'paused':
        return <Badge variant="default">Paused</Badge>
      case 'rejected':
        return <Badge variant="danger">Rejected</Badge>
      default:
        return <Badge variant="default">{status}</Badge>
    }
  }

  const formatPrice = (listing: Listing) => {
    const prices = []
    if (listing.dailyPrice) prices.push(`₹${listing.dailyPrice}/day`)
    if (listing.weeklyPrice) prices.push(`₹${listing.weeklyPrice}/week`)
    if (listing.monthlyPrice) prices.push(`₹${listing.monthlyPrice}/month`)
    return prices.join(' • ')
  }

  if (status === 'loading' || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Spinner size="lg" className="mx-auto mb-4 text-primary" />
          <p className="text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold text-primary">
            Community Rentals
          </Link>
          <div className="flex items-center gap-4">
            <span className="text-gray-700">
              Welcome, {session?.user?.name || 'User'}!
            </span>
            <Button variant="outline" size="sm" onClick={() => signOut()}>
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Dashboard Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">My Listings</h1>
            <p className="text-gray-600 mt-1">
              Manage your rental items and track inquiries
            </p>
          </div>
          <Link href="/listings/new">
            <Button variant="primary">
              <svg
                className="w-5 h-5 mr-2 inline-block"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
              List New Item
            </Button>
          </Link>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600">{error}</p>
          </div>
        )}

        {/* Listings */}
        {listings.length === 0 ? (
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
                No Listings Yet
              </h3>
              <p className="text-gray-600 mb-6">
                Start by listing your first item for rent
              </p>
              <Link href="/listings/new">
                <Button variant="primary">List Your First Item</Button>
              </Link>
            </CardBody>
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {listings.map((listing) => (
              <Card key={listing.id}>
                <CardBody>
                  <div className="flex gap-4">
                    {/* Photo */}
                    <div className="flex-shrink-0">
                      <img
                        src={listing.photos[0] || '/placeholder.png'}
                        alt={listing.title}
                        className="w-32 h-32 object-cover rounded-lg"
                      />
                    </div>

                    {/* Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="text-xl font-semibold text-gray-900 mb-1">
                            {listing.title}
                          </h3>
                          <p className="text-sm text-gray-600">
                            {listing.category.icon && `${listing.category.icon} `}
                            {listing.category.name}
                          </p>
                        </div>
                        {getStatusBadge(listing.status)}
                      </div>

                      <p className="text-gray-700 mb-3">{formatPrice(listing)}</p>

                      <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
                          />
                        </svg>
                        {listing._count.contacts} inquiries
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2">
                        <Link href={`/listings/${listing.id}/edit`}>
                          <Button variant="secondary" size="sm">
                            Edit
                          </Button>
                        </Link>

                        {listing.status === 'paused' ? (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleUnpauseListing(listing.id)}
                          >
                            Unpause
                          </Button>
                        ) : (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handlePauseListing(listing.id)}
                            disabled={listing.status === 'pending'}
                          >
                            Pause
                          </Button>
                        )}

                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => handleDeleteListing(listing.id)}
                        >
                          Delete
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardBody>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
