import 'next-auth'

declare module 'next-auth' {
  interface User {
    id: string
    mobile: string
    name?: string | null
    email?: string | null
    role: string
  }

  interface Session {
    user: {
      id: string
      mobile: string
      name?: string | null
      email?: string | null
      role: string
    }
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string
    mobile: string
    role: string
  }
}
