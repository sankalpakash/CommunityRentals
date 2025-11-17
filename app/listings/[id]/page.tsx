'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { Button, Card, CardBody, CardHeader, Badge, Spinner } from '@/components/ui'

interface Listing {
  id: string
  title: string
  description: string
  photos: string[]
  dailyPrice: number | null
  weeklyPrice: number | null
  monthlyPrice: number | null
  availableFrom: string | null
  availableUntil: string | null
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
    preferWhatsApp: boolean
    preferCall: boolean
    preferEmail: boolean
    mobile: string
    email?: string
  }
  society: {
    id: string
    name: string
  } | null
  _count: {
    contacts: number
  }
}

export default function ListingDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { data: session } = useSession()
  const listingId = params.id as string

  const [listing, setListing] = useState<Listing | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState(0)
  const [showContactModal, setShowContactModal] = useState(false)
  const [contactMethod, setContactMethod] = useState<'whatsapp' | 'call' | 'email' | ''>('')

  useEffect(() => {
    fetchListing()
  }, [listingId])

  const fetchListing = async () => {
    try {
      const response = await fetch(`/api/listings/${listingId}`)
      if (response.ok) {
        const data = await response.json()
        setListing(data)
      } else {
        setError('Listing not found')
      }
    } catch (error) {
      console.error('Failed to fetch listing:', error)
      setError('Failed to load listing')
    } finally {
      setIsLoading(false)
    }
  }

  const handleContactOwner = async (method: 'whatsapp' | 'call' | 'email') => {
    if (!listing) return

    // Track contact
    try {
      await fetch('/api/contacts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          listingId: listing.id,
          ownerId: listing.owner.id,
          method,
        }),
      })
    } catch (error) {
      console.error('Failed to track contact:', error)
    }

    // Open contact method
    if (method === 'whatsapp') {
      const message = encodeURIComponent(
        `Hi! I'm interested in renting "${listing.title}" from Community Rentals. Is it still available?`
      )
      window.open(
        `https://wa.me/91${listing.owner.mobile}?text=${message}`,
        '_blank'
      )
    } else if (method === 'call') {
      window.open(`tel:+91${listing.owner.mobile}`, '_self')
    } else if (method === 'email' && listing.owner.email) {
      const subject = encodeURIComponent(`Inquiry about: ${listing.title}`)
      const body = encodeURIComponent(
        `Hi ${listing.owner.name},\n\nI'm interested in renting "${listing.title}" that you listed on Community Rentals.\n\nIs it still available?\n\nThanks!`
      )
      window.open(
        `mailto:${listing.owner.email}?subject=${subject}&body=${body}`,
        '_self'
      )
    }

    setShowContactModal(false)
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return null
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Spinner size="lg" className="mx-auto mb-4 text-primary" />
          <p className="text-gray-600">Loading listing...</p>
        </div>
      </div>
    )
  }

  if (error || !listing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <Card className="max-w-md w-full">
          <CardBody className="text-center py-12">
            <svg
              className="w-16 h-16 text-red-500 mx-auto mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {error || 'Listing Not Found'}
            </h3>
            <p className="text-gray-600 mb-6">
              The listing you're looking for doesn't exist or has been removed.
            </p>
            <Link href="/browse">
              <Button variant="primary">Browse Listings</Button>
            </Link>
          </CardBody>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="text-2xl font-bold text-primary">
              Community Rentals
            </Link>
            <div className="flex gap-3">
              <Link href="/browse">
                <Button variant="outline">Browse</Button>
              </Link>
              <Link href="/dashboard">
                <Button variant="primary">Dashboard</Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Back Button */}
        <button
          onClick={() => router.back()}
          className="flex items-center text-gray-600 hover:text-primary mb-6"
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

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Photo Gallery */}
            <Card>
              <CardBody className="p-0">
                {/* Main Photo */}
                <div className="relative h-96 bg-gray-200 rounded-t-lg overflow-hidden">
                  <img
                    src={listing.photos[selectedPhotoIndex] || '/placeholder.png'}
                    alt={listing.title}
                    className="w-full h-full object-contain"
                  />
                </div>

                {/* Thumbnail Gallery */}
                {listing.photos.length > 1 && (
                  <div className="p-4 flex gap-2 overflow-x-auto">
                    {listing.photos.map((photo, index) => (
                      <button
                        key={index}
                        onClick={() => setSelectedPhotoIndex(index)}
                        className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-colors ${
                          selectedPhotoIndex === index
                            ? 'border-primary'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <img
                          src={photo}
                          alt={`Photo ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </button>
                    ))}
                  </div>
                )}
              </CardBody>
            </Card>

            {/* Details */}
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                      {listing.title}
                    </h1>
                    <div className="flex items-center gap-2 text-gray-600">
                      <span className="inline-flex items-center">
                        {listing.category.icon && (
                          <span className="mr-1">{listing.category.icon}</span>
                        )}
                        {listing.category.name}
                      </span>
                      <span>•</span>
                      <span>{listing._count.contacts} inquiries</span>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardBody>
                <h3 className="font-semibold text-gray-900 mb-2">Description</h3>
                <p className="text-gray-700 whitespace-pre-line">
                  {listing.description}
                </p>
              </CardBody>
            </Card>

            {/* Pricing */}
            <Card>
              <CardHeader>
                <h3 className="font-semibold text-lg">Rental Pricing</h3>
              </CardHeader>
              <CardBody>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {listing.dailyPrice && (
                    <div className="border border-gray-200 rounded-lg p-4 text-center">
                      <p className="text-sm text-gray-600 mb-1">Daily</p>
                      <p className="text-2xl font-bold text-primary">
                        ₹{listing.dailyPrice}
                      </p>
                      <p className="text-xs text-gray-500">per day</p>
                    </div>
                  )}
                  {listing.weeklyPrice && (
                    <div className="border border-gray-200 rounded-lg p-4 text-center">
                      <p className="text-sm text-gray-600 mb-1">Weekly</p>
                      <p className="text-2xl font-bold text-primary">
                        ₹{listing.weeklyPrice}
                      </p>
                      <p className="text-xs text-gray-500">per week</p>
                    </div>
                  )}
                  {listing.monthlyPrice && (
                    <div className="border border-gray-200 rounded-lg p-4 text-center">
                      <p className="text-sm text-gray-600 mb-1">Monthly</p>
                      <p className="text-2xl font-bold text-primary">
                        ₹{listing.monthlyPrice}
                      </p>
                      <p className="text-xs text-gray-500">per month</p>
                    </div>
                  )}
                </div>
              </CardBody>
            </Card>

            {/* Availability */}
            {(listing.availableFrom || listing.availableUntil) && (
              <Card>
                <CardHeader>
                  <h3 className="font-semibold text-lg">Availability</h3>
                </CardHeader>
                <CardBody>
                  <div className="flex items-center gap-2 text-gray-700">
                    <svg
                      className="w-5 h-5 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                    <span>
                      {listing.availableFrom && formatDate(listing.availableFrom)}
                      {listing.availableFrom && listing.availableUntil && ' - '}
                      {listing.availableUntil && formatDate(listing.availableUntil)}
                      {!listing.availableFrom &&
                        listing.availableUntil &&
                        `Until ${formatDate(listing.availableUntil)}`}
                    </span>
                  </div>
                </CardBody>
              </Card>
            )}
          </div>

          {/* Sidebar - Owner Info & Contact */}
          <div className="lg:col-span-1">
            <div className="sticky top-8 space-y-6">
              {/* Owner Info */}
              <Card>
                <CardHeader>
                  <h3 className="font-semibold text-lg">Owner Information</h3>
                </CardHeader>
                <CardBody>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-900">
                          {listing.owner.name}
                        </p>
                        <p className="text-sm text-gray-600">
                          {listing.owner.flatNumber}
                          {listing.owner.block && `-${listing.owner.block}`}
                        </p>
                      </div>
                      {listing.owner.verified && (
                        <Badge variant="success">
                          <svg
                            className="w-3 h-3 inline mr-1"
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
                        </Badge>
                      )}
                    </div>

                    {listing.society && (
                      <div className="pt-3 border-t border-gray-200">
                        <p className="text-sm text-gray-600">
                          {listing.society.name}
                        </p>
                      </div>
                    )}
                  </div>
                </CardBody>
              </Card>

              {/* Contact Owner */}
              <Card>
                <CardBody>
                  <Button
                    variant="primary"
                    className="w-full"
                    onClick={() => setShowContactModal(true)}
                  >
                    Contact Owner
                  </Button>

                  <p className="text-xs text-gray-500 text-center mt-3">
                    Direct communication with owner
                  </p>
                </CardBody>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* Contact Modal */}
      {showContactModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <Card className="max-w-md w-full">
            <CardHeader>
              <h3 className="font-semibold text-lg">Contact Owner</h3>
            </CardHeader>
            <CardBody>
              <p className="text-gray-600 mb-4">
                Choose how you'd like to contact {listing.owner.name}:
              </p>

              <div className="space-y-3">
                {listing.owner.preferWhatsApp && (
                  <button
                    onClick={() => handleContactOwner('whatsapp')}
                    className="w-full flex items-center gap-3 px-4 py-3 border-2 border-gray-200 rounded-lg hover:border-primary hover:bg-primary/5 transition-colors"
                  >
                    <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center text-white">
                      <svg
                        className="w-6 h-6"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                      </svg>
                    </div>
                    <div className="text-left">
                      <p className="font-medium text-gray-900">WhatsApp</p>
                      <p className="text-sm text-gray-600">
                        Open WhatsApp chat
                      </p>
                    </div>
                  </button>
                )}

                {listing.owner.preferCall && (
                  <button
                    onClick={() => handleContactOwner('call')}
                    className="w-full flex items-center gap-3 px-4 py-3 border-2 border-gray-200 rounded-lg hover:border-primary hover:bg-primary/5 transition-colors"
                  >
                    <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white">
                      <svg
                        className="w-6 h-6"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                        />
                      </svg>
                    </div>
                    <div className="text-left">
                      <p className="font-medium text-gray-900">Phone Call</p>
                      <p className="text-sm text-gray-600">
                        Call {listing.owner.mobile}
                      </p>
                    </div>
                  </button>
                )}

                {listing.owner.preferEmail && listing.owner.email && (
                  <button
                    onClick={() => handleContactOwner('email')}
                    className="w-full flex items-center gap-3 px-4 py-3 border-2 border-gray-200 rounded-lg hover:border-primary hover:bg-primary/5 transition-colors"
                  >
                    <div className="w-10 h-10 bg-gray-500 rounded-full flex items-center justify-center text-white">
                      <svg
                        className="w-6 h-6"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                        />
                      </svg>
                    </div>
                    <div className="text-left">
                      <p className="font-medium text-gray-900">Email</p>
                      <p className="text-sm text-gray-600">
                        Send email to owner
                      </p>
                    </div>
                  </button>
                )}
              </div>

              <Button
                variant="outline"
                className="w-full mt-4"
                onClick={() => setShowContactModal(false)}
              >
                Cancel
              </Button>
            </CardBody>
          </Card>
        </div>
      )}
    </div>
  )
}
