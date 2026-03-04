import { fetchSession, fetchUserProfile } from '@/integration'
import { useOnboardingFlow, useOnboardingStore } from '@/store'
import type { UserTable } from '@/types'
import type { Session } from '@supabase/supabase-js'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useRouter } from '@tanstack/react-router'
import { createContext, useContext, useEffect } from 'react'
import { toast } from 'sonner'
import { supabaseService } from '~supabase/clientServices'

interface AuthContextType {
  session: Session | null
  user: UserTable | null | undefined
  isLoading: boolean
  isAuthenticated: boolean
  login: (
    provider: 'google' | 'email',
    email?: string,
    password?: string,
  ) => Promise<void>
  signup: (email: string, password: string, name: string) => Promise<void>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const queryClient = useQueryClient()
  const router = useRouter()

  const { data: session, isLoading: isSessionLoading } = useQuery(fetchSession)
  const { data: user, isLoading: isUserLoading } = useQuery({
    ...fetchUserProfile,
    enabled: !!session,
  })

  // Listen for auth changes
  useEffect(() => {
    const {
      data: { subscription },
    } = supabaseService.sp.auth.onAuthStateChange((_event, _session) => {
      // Invalidate queries to update session/user data
      queryClient.invalidateQueries({ queryKey: fetchSession.queryKey })
      queryClient.invalidateQueries({ queryKey: fetchUserProfile.queryKey })

      // Invalidate router context to trigger beforeLoad checks
      router.invalidate()
    })

    return () => subscription.unsubscribe()
  }, [queryClient, router])

  const loginMutation = useMutation({
    mutationFn: async ({
      provider,
      email,
      password,
    }: {
      provider: 'google' | 'email'
      email?: string
      password?: string
    }) => {
      if (provider === 'google') {
        const res = await supabaseService.signInWithGoogle()
        if (!res) throw new Error('Failed to initiate Google login')
      } else if (provider === 'email' && email && password) {
        const { error } = await supabaseService.sp.auth.signInWithPassword({
          email,
          password,
        })
        if (error) throw error
      }
    },
    onError: (error) => {
      toast.error(error.message)
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: fetchSession.queryKey })
      router.invalidate()
    },
  })

  const signupMutation = useMutation({
    mutationFn: async ({
      email,
      password,
      name,
    }: {
      email: string
      password: string
      name: string
    }) => {
      await supabaseService.signUp(email, password, name)
    },
    onError: (error) => {
      toast.error(error.message)
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: fetchSession.queryKey })
      router.invalidate()
    },
  })

  const logoutMutation = useMutation({
    mutationFn: async () => {
      await supabaseService.signOut()
    },
    onSuccess: () => {
      queryClient.removeQueries({ queryKey: fetchSession.queryKey })
      queryClient.removeQueries({ queryKey: fetchUserProfile.queryKey })
      queryClient.clear()
      router.invalidate()
      useOnboardingStore.getState().reset()
      useOnboardingFlow.getState().reset()
      router.navigate({ to: '/auth' })
      toast.success('Logged out successfully')
    },
    onError: (error) => {
      toast.error(error.message)
    },
  })

  const value = {
    session: session ?? null,
    user: user ?? null,
    isLoading: isSessionLoading || isUserLoading,
    isAuthenticated: !!session,
    login: (provider: 'google' | 'email', email?: string, password?: string) =>
      loginMutation.mutateAsync({ provider, email, password }),
    signup: (email: string, password: string, name: string) =>
      signupMutation.mutateAsync({ email, password, name }),
    logout: logoutMutation.mutateAsync,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
