import type { Entitlements, PlanshipCustomerApi } from '@planship/fetch'
import type { EntitlementsBase } from './types.js'
import { getPlanshipCustomerContext, type IPlanshipCustomerContext } from './customerContext.js'
import { type Readable, derived } from 'svelte/store'

interface ICustomerContext<T extends EntitlementsBase> {
  planshipCustomerApiClient?: PlanshipCustomerApi
  entitlements: Readable<T>
}

export function usePlanshipCustomer(): IPlanshipCustomerContext
export function usePlanshipCustomer<TEntititlements extends EntitlementsBase>(entitlementsType: {
  new (entitlementsDict: Entitlements): TEntititlements
}): ICustomerContext<TEntititlements>
export function usePlanshipCustomer(entitlementsType?: { new (entitlementsDict: Entitlements): object }) {
  const currentContext = getPlanshipCustomerContext()
  if (entitlementsType)
    return {
      planshipCustomerApiClient: currentContext.planshipCustomerApiClient,
      entitlements: derived(currentContext.entitlements, (e) => new entitlementsType(e))
    }
  else return currentContext
}
