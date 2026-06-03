import { router } from '../trpc'
import { authRouter } from './auth'
import { memberRouter } from './member'
import { adminRouter } from './admin'
import { roleRouter } from './role'
import { contentRouter } from './content'
import { systemRouter } from './system'
import { dashboardRouter } from './dashboard'

export const appRouter = router({
  auth: authRouter,
  member: memberRouter,
  admin: adminRouter,
  role: roleRouter,
  content: contentRouter,
  system: systemRouter,
  dashboard: dashboardRouter,
})

export type AppRouter = typeof appRouter
