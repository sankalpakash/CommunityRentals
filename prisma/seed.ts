import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting database seed...')

  // Create default society
  const defaultSociety = await prisma.society.upsert({
    where: { id: 'default-society' },
    update: {},
    create: {
      id: 'default-society',
      name: 'Demo Residency',
      address: '123 Main Street',
      city: 'Bangalore',
      state: 'Karnataka',
      blocks: ['A', 'B', 'C', 'D'],
      adminContact: '9876543210',
      adminEmail: 'admin@demoresidency.com',
      estimatedUsers: 500,
    },
  })
  console.log('✅ Created default society:', defaultSociety.name)

  // Create categories
  const categories = [
    {
      name: 'Furniture',
      description: 'Tables, chairs, sofas, beds, etc.',
      icon: '🪑',
      color: '#8B4513',
    },
    {
      name: 'Tools',
      description: 'Drills, hammers, ladders, etc.',
      icon: '🔧',
      color: '#FF6B6B',
    },
    {
      name: 'Sports Equipment',
      description: 'Bicycles, badminton rackets, cricket bats, etc.',
      icon: '🏏',
      color: '#4ECDC4',
    },
    {
      name: 'Kitchen Appliances',
      description: 'Mixers, blenders, microwave, etc.',
      icon: '🍳',
      color: '#FFD93D',
    },
    {
      name: 'Electronics',
      description: 'Projectors, speakers, cameras, etc.',
      icon: '📺',
      color: '#6C5CE7',
    },
    {
      name: 'Party & Events',
      description: 'Decorations, sound systems, tables, chairs, etc.',
      icon: '🎉',
      color: '#FF6B9D',
    },
    {
      name: 'Books & Media',
      description: 'Books, DVDs, board games, etc.',
      icon: '📚',
      color: '#95E1D3',
    },
    {
      name: 'Baby & Kids',
      description: 'Strollers, car seats, toys, etc.',
      icon: '👶',
      color: '#F8B500',
    },
    {
      name: 'Gardening',
      description: 'Lawn mowers, pruners, pots, etc.',
      icon: '🌱',
      color: '#38B000',
    },
    {
      name: 'Others',
      description: 'Miscellaneous items',
      icon: '📦',
      color: '#95A5A6',
    },
  ]

  for (const category of categories) {
    const created = await prisma.category.upsert({
      where: { name: category.name },
      update: {},
      create: category,
    })
    console.log(`✅ Created category: ${created.name}`)
  }

  // Create admin user
  const adminUser = await prisma.user.upsert({
    where: { mobile: '9999999999' },
    update: {},
    create: {
      mobile: '9999999999',
      name: 'Admin User',
      email: 'admin@communityrentals.com',
      flatNumber: 'A-101',
      block: 'A',
      societyId: defaultSociety.id,
      role: 'admin',
      verified: true,
      verifiedAt: new Date(),
      status: 'active',
      preferWhatsApp: true,
      preferCall: true,
      preferEmail: true,
    },
  })
  console.log('✅ Created admin user:', adminUser.mobile)

  // Create demo user
  const demoUser = await prisma.user.upsert({
    where: { mobile: '9876543210' },
    update: {},
    create: {
      mobile: '9876543210',
      name: 'Demo User',
      email: 'demo@example.com',
      flatNumber: 'B-205',
      block: 'B',
      societyId: defaultSociety.id,
      role: 'user',
      verified: true,
      verifiedAt: new Date(),
      status: 'active',
      preferWhatsApp: true,
      preferCall: false,
      preferEmail: true,
    },
  })
  console.log('✅ Created demo user:', demoUser.mobile)

  // Create sample listings
  const furnitureCategory = await prisma.category.findUnique({
    where: { name: 'Furniture' },
  })

  const toolsCategory = await prisma.category.findUnique({
    where: { name: 'Tools' },
  })

  if (furnitureCategory) {
    const listing1 = await prisma.listing.create({
      data: {
        title: 'Wooden Dining Table (6-seater)',
        description: 'Beautiful teak wood dining table in excellent condition. Perfect for family gatherings.',
        photos: [
          'https://images.unsplash.com/photo-1577140917170-285929fb55b7?w=800',
        ],
        categoryId: furnitureCategory.id,
        ownerId: demoUser.id,
        societyId: defaultSociety.id,
        dailyPrice: 200,
        weeklyPrice: 1000,
        monthlyPrice: 3000,
        status: 'active',
        approvedAt: new Date(),
      },
    })
    console.log('✅ Created sample listing:', listing1.title)
  }

  if (toolsCategory) {
    const listing2 = await prisma.listing.create({
      data: {
        title: 'Electric Drill with Bits Set',
        description: 'Bosch electric drill with complete bits set. Great for home projects.',
        photos: [
          'https://images.unsplash.com/photo-1572981779307-38b8cabb2407?w=800',
        ],
        categoryId: toolsCategory.id,
        ownerId: demoUser.id,
        societyId: defaultSociety.id,
        dailyPrice: 100,
        weeklyPrice: 500,
        status: 'active',
        approvedAt: new Date(),
      },
    })
    console.log('✅ Created sample listing:', listing2.title)
  }

  console.log('🎉 Database seeded successfully!')
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
