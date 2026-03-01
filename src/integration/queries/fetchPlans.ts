import { getContinent } from '@/lib'
import type { PlanObject } from '@/types'
import { queryOptions } from '@tanstack/react-query'
import { supabaseService } from '~supabase/clientServices'

export const fetchPlansKey = 'plans'

export const fetchPlans = queryOptions({
  queryKey: [fetchPlansKey],
  queryFn: async () => {
    const continent = getContinent()

    const { data } = await supabaseService.sp.functions.invoke(
      `subscription/plans?c=${continent}`,
      { method: 'GET' },
    )

    return data as PlanObject[]
  },
  staleTime: 'static',
})
