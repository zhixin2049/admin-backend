import { z } from 'zod'
import { router, publicProcedure, protectedProcedure } from '../trpc'
import bcrypt from 'bcryptjs'
import { TRPCError } from '@trpc/server'

export const memberRouter = router({
  list: protectedProcedure
    .input(z.object({
      page: z.number().min(1),
      pageSize: z.number().min(1),
      keyword: z.string().optional(),
    }))
    .query(async ({ input, ctx }) => {
      const { page, pageSize, keyword } = input
      const where: any = {}

      if (keyword) {
        where.OR = [
          { username: { contains: keyword } },
          { phone: { contains: keyword } },
        ]
      }

      const [list, total] = await Promise.all([
        ctx.prisma.member.findMany({
          where,
          skip: (page - 1) * pageSize,
          take: pageSize,
          orderBy: { registeredAt: 'desc' },
        }),
        ctx.prisma.member.count({ where }),
      ])

      return {
        list: list.map(m => ({
          ...m,
          registeredAt: m.registeredAt.toISOString(),
          lastLoginAt: m.lastLoginAt?.toISOString(),
        })),
        total,
        page,
        pageSize,
      }
    }),

  create: protectedProcedure
    .input(z.object({
      username: z.string(),
      password: z.string(),
      phone: z.string(),
      gender: z.number().int().min(0).max(2),
      province: z.string(),
      status: z.number().int().min(0).max(1).optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const existing = await ctx.prisma.member.findFirst({
        where: {
          OR: [{ username: input.username }, { phone: input.phone }],
        },
      })

      if (existing) {
        if (existing.username === input.username) {
          throw new TRPCError({ code: 'CONFLICT', message: '该账号名已被注册' })
        }
        if (existing.phone === input.phone) {
          throw new TRPCError({ code: 'CONFLICT', message: '该手机号已被注册' })
        }
      }

      const hashedPassword = await bcrypt.hash(input.password, 10)

      const member = await ctx.prisma.member.create({
        data: {
          username: input.username,
          password: hashedPassword,
          phone: input.phone,
          gender: input.gender,
          province: input.province,
          status: input.status ?? 1,
        },
      })

      return {
        ...member,
        registeredAt: member.registeredAt.toISOString(),
        lastLoginAt: member.lastLoginAt?.toISOString(),
      }
    }),

  update: protectedProcedure
    .input(z.object({
      id: z.number(),
      username: z.string().optional(),
      phone: z.string().optional(),
      gender: z.number().int().min(0).max(2).optional(),
      province: z.string().optional(),
      status: z.number().int().min(0).max(1).optional(),
      password: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const { id, password, ...data } = input

      const existing = await ctx.prisma.member.findUnique({ where: { id } })
      if (!existing) {
        throw new TRPCError({ code: 'NOT_FOUND', message: '用户不存在' })
      }

      const updateData: any = { ...data }
      if (password) {
        updateData.password = await bcrypt.hash(password, 10)
      }

      const member = await ctx.prisma.member.update({
        where: { id },
        data: updateData,
      })

      return {
        ...member,
        registeredAt: member.registeredAt.toISOString(),
        lastLoginAt: member.lastLoginAt?.toISOString(),
      }
    }),

  toggleStatus: protectedProcedure
    .input(z.object({
      id: z.number(),
      status: z.number().int().min(0).max(1),
    }))
    .mutation(async ({ input, ctx }) => {
      await ctx.prisma.member.update({
        where: { id: input.id },
        data: { status: input.status },
      })
    }),

  login: publicProcedure
    .input(z.object({
      account: z.string(),
      password: z.string(),
    }))
    .mutation(async ({ input, ctx }) => {
      const member = await ctx.prisma.member.findFirst({
        where: {
          OR: [{ username: input.account }, { phone: input.account }],
        },
      })

      if (!member) {
        throw new TRPCError({ code: 'UNAUTHORIZED', message: '账号未注册，请先注册' })
      }

      if (member.status === 0) {
        throw new TRPCError({ code: 'FORBIDDEN', message: '该账号已被禁用' })
      }

      const isValid = await bcrypt.compare(input.password, member.password)
      if (!isValid) {
        throw new TRPCError({ code: 'UNAUTHORIZED', message: '密码错误' })
      }

      await ctx.prisma.member.update({
        where: { id: member.id },
        data: { lastLoginAt: new Date() },
      })

      return {
        ...member,
        registeredAt: member.registeredAt.toISOString(),
        lastLoginAt: member.lastLoginAt?.toISOString(),
      }
    }),
})
