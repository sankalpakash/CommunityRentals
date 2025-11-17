'use client'

import { useState, FormEvent, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { Button, Input, Card, CardBody, CardHeader } from '@/components/ui'

interface Society {
  id: string
  name: string
  blocks: string[]
}

export default function ProfileSetupPage() {
  const router = useRouter()
  const { data: session, update } = useSession()
  const [isLoading, setIsLoading] = useState(false)
  const [societies, setSocieties] = useState<Society[]>([])
  const [error, setError] = useState('')

  // Form fields
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    flatNumber: '',
    block: '',
    societyId: '',
    preferWhatsApp: true,
    preferCall: false,
    preferEmail: false,
  })

  // Fetch societies on mount
  useEffect(() => {
    fetchSocieties()
  }, [])

  const fetchSocieties = async () => {
    try {
      const response = await fetch('/api/societies')
      if (response.ok) {
        const data = await response.json()
        setSocieties(data)
        if (data.length > 0) {
          setFormData((prev) => ({ ...prev, societyId: data[0].id }))
        }
      }
    } catch (error) {
      console.error('Failed to fetch societies:', error)
    }
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    // Validate at least one contact preference
    if (!formData.preferWhatsApp && !formData.preferCall && !formData.preferEmail) {
      setError('Select at least one contact preference')
      setIsLoading(false)
      return
    }

    try {
      const response = await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update profile')
      }

      // Update session
      await update()

      // Redirect to dashboard
      router.push('/dashboard')
    } catch (err: any) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const selectedSociety = societies.find((s) => s.id === formData.societyId)

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Complete Your Profile
          </h1>
          <p className="text-gray-600">
            Tell us about yourself to get started
          </p>
        </div>

        <Card>
          <CardHeader>
            <h2 className="text-xl font-semibold">Personal Information</h2>
          </CardHeader>
          <CardBody>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Name */}
              <Input
                label="Full Name"
                type="text"
                placeholder="John Doe"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                required
              />

              {/* Email */}
              <Input
                label="Email Address"
                type="email"
                placeholder="john@example.com"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                helperText="Optional - for email notifications"
              />

              {/* Society */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Society / Community <span className="text-red-500">*</span>
                </label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  value={formData.societyId}
                  onChange={(e) => handleInputChange('societyId', e.target.value)}
                  required
                >
                  <option value="">Select a society</option>
                  {societies.map((society) => (
                    <option key={society.id} value={society.id}>
                      {society.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Block */}
              {selectedSociety && selectedSociety.blocks.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Block
                  </label>
                  <select
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    value={formData.block}
                    onChange={(e) => handleInputChange('block', e.target.value)}
                  >
                    <option value="">Select a block</option>
                    {selectedSociety.blocks.map((block) => (
                      <option key={block} value={block}>
                        Block {block}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Flat Number */}
              <Input
                label="Flat Number"
                type="text"
                placeholder="A-101"
                value={formData.flatNumber}
                onChange={(e) => handleInputChange('flatNumber', e.target.value)}
                required
                helperText="e.g., A-101, 205, etc."
              />

              {/* Contact Preferences */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Preferred Contact Methods <span className="text-red-500">*</span>
                </label>
                <p className="text-sm text-gray-500 mb-3">
                  Select how you'd like renters to contact you (select at least one)
                </p>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.preferWhatsApp}
                      onChange={(e) =>
                        handleInputChange('preferWhatsApp', e.target.checked)
                      }
                      className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                    />
                    <span className="ml-2 text-gray-700">WhatsApp</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.preferCall}
                      onChange={(e) =>
                        handleInputChange('preferCall', e.target.checked)
                      }
                      className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                    />
                    <span className="ml-2 text-gray-700">Phone Call</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.preferEmail}
                      onChange={(e) =>
                        handleInputChange('preferEmail', e.target.checked)
                      }
                      className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                    />
                    <span className="ml-2 text-gray-700">Email</span>
                  </label>
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              )}

              {/* Submit Button */}
              <Button
                type="submit"
                variant="primary"
                className="w-full"
                isLoading={isLoading}
              >
                Complete Setup
              </Button>
            </form>
          </CardBody>
        </Card>
      </div>
    </div>
  )
}
