'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { Button, Card, CardBody, CardHeader, Spinner } from '@/components/ui'

interface DashboardStats {
  totalUsers: number
  totalListings: number
  activeListings: number
  pendingListings: number
  totalContacts: number
  verifiedUsers: number
}

export default function AdminDashboardPage() {
  const router = useRouter()
  const { data: session, status } = useSession()
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin')
    } else if (status === 'authenticated') {
      fetchStats()
    }
  }, [status, router])

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/admin/stats')
      if (response.ok) {
        const data = await response.json()
        setStats(data)
      } else if (response.status === 403) {
        setError('Access denied. Admin privileges required.')
      } else {
        setError('Failed to load dashboard')
      }
    } catch (error) {
      console.error('Failed to fetch stats:', error)
      setError('Failed to load dashboard')
    } finally {
      setIsLoading(false)
    }
  }

  if (status === 'loading' || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Spinner size="lg" className="mx-auto mb-4 text-primary" />
          <p className="text-gray-600">Loading admin dashboard...</p>
        </div>
      </div>
    )
  }

  if (error) {
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
              Access Denied
            </h3>
            <p className="text-gray-600 mb-6">{error}</p>
            <Link href="/dashboard">
              <Button variant="primary">Go to Dashboard</Button>
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
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
              <p className="text-gray-600 text-sm">
                Welcome, {session?.user?.name || 'Admin'}
              </p>
            </div>
            <div className="flex gap-3">
              <Link href="/">
                <Button variant="outline">Home</Button>
              </Link>
              <Link href="/dashboard">
                <Button variant="outline">My Dashboard</Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {/* Total Users */}
          <Card>
            <CardBody>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Total Users</p>
                  <p className="text-3xl font-bold text-gray-900">
                    {stats?.totalUsers || 0}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {stats?.verifiedUsers || 0} verified
                  </p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <svg
                    className="w-6 h-6 text-blue-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                    />
                  </svg>
                </div>
              </div>
            </CardBody>
          </Card>

          {/* Total Listings */}
          <Card>
            <CardBody>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Total Listings</p>
                  <p className="text-3xl font-bold text-gray-900">
                    {stats?.totalListings || 0}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {stats?.activeListings || 0} active
                  </p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <svg
                    className="w-6 h-6 text-green-600"
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
                </div>
              </div>
            </CardBody>
          </Card>

          {/* Pending Approvals */}
          <Card>
            <CardBody>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Pending Approvals</p>
                  <p className="text-3xl font-bold text-gray-900">
                    {stats?.pendingListings || 0}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">Requires action</p>
                </div>
                <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                  <svg
                    className="w-6 h-6 text-yellow-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
              </div>
            </CardBody>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* User Management */}
          <Link href="/admin/users">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader>
                <h3 className="font-semibold text-lg">User Management</h3>
              </CardHeader>
              <CardBody>
                <p className="text-gray-600 mb-4">
                  View, verify, and manage all registered users
                </p>
                <Button variant="outline" className="w-full">
                  Manage Users
                </Button>
              </CardBody>
            </Card>
          </Link>

          {/* Listing Approvals */}
          <Link href="/admin/listings">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader>
                <h3 className="font-semibold text-lg">Listing Approvals</h3>
              </CardHeader>
              <CardBody>
                <p className="text-gray-600 mb-4">
                  Review and approve pending listings
                </p>
                <Button variant="primary" className="w-full">
                  Review Listings
                  {stats && stats.pendingListings > 0 && (
                    <span className="ml-2 bg-white text-primary px-2 py-0.5 rounded-full text-sm">
                      {stats.pendingListings}
                    </span>
                  )}
                </Button>
              </CardBody>
            </Card>
          </Link>

          {/* Analytics */}
          <Link href="/admin/analytics">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader>
                <h3 className="font-semibold text-lg">Analytics</h3>
              </CardHeader>
              <CardBody>
                <p className="text-gray-600 mb-4">
                  View platform trends and insights
                </p>
                <Button variant="outline" className="w-full">
                  View Analytics
                </Button>
              </CardBody>
            </Card>
          </Link>

          {/* Category Management */}
          <Link href="/admin/categories">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader>
                <h3 className="font-semibold text-lg">Categories</h3>
              </CardHeader>
              <CardBody>
                <p className="text-gray-600 mb-4">
                  Add, edit, or remove product categories
                </p>
                <Button variant="outline" className="w-full">
                  Manage Categories
                </Button>
              </CardBody>
            </Card>
          </Link>

          {/* Society Management */}
          <Link href="/admin/societies">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader>
                <h3 className="font-semibold text-lg">Societies</h3>
              </CardHeader>
              <CardBody>
                <p className="text-gray-600 mb-4">
                  Manage gated communities and blocks
                </p>
                <Button variant="outline" className="w-full">
                  Manage Societies
                </Button>
              </CardBody>
            </Card>
          </Link>

          {/* Reports */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <h3 className="font-semibold text-lg">Reports & Flags</h3>
            </CardHeader>
            <CardBody>
              <p className="text-gray-600 mb-4">
                Review flagged content and user reports
              </p>
              <Button variant="outline" className="w-full" disabled>
                Coming Soon
              </Button>
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  )
}
