import { getPlanshipContext, IPlanshipContext } from './context.js'

export function usePlanship(): IPlanshipContext {
  return getPlanshipContext()
}
