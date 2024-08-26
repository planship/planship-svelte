import { CustomerSubscriptionWithPlan, Entitlements, PlanshipCustomerApi } from '@planship/fetch'
import { EntitlementsBase } from './types.js'
import { getPlanshipCustomerContext, IPlanshipCustomerContext } from './customerContext.js'
import { get, Readable, derived } from 'svelte/store'


interface ICustomerContext<T extends EntitlementsBase> {
    planshipCustomerApiClient?: PlanshipCustomerApi
    entitlements: Readable<T>
    subscriptions: Readable<CustomerSubscriptionWithPlan[]>
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
      subscriptions: currentContext.subscriptions,
      entitlements: derived(currentContext.entitlements, (e) => new entitlementsType(e))
    }
  else return currentContext
}
