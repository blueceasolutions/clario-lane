import type { Session } from '@supabase/supabase-js'
import type { UserTable } from '@/types'

export interface AuthContextType {
  session: Session | null
  user: UserTable | null | undefined
  isLoading: boolean
  isAuthenticated: boolean
  login: () => void
  logout: () => void
}
