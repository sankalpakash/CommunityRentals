'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Card, CardBody, CardHeader, Spinner } from '@/components/ui'

interface Analytics {
  topListings: Array<{
    id: string
    title: string
    category: { name: string; icon?: string }
    contactCount: number
  }>
  topOwners: Array<{
    id: string
    name: string
    flatNumber: string
    listingCount: number
  }>
  topCategories: Array<{
    id: string
    name: string
    icon?: string
    listingCount: number
  }>
  recentActivity: {
    last7Days: {
      newUsers: number
      newListings: number
      totalContacts: number
    }
    last30Days: {
      newUsers: number
      newListings: number
      totalContacts: number
    }
  }
}

export default function AdminAnalyticsPage() {
  const [analytics, setAnalytics] = useState<Analytics | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchAnalytics()
  }, [])

  const fetchAnalytics = async () => {
    try {
      const response = await fetch('/api/admin/analytics')

      if (response.ok) {
        const data = await response.json()
        setAnalytics(data)
      } else if (response.status === 403) {
        setError('Access denied')
      } else {
        setError('Failed to load analytics')
      }
    } catch (error) {
      console.error('Failed to fetch analytics:', error)
      setError('Failed to load analytics')
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Spinner size="lg" className="mx-auto mb-4 text-primary" />
          <p className="text-gray-600">Loading analytics...</p>
        </div>
      </div>
    )
  }

  if (error || !analytics) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="max-w-md">
          <CardBody className="text-center py-12">
            <p className="text-red-600">{error || 'Failed to load analytics'}</p>
            <Link href="/admin" className="text-primary hover:underline mt-4 inline-block">
              Back to Admin
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
          <div>
            <Link href="/admin" className="text-sm text-gray-600 hover:text-primary mb-2 inline-block">
              ← Back to Admin
            </Link>
            <h1 className="text-2xl font-bold text-gray-900">Platform Analytics</h1>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
        {/* Recent Activity */}
        <div>
          <h2 className="text-xl font-bold text-gray-900 mb-4">Recent Activity</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Last 7 Days */}
            <Card>
              <CardHeader>
                <h3 className="font-semibold">Last 7 Days</h3>
              </CardHeader>
              <CardBody>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">New Users</span>
                    <span className="font-semibold text-gray-900">
                      {analytics.recentActivity.last7Days.newUsers}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">New Listings</span>
                    <span className="font-semibold text-gray-900">
                      {analytics.recentActivity.last7Days.newListings}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Contacts</span>
                    <span className="font-semibold text-gray-900">
                      {analytics.recentActivity.last7Days.totalContacts}
                    </span>
                  </div>
                </div>
              </CardBody>
            </Card>

            {/* Last 30 Days */}
            <Card>
              <CardHeader>
                <h3 className="font-semibold">Last 30 Days</h3>
              </CardHeader>
              <CardBody>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">New Users</span>
                    <span className="font-semibold text-gray-900">
                      {analytics.recentActivity.last30Days.newUsers}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">New Listings</span>
                    <span className="font-semibold text-gray-900">
                      {analytics.recentActivity.last30Days.newListings}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Contacts</span>
                    <span className="font-semibold text-gray-900">
                      {analytics.recentActivity.last30Days.totalContacts}
                    </span>
                  </div>
                </div>
              </CardBody>
            </Card>
          </div>
        </div>

        {/* Top Items */}
        <div>
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            Most Contacted Items
          </h2>
          <Card>
            <CardBody>
              {analytics.topListings.length === 0 ? (
                <p className="text-center text-gray-600 py-8">No data yet</p>
              ) : (
                <div className="space-y-3">
                  {analytics.topListings.map((listing, index) => (
                    <div
                      key={listing.id}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-2xl font-bold text-gray-400">
                          #{index + 1}
                        </span>
                        <div>
                          <p className="font-semibold text-gray-900">
                            {listing.title}
                          </p>
                          <p className="text-sm text-gray-600">
                            {listing.category.icon && `${listing.category.icon} `}
                            {listing.category.name}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-primary">
                          {listing.contactCount}
                        </p>
                        <p className="text-xs text-gray-600">contacts</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardBody>
          </Card>
        </div>

        {/* Top Owners */}
        <div>
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            Top Owners (By Listings)
          </h2>
          <Card>
            <CardBody>
              {analytics.topOwners.length === 0 ? (
                <p className="text-center text-gray-600 py-8">No data yet</p>
              ) : (
                <div className="space-y-3">
                  {analytics.topOwners.map((owner, index) => (
                    <div
                      key={owner.id}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-2xl font-bold text-gray-400">
                          #{index + 1}
                        </span>
                        <div>
                          <p className="font-semibold text-gray-900">
                            {owner.name}
                          </p>
                          <p className="text-sm text-gray-600">
                            Flat {owner.flatNumber}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-primary">
                          {owner.listingCount}
                        </p>
                        <p className="text-xs text-gray-600">listings</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardBody>
          </Card>
        </div>

        {/* Top Categories */}
        <div>
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            Top Categories
          </h2>
          <Card>
            <CardBody>
              {analytics.topCategories.length === 0 ? (
                <p className="text-center text-gray-600 py-8">No data yet</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {analytics.topCategories.map((category) => (
                    <div
                      key={category.id}
                      className="p-4 bg-gray-50 rounded-lg text-center"
                    >
                      <div className="text-4xl mb-2">{category.icon || '📦'}</div>
                      <p className="font-semibold text-gray-900 mb-1">
                        {category.name}
                      </p>
                      <p className="text-2xl font-bold text-primary">
                        {category.listingCount}
                      </p>
                      <p className="text-xs text-gray-600">listings</p>
                    </div>
                  ))}
                </div>
              )}
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  )
}
