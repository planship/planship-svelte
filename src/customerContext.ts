import type { Entitlements, PlanshipCustomerApi } from '@planship/fetch'
import { getContext, setContext } from 'svelte'
import type { Readable } from 'svelte/store'

const _contextKey = '$$_planshipCustomer'

export interface IPlanshipCustomerContext {
  planshipCustomerApiClient?: PlanshipCustomerApi
  entitlements: Readable<Entitlements>
}

/** Retrieves a Client from Svelte's context */
export const getPlanshipCustomerContext = (): IPlanshipCustomerContext => {
  const context = getContext(_contextKey)
  if (!context) {
    throw new Error(
      'No Planship customer context was found in Svelte context. Did you forget to wrap your component with PlanshipProvider?',
    )
  }

  return context as IPlanshipCustomerContext
}

/** Sets a Planship context on Svelte's context */
export const setPlanshipCustomerContext = (context: IPlanshipCustomerContext): void => {
  setContext(_contextKey, context)
}
