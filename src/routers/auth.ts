import { z } from 'zod'
import { router, publicProcedure, protectedProcedure } from '../trpc'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { TRPCError } from '@trpc/server'

export const authRouter = router({
  login: publicProcedure
    .input(z.object({
      username: z.string(),
      password: z.string(),
    }))
    .mutation(async ({ input, ctx }) => {
      const admin = await ctx.prisma.admin.findUnique({
        where: { username: input.username },
        include: { role: true },
      })

      if (!admin) {
        throw new TRPCError({ code: 'UNAUTHORIZED', message: '账号或密码错误' })
      }

      if (admin.status === 0) {
        throw new TRPCError({ code: 'FORBIDDEN', message: '该账号已被禁用' })
      }

      const isValid = await bcrypt.compare(input.password, admin.password)
      if (!isValid) {
        throw new TRPCError({ code: 'UNAUTHORIZED', message: '账号或密码错误' })
      }

      await ctx.prisma.admin.update({
        where: { id: admin.id },
        data: { lastLoginAt: new Date() },
      })

      const token = jwt.sign({ id: admin.id }, process.env.JWT_SECRET || 'secret', { expiresIn: '7d' })

      return {
        token,
        admin: {
          id: admin.id,
          username: admin.username,
          email: admin.email,
          roleId: admin.roleId,
          roleName: admin.role.name,
          role: admin.role.slug,
          status: admin.status,
          lastLoginAt: admin.lastLoginAt?.toISOString(),
          createdAt: admin.createdAt.toISOString(),
        },
      }
    }),

  logout: protectedProcedure
    .mutation(() => {
      return { success: true }
    }),

  getProfile: protectedProcedure
    .query(async ({ ctx }) => {
      const admin = await ctx.prisma.admin.findUnique({
        where: { id: ctx.admin?.id },
        include: { role: true },
      })
      
      if (!admin) {
        throw new TRPCError({ code: 'UNAUTHORIZED', message: '未登录' })
      }

      return {
        id: admin.id,
        username: admin.username,
        email: admin.email,
        roleId: admin.roleId,
        roleName: admin.role.name,
        role: admin.role.slug,
        status: admin.status,
        lastLoginAt: admin.lastLoginAt?.toISOString(),
        createdAt: admin.createdAt.toISOString(),
      }
    }),
})
