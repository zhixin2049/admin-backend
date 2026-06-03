import { z } from 'zod'
import { router, protectedProcedure } from '../trpc'
import bcrypt from 'bcryptjs'
import { TRPCError } from '@trpc/server'

export const adminRouter = router({
  list: protectedProcedure
    .input(z.object({
      page: z.number().min(1),
      pageSize: z.number().min(1),
    }))
    .query(async ({ input, ctx }) => {
      const { page, pageSize } = input

      const [list, total] = await Promise.all([
        ctx.prisma.admin.findMany({
          skip: (page - 1) * pageSize,
          take: pageSize,
          include: { role: true },
          orderBy: { createdAt: 'desc' },
        }),
        ctx.prisma.admin.count(),
      ])

      return {
        list: list.map(a => ({
          ...a,
          roleName: a.role.name,
          role: a.role.slug,
          lastLoginAt: a.lastLoginAt?.toISOString(),
          createdAt: a.createdAt.toISOString(),
        })),
        total,
        page,
        pageSize,
      }
    }),

  create: protectedProcedure
    .input(z.object({
      username: z.string(),
      email: z.string().email(),
      password: z.string(),
      roleId: z.number(),
      status: z.number().int().min(0).max(1).optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const existing = await ctx.prisma.admin.findUnique({
        where: { username: input.username },
      })

      if (existing) {
        throw new TRPCError({ code: 'CONFLICT', message: '该账号名已存在' })
      }

      const role = await ctx.prisma.role.findUnique({ where: { id: input.roleId } })
      if (!role) {
        throw new TRPCError({ code: 'NOT_FOUND', message: '角色不存在' })
      }

      const hashedPassword = await bcrypt.hash(input.password, 10)

      const admin = await ctx.prisma.admin.create({
        data: {
          username: input.username,
          email: input.email,
          password: hashedPassword,
          roleId: input.roleId,
          status: input.status ?? 1,
        },
        include: { role: true },
      })

      return {
        ...admin,
        roleName: admin.role.name,
        role: admin.role.slug,
        lastLoginAt: admin.lastLoginAt?.toISOString(),
        createdAt: admin.createdAt.toISOString(),
      }
    }),

  update: protectedProcedure
    .input(z.object({
      id: z.number(),
      username: z.string().optional(),
      email: z.string().email().optional(),
      password: z.string().optional(),
      roleId: z.number().optional(),
      status: z.number().int().min(0).max(1).optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const { id, password, roleId, ...data } = input

      const existing = await ctx.prisma.admin.findUnique({ where: { id } })
      if (!existing) {
        throw new TRPCError({ code: 'NOT_FOUND', message: '管理员不存在' })
      }

      const updateData: any = { ...data }
      if (password) {
        updateData.password = await bcrypt.hash(password, 10)
      }
      if (roleId) {
        updateData.roleId = roleId
      }

      const admin = await ctx.prisma.admin.update({
        where: { id },
        data: updateData,
        include: { role: true },
      })

      return {
        ...admin,
        roleName: admin.role.name,
        role: admin.role.slug,
        lastLoginAt: admin.lastLoginAt?.toISOString(),
        createdAt: admin.createdAt.toISOString(),
      }
    }),

  remove: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input, ctx }) => {
      await ctx.prisma.admin.delete({ where: { id: input.id } })
    }),
})
