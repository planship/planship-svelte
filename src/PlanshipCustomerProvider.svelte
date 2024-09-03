<script lang="ts">
    import { PlanshipCustomer } from '@planship/fetch';
    import type { Entitlements } from '@planship/fetch';
    import { setPlanshipCustomerContext } from './customerContext.js';
    import type { CustomerProviderConfig } from './types.js';
    import { writable } from 'svelte/store';

    export let config: CustomerProviderConfig

    const entitlements = writable<Entitlements>({})
    const { baseUrl, webSocketUrl, slug, getAccessToken, customerId } = config
    const planshipCustomerApiClient = new PlanshipCustomer(slug,  customerId, getAccessToken, {
      baseUrl,
      webSocketUrl
    })

    planshipCustomerApiClient.getEntitlements(entitlements.set).then(entitlements.set)

    setPlanshipCustomerContext(
      {
        planshipCustomerApiClient,
        entitlements
      }
    )

  </script>

  <slot />
