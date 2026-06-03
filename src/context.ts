import { inferAsyncReturnType } from '@trpc/server'
import * as trpcExpress from '@trpc/server/adapters/express'
import jwt from 'jsonwebtoken'
import { prisma } from './prisma'

export async function createContext({
  req,
  res,
}: trpcExpress.CreateExpressContextOptions) {
  const token = req.headers.authorization?.split(' ')[1]
  let admin: any = null

  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { id: number }
      admin = await prisma.admin.findUnique({
        where: { id: decoded.id },
        include: { role: true },
      })
    } catch {
      admin = null
    }
  }

  return { req, res, admin, prisma }
}

export type Context = inferAsyncReturnType<typeof createContext>
