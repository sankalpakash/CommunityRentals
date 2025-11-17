import { User, Listing, Category, Society, Contact, Flag } from '@prisma/client'

// Extended types with relations
export type ListingWithRelations = Listing & {
  owner: User
  category: Category
  society: Society | null
  _count?: {
    contacts: number
  }
}

export type UserWithRelations = User & {
  society: Society | null
  _count?: {
    listings: number
    contactsAsRenter: number
    contactsAsOwner: number
  }
}

export type ContactWithRelations = Contact & {
  renter: User
  owner: User
  listing: Listing
}

export type FlagWithRelations = Flag & {
  listing?: Listing | null
  user?: User | null
  createdBy: User
}

// Filter types
export type ListingFilters = {
  search?: string
  categoryId?: string
  minPrice?: number
  maxPrice?: number
  frequency?: 'daily' | 'weekly' | 'monthly'
  availableNow?: boolean
  societyId?: string
}

// Status enums
export enum UserStatus {
  ACTIVE = 'active',
  BLOCKED = 'blocked',
  INACTIVE = 'inactive',
}

export enum ListingStatus {
  PENDING = 'pending',
  ACTIVE = 'active',
  PAUSED = 'paused',
  REJECTED = 'rejected',
  DELETED = 'deleted',
}

export enum FlagStatus {
  OPEN = 'open',
  RESOLVED = 'resolved',
  DISMISSED = 'dismissed',
}

export enum ContactMethod {
  WHATSAPP = 'whatsapp',
  CALL = 'call',
  EMAIL = 'email',
}

export enum UserRole {
  USER = 'user',
  ADMIN = 'admin',
}
