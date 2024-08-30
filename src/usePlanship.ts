import { getPlanshipContext, type IPlanshipContext } from './context.js'

export function usePlanship(context?: IPlanshipContext): IPlanshipContext {
  return context || getPlanshipContext() ?
}
