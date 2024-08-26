import { getPlanshipContext, IPlanshipContext } from './context.js'

export function usePlanship(context?: IPlanshipContext): IPlanshipContext {
  if (context) return context
  return getPlanshipContext()
}
