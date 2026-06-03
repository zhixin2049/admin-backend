import { z } from 'zod'
import { router, protectedProcedure } from '../trpc'

export const roleRouter = router({
  list: protectedProcedure.query(async ({ ctx }) => {
    const roles = await ctx.prisma.role.findMany({
      orderBy: { createdAt: 'asc' },
    })
    return roles.map(r => ({
      ...r,
      createdAt: r.createdAt.toISOString(),
    }))
  }),

  permissions: protectedProcedure.query(async () => {
    const resources = ['dashboard', 'member', 'admin', 'role', 'carousel', 'major', 'video', 'siteSettings', 'navMenu', 'footer']
    const actions = ['read', 'write', 'delete']
    
    return resources.flatMap((resource, ri) =>
      actions.map((action, ai) => ({
        id: ri * 10 + ai + 1,
        resource,
        action,
        name: `${resource}:${action}`,
      }))
    )
  }),
})
