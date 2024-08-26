<script lang="ts">
  import { Planship } from '@planship/fetch';
  import { setPlanshipContext } from './context.js';
  import type { ProviderConfig } from './types.js';

  export let config: ProviderConfig

  const { baseUrl, webSocketUrl, slug, getAccessToken } = config


  const planshipApiClient = new Planship(slug,  getAccessToken, {
    baseUrl,
    webSocketUrl
  })

  setPlanshipContext(
    { planshipApiClient }
  )

</script>

<slot />
