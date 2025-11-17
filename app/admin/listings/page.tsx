'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button, Card, CardBody, Badge, Spinner } from '@/components/ui'

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
  owner: {
    name: string
    flatNumber: string
    block?: string
  }
  createdAt: string
  rejectionReason?: string
}

export default function AdminListingsPage() {
  const router = useRouter()
  const [listings, setListings] = useState<Listing[]>([])
  const [filter, setFilter] = useState<'pending' | 'active' | 'rejected' | 'all'>('pending')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchListings()
  }, [filter])

  const fetchListings = async () => {
    setIsLoading(true)
    try {
      const status = filter === 'all' ? '' : filter
      const response = await fetch(`/api/admin/listings?status=${status}`)

      if (response.ok) {
        const data = await response.json()
        setListings(data)
      } else if (response.status === 403) {
        setError('Access denied')
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

  const handleApprove = async (listingId: string) => {
    try {
      const response = await fetch(`/api/admin/listings/${listingId}/approve`, {
        method: 'POST',
      })

      if (response.ok) {
        fetchListings() // Refresh list
      }
    } catch (error) {
      console.error('Failed to approve listing:', error)
    }
  }

  const handleReject = async (listingId: string) => {
    const reason = prompt('Enter rejection reason (optional):')

    try {
      const response = await fetch(`/api/admin/listings/${listingId}/reject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason }),
      })

      if (response.ok) {
        fetchListings() // Refresh list
      }
    } catch (error) {
      console.error('Failed to reject listing:', error)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge variant="success">Active</Badge>
      case 'pending':
        return <Badge variant="warning">Pending</Badge>
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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <Link href="/admin" className="text-sm text-gray-600 hover:text-primary mb-2 inline-block">
                ← Back to Admin
              </Link>
              <h1 className="text-2xl font-bold text-gray-900">Listing Management</h1>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Filter Tabs */}
        <div className="mb-6 flex gap-2">
          <Button
            variant={filter === 'pending' ? 'primary' : 'outline'}
            onClick={() => setFilter('pending')}
          >
            Pending
          </Button>
          <Button
            variant={filter === 'active' ? 'primary' : 'outline'}
            onClick={() => setFilter('active')}
          >
            Active
          </Button>
          <Button
            variant={filter === 'rejected' ? 'primary' : 'outline'}
            onClick={() => setFilter('rejected')}
          >
            Rejected
          </Button>
          <Button
            variant={filter === 'all' ? 'primary' : 'outline'}
            onClick={() => setFilter('all')}
          >
            All
          </Button>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600">{error}</p>
          </div>
        )}

        {/* Loading */}
        {isLoading ? (
          <div className="flex justify-center items-center py-20">
            <Spinner size="lg" className="text-primary" />
          </div>
        ) : listings.length === 0 ? (
          <Card>
            <CardBody className="text-center py-12">
              <p className="text-gray-600">No listings found</p>
            </CardBody>
          </Card>
        ) : (
          <div className="space-y-4">
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

                      <p className="text-gray-700 mb-2">{formatPrice(listing)}</p>

                      <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
                        <span>Owner: {listing.owner.name}</span>
                        <span>•</span>
                        <span>
                          {listing.owner.flatNumber}
                          {listing.owner.block && `-${listing.owner.block}`}
                        </span>
                        <span>•</span>
                        <span>{new Date(listing.createdAt).toLocaleDateString()}</span>
                      </div>

                      {listing.rejectionReason && (
                        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded">
                          <p className="text-sm text-red-700">
                            <strong>Rejection reason:</strong> {listing.rejectionReason}
                          </p>
                        </div>
                      )}

                      {/* Actions */}
                      <div className="flex gap-2">
                        <Link href={`/listings/${listing.id}`} target="_blank">
                          <Button variant="outline" size="sm">
                            View
                          </Button>
                        </Link>

                        {listing.status === 'pending' && (
                          <>
                            <Button
                              variant="primary"
                              size="sm"
                              onClick={() => handleApprove(listing.id)}
                            >
                              Approve
                            </Button>
                            <Button
                              variant="danger"
                              size="sm"
                              onClick={() => handleReject(listing.id)}
                            >
                              Reject
                            </Button>
                          </>
                        )}

                        {listing.status === 'rejected' && (
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={() => handleApprove(listing.id)}
                          >
                            Approve
                          </Button>
                        )}
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
