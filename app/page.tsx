import Link from 'next/link'
import { Button } from '@/components/ui'

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-primary">Community Rentals</h1>
          <div className="flex gap-3">
            <Link href="/auth/signin">
              <Button variant="outline">Sign In</Button>
            </Link>
            <Link href="/auth/signin">
              <Button variant="primary">Get Started</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="text-5xl font-bold text-gray-900 mb-6">
            Rent & Lend Within Your Community
          </h2>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            A peer-to-peer rental platform for gated communities. Share household
            items with your neighbors and earn rental income.
          </p>
          <div className="flex gap-4 justify-center">
            <Link href="/auth/signin">
              <Button variant="primary" size="lg">
                Start Listing
              </Button>
            </Link>
            <Link href="/browse">
              <Button variant="outline" size="lg">
                Browse Items
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <h3 className="text-3xl font-bold text-center text-gray-900 mb-12">
            How It Works
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-8 h-8 text-primary"
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
              </div>
              <h4 className="text-xl font-semibold text-gray-900 mb-2">
                List Your Items
              </h4>
              <p className="text-gray-600">
                Upload photos and set rental prices for items you rarely use.
                Furniture, tools, sports equipment—anything!
              </p>
            </div>

            {/* Feature 2 */}
            <div className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-8 h-8 text-primary"
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
              </div>
              <h4 className="text-xl font-semibold text-gray-900 mb-2">
                Browse & Search
              </h4>
              <p className="text-gray-600">
                Find what you need from verified neighbors. Filter by category,
                price, and availability.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-8 h-8 text-primary"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                  />
                </svg>
              </div>
              <h4 className="text-xl font-semibold text-gray-900 mb-2">
                Connect Directly
              </h4>
              <p className="text-gray-600">
                Contact owners via WhatsApp, call, or email. Arrange pickup and
                payment directly.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <h3 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Popular Categories
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {[
              { name: 'Furniture', icon: '🪑' },
              { name: 'Tools', icon: '🔧' },
              { name: 'Sports', icon: '🏏' },
              { name: 'Kitchen', icon: '🍳' },
              { name: 'Electronics', icon: '📺' },
              { name: 'Party & Events', icon: '🎉' },
              { name: 'Books', icon: '📚' },
              { name: 'Baby & Kids', icon: '👶' },
              { name: 'Gardening', icon: '🌱' },
              { name: 'Others', icon: '📦' },
            ].map((category) => (
              <Link
                key={category.name}
                href="/browse"
                className="bg-white p-6 rounded-lg border border-gray-200 hover:border-primary hover:shadow-md transition-all text-center"
              >
                <div className="text-4xl mb-2">{category.icon}</div>
                <p className="text-sm font-medium text-gray-700">
                  {category.name}
                </p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-4 bg-primary text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h3 className="text-3xl font-bold mb-4">
            Ready to Get Started?
          </h3>
          <p className="text-lg mb-8 opacity-90">
            Join your community's rental marketplace today. List your items or
            start browsing!
          </p>
          <Link href="/auth/signin">
            <Button
              variant="secondary"
              size="lg"
              className="bg-white text-primary hover:bg-gray-100"
            >
              Sign Up Now
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <p className="text-gray-400">
            © 2024 Community Rentals. Built for gated communities.
          </p>
        </div>
      </footer>
    </main>
  )
}
