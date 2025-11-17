'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button, Card, CardBody, Badge, Spinner, Input } from '@/components/ui'

interface User {
  id: string
  mobile: string
  name: string | null
  email: string | null
  flatNumber: string | null
  block: string | null
  verified: boolean
  status: string
  role: string
  society: {
    name: string
  } | null
  _count: {
    listings: number
    contactsAsOwner: number
  }
  createdAt: string
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [filter, setFilter] = useState<'all' | 'verified' | 'unverified' | 'blocked'>('all')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/admin/users')

      if (response.ok) {
        const data = await response.json()
        setUsers(data)
      } else if (response.status === 403) {
        setError('Access denied')
      } else {
        setError('Failed to load users')
      }
    } catch (error) {
      console.error('Failed to fetch users:', error)
      setError('Failed to load users')
    } finally {
      setIsLoading(false)
    }
  }

  const handleVerify = async (userId: string) => {
    try {
      const response = await fetch(`/api/admin/users/${userId}/verify`, {
        method: 'POST',
      })

      if (response.ok) {
        fetchUsers()
      }
    } catch (error) {
      console.error('Failed to verify user:', error)
    }
  }

  const handleBlock = async (userId: string) => {
    if (!confirm('Are you sure you want to block this user?')) {
      return
    }

    try {
      const response = await fetch(`/api/admin/users/${userId}/block`, {
        method: 'POST',
      })

      if (response.ok) {
        fetchUsers()
      }
    } catch (error) {
      console.error('Failed to block user:', error)
    }
  }

  const handleUnblock = async (userId: string) => {
    try {
      const response = await fetch(`/api/admin/users/${userId}/unblock`, {
        method: 'POST',
      })

      if (response.ok) {
        fetchUsers()
      }
    } catch (error) {
      console.error('Failed to unblock user:', error)
    }
  }

  const filteredUsers = users.filter((user) => {
    // Apply status filter
    if (filter === 'verified' && !user.verified) return false
    if (filter === 'unverified' && user.verified) return false
    if (filter === 'blocked' && user.status !== 'blocked') return false

    // Apply search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      return (
        user.name?.toLowerCase().includes(query) ||
        user.mobile.includes(query) ||
        user.email?.toLowerCase().includes(query) ||
        user.flatNumber?.toLowerCase().includes(query)
      )
    }

    return true
  })

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
              <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Search & Filters */}
        <div className="mb-6 flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <Input
              type="text"
              placeholder="Search by name, mobile, email, or flat..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <Button
              variant={filter === 'all' ? 'primary' : 'outline'}
              onClick={() => setFilter('all')}
              size="sm"
            >
              All
            </Button>
            <Button
              variant={filter === 'verified' ? 'primary' : 'outline'}
              onClick={() => setFilter('verified')}
              size="sm"
            >
              Verified
            </Button>
            <Button
              variant={filter === 'unverified' ? 'primary' : 'outline'}
              onClick={() => setFilter('unverified')}
              size="sm"
            >
              Unverified
            </Button>
            <Button
              variant={filter === 'blocked' ? 'primary' : 'outline'}
              onClick={() => setFilter('blocked')}
              size="sm"
            >
              Blocked
            </Button>
          </div>
        </div>

        <p className="text-sm text-gray-600 mb-4">
          {filteredUsers.length} users found
        </p>

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
        ) : filteredUsers.length === 0 ? (
          <Card>
            <CardBody className="text-center py-12">
              <p className="text-gray-600">No users found</p>
            </CardBody>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredUsers.map((user) => (
              <Card key={user.id}>
                <CardBody>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {user.name || 'No name'}
                        </h3>
                        {user.verified && (
                          <Badge variant="success">Verified</Badge>
                        )}
                        {user.status === 'blocked' && (
                          <Badge variant="danger">Blocked</Badge>
                        )}
                        {user.role === 'admin' && (
                          <Badge variant="info">Admin</Badge>
                        )}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-600 mb-3">
                        <div>
                          <strong>Mobile:</strong> {user.mobile}
                        </div>
                        {user.email && (
                          <div>
                            <strong>Email:</strong> {user.email}
                          </div>
                        )}
                        {user.flatNumber && (
                          <div>
                            <strong>Flat:</strong> {user.flatNumber}
                            {user.block && `-${user.block}`}
                          </div>
                        )}
                        {user.society && (
                          <div>
                            <strong>Society:</strong> {user.society.name}
                          </div>
                        )}
                        <div>
                          <strong>Listings:</strong> {user._count.listings}
                        </div>
                        <div>
                          <strong>Inquiries received:</strong> {user._count.contactsAsOwner}
                        </div>
                        <div>
                          <strong>Joined:</strong> {new Date(user.createdAt).toLocaleDateString()}
                        </div>
                      </div>

                      <div className="flex gap-2">
                        {!user.verified && (
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={() => handleVerify(user.id)}
                          >
                            Verify User
                          </Button>
                        )}

                        {user.status === 'blocked' ? (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleUnblock(user.id)}
                          >
                            Unblock
                          </Button>
                        ) : (
                          user.role !== 'admin' && (
                            <Button
                              variant="danger"
                              size="sm"
                              onClick={() => handleBlock(user.id)}
                            >
                              Block User
                            </Button>
                          )
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
