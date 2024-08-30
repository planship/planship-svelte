<script lang="ts">
    import { PlanshipCustomer } from '@planship/fetch';
    import type { CustomerSubscriptionWithPlan, Entitlements } from '@planship/fetch';
    import { setPlanshipCustomerContext } from './customerContext.js';
    import type { CustomerProviderConfig } from './types.js';
    import { writable } from 'svelte/store';

    export let config: CustomerProviderConfig

    const entitlements = writable<Entitlements>({})
    const subscriptions = writable<CustomerSubscriptionWithPlan[]>([])
    const { baseUrl, webSocketUrl, slug, getAccessToken, customerId } = config
    const planshipCustomerApiClient = new PlanshipCustomer(slug,  customerId, getAccessToken, {
      baseUrl,
      webSocketUrl
    })

    planshipCustomerApiClient.getEntitlements(entitlements.set).then(entitlements.set)
    planshipCustomerApiClient.listSubscriptions().then((s) => { subscriptions.set(s) })

    setPlanshipCustomerContext(
      {
        planshipCustomerApiClient,
        entitlements,
        subscriptions
      }
    )

  </script>

  <slot />
