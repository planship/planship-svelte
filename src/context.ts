import type { PlanshipApi } from '@planship/fetch'
import { getContext, setContext } from 'svelte'

const _contextKey = '$$_planship'

export interface IPlanshipContext {
  planshipApiClient?: PlanshipApi
}

/** Retrieves a Planship context from Svelte's context */
export const getPlanshipContext = (): IPlanshipContext => {
  const context = getContext(_contextKey)
  if (!context) {
    throw new Error(
      'No Planship context was found in Svelte context. Did you forget to wrap your component with PlanshipProvider?',
    )
  }

  return context as IPlanshipContext
}

/** Sets a Planship context on Svelte's context */
export const setPlanshipContext = (context: IPlanshipContext): void => {
  setContext(_contextKey, context)
}
