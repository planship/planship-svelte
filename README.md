# planship-svelte

Welcome to `@planship/svelte`, a Svelte library that enables entitlements, metering, plan packaging, and customer/subscription management in your [Svelte](https://svelte.dev/) and [SvelteKit]https://kit.svelte.dev/) apps powered by [Planship](https://planship.io). This SDK is built on top of the [@planship/fetch](https://github.com/planship/planship-js/tree/master/packages/fetch) JavaScript library and uses the Svelte [Context API](https://learn.svelte.dev/tutorial/context-api) and [stores](https://svelte.dev/docs/svelte-store).

## The basics

The Planship Svelte SDK implements two context providers:

- [`PlanshipCustomerProvider`](#planshipcustomer-context-provider) that exposes an instance of the [Planship Customer API client class](https://github.com/planship/planship-js/blob/master/packages/fetch/docs/classes/PlanshipCustomer.md) initialized for a specific customer as well as their `entitlements` that are continously updated via a WebSocket connection. This context is accessible in any child component via the `usePlanshipCustomer` function.

- [`PlanshipProvider`](#planship-context-provider) that exposes an instance of the [Planship API client class](https://github.com/planship/planship-js/blob/master/packages/fetch/docs/classes/Planship.md). This context is accessible in any child component via the `usePlanship` function.

## Installation

Install `@planship/svelte` with npm, yarn or pnpm:

```sh
npm install @planship/svelte --save-dev
# or
yarn add -D @planship/svelte
# or
pnpm add -D @planship/svelte
```

## Working with entitlements and other customer data - `PlanshipCustomerProvider` and `usePlanshipCustomer`

In most rendering scenarios, your app will need to fetch and evaluate Planship entitlements for a specific customer. This can be accomplished with `PlanshipCustomerProvider`, which initializes a Planship API instance for a specific customer, continously fetches their `entitlements`, and exposes them via a reactive Svelte store.


### Initialization

First, initialize `PlanshipCustomerProvider` near the root of your app. Please note that `PlanshipCustomerProvider` can be used only within a context where the Planship customer ID (typically your current user) is known (E.g. a top level `layout.svelte` for a group of routes that require authentication).


```svelte
<script lang="ts">
  import { PlanshipCustomerProvider } from `@planship/svelte`
  import { getContext } from 'svelte'

  // Planship access token getter function that retrieves a Planship access token from the application backend
  const getAccessToken = () => {
    return fetch('/api/planshipToken').then((r: Response) => r.text())
  }

  // retrieve currently authenticated user stored in the context
  const user: Readable = getContext('$currentUser')
</script>

<PlanshipCustomerProvider config={{ slug:'clicker-demo', customerId: $user.id, getAccessToken }}>
  <slot/>
</PlanshipCustomerProvider>
```

`PlanshipCustomerProvider` has to be configured via `config` parameter that has the following mandatory properties:

- **`slug`** - your [Planship product slug](https://docs.planship.io/concepts/products/)
- **`customerId`** - your [Planship customer id](https://docs.planship.io/concepts/customers/)
- **`getAccessToken`** - function (or promise) that returns a Planship access token

### Authentication with Planship and `getAccessToken` function

Since `PlanshipCustomerProvider` is initialized in the client-side code (or in both client- and server-side code when used with SvelteKit), security credentials cannot be used to authenticate with Planship. Instead, retrieve a Planship access token on your application server, and return it using an existing secure connection to your backend.

Below is an example `+server.ts` module for a SvelteKit API endpoint that retrieves a token from the Planship API:

```ts
import { env } from '$env/dynamic/private'
import { Planship } from '@planship/svelte'

export async function GET() {
  const planship = new Planship('planship', {clientId: env.PLANSHIP_CLIENT_ID, clientSecret: env.PLANSHIP_CLIENT_SECRET })
  const token = await planship.getAccessToken()
  return new Response(token.accessToken)
}
```

### Consuming entitlements in your pages and components

With `PlanshipCustomerProvider` intialized,  call `usePlanshipCustomer` in any page or component code to access customer entitlements.

The example below shows how to retrieve customer entitlements and use them for conditional rendering within your pages and components. Please note that the `entitlements` dictionary is wrapped in a Svelte store.

```svelte
<script lang='ts'>
  import { usePlanshipCustomer } from '@planship/svelte'

  const { entitlements } = usePlanshipCustomer()
</script>

{#if $entitlements['advanced-analytics']}
  <a to="/analytics">Analytics</a>
{/if}
```

### Fetching additional customer data from Planship

Your app may need to fetch additional customer data from Planship (E.g. customer subscription or usage data). To accomplish any Planship API operation use an instance of the [Planship Customer API client](https://github.com/planship/planship-js/blob/master/packages/fetch/docs/interfaces/PlanshipCustomerApi.md) returned by the `usePlanshipCustomer` function.

The example below shows Svelte component (or page) initialization code that retrieves a list of subscriptions for the current customer.

```svelte
<script lang='ts'>
  import { usePlanshipCustomer } from '@planship/svelte'

  const { planshipCustomerApiClient } = usePlanshipCustomer()
  const subscriptions = await planshipCustomerApiClient.listSubscriptions()
</script>
```

### Strongly typed entitlement object

When working with the entitlements dictionary returned by `usePlanshipCustomer`, it can be useful to wrap it in an object with getters for individual levers. This is especially advantageous in IDEs like VS Code where it enables autocomplete for `entitlements`.

To accomplish this, define an entitlements class for your product, and pass it to `usePlanshipCustomer`.

```svelte
<script lang='ts'>
  import { usePlanshipCustomer, EntitlementsBase } from '@planship/svelte'

  class MyEntitlements extends EntitlementsBase {
    get apiCallsPerMonth(): number {
      return this.entitlementsDict?.['api-calls-per-month'].valueOf()
    }
    get advancedAnalytics(): boolean {
      return this.entitlementsDict?.['advanced-analytics']
    }
  }

  // entitlements is of Readable<MyEntitlements> type
  const { entitlements } = await usePlanshipCustomer(MyEntitlements)
</script>

{#if $entitlements.advancedAnalytics}
  <a to="/analytics">Analytics</a>
{/if}
```

## Working with plans and other product data - `PlanshipProvider` and `usePlanship`

If the current customer context is unknown (E.g. pages of your app that don't require authentication like a pricing page) , use `PlanshipProvider` that provides a Svelte context that contains an instance of the [Planship API client](https://github.com/planship/planship-js/blob/master/packages/fetch/docs/interfaces/PlanshipApi.md). `PlanshipProvider` is not customer specific, so you need only your [Planship product slug](https://docs.planship.io/concepts/products/) and a [Planship token getter](#authentication-with-planship-and-getaccesstoken-function) to initialize it.

```svelte
<script lang="ts">
  import { PlanshipProvider } from `@planship/svelte`

  // Planship access token getter function that retrives a Planship access token from the application backend
  const getAccessToken = () => {
    return fetch("/api/planshipToken").then((r: Response) => r.text())
  }
</script>

<PlanshipProvider config={{ slug:'clicker-demo', getAccessToken }}>
  <slot/>
</PlanshipProvider>
```

With `PlanshipProvider` initialized, you can access the Planship API client instance in any of your page and component code via `usePlanship` function.

Below is an example Svelte script that retrieves a list of Planship plans.

```svelte
<script lang='ts'>
  import { usePlanship } from '@planship/svelte'

  const { planshipApiClient } = usePlanship()
  const plans = await planshipApiClient.listPlans()
</script>
```

## Usage with SvelteKit

This library can be used in SvelteKit applications as is. However, since `usePlanship` and `usePlanshipCustomer` rely on the Context API, they are available only in your layout/page/component initialization code.
If you would like to fetch data from Planship inside your [page or layout load function](https://kit.svelte.dev/docs/load) instead, simply import and instantiate a [Planship](https://github.com/planship/planship-js/blob/master/packages/fetch/docs/classes/Planship.md) or [Planship Customer](https://github.com/planship/planship-js/blob/master/packages/fetch/docs/classes/PlanshipCustomer.md) API client directly.

The example below shows a `+layout.ts' module with a load function that fetches a list of plans from Planship and passes it to the layout via layout data (along with the API client instance).

```ts
import type { LayoutLoad } from './$types'
import { Planship } from '@planship/svelte'

export const load: LayoutLoad = async ({ fetch }) => {

  const planshipTokenGetter = () => {
    return fetch("/api/planshipToken").then((r: Response) => r.text())
  }

  const planshipApi: Planship = new Planship('clicker-demo', planshipTokenGetter)

  // Get the org list
  const plans = await planshipApi.listPlans()

  return {
    planshipApi,
    plans
  }
}
```

## Links

- [@planship/fetch library at the NPM Registry](https://www.npmjs.com/package/@planship/fetch)
- [Planship documentation](https://docs.planship.io)
- [Planship console](https://app.planship.io)
