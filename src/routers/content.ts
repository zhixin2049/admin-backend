import { z } from 'zod'
import { router, publicProcedure, protectedProcedure } from '../trpc'
import { TRPCError } from '@trpc/server'

export const contentRouter = router({
  carousel: router({
    list: publicProcedure
      .input(z.object({ category: z.string().optional() }))
      .query(async ({ input, ctx }) => {
        const where: any = { isVisible: true }
        if (input.category) {
          where.category = input.category
        }

        const carousels = await ctx.prisma.carousel.findMany({
          where,
          orderBy: { sortOrder: 'asc' },
        })

        return carousels.map(c => ({
          ...c,
          createdAt: c.createdAt.toISOString(),
        }))
      }),

    adminList: protectedProcedure
      .query(async ({ ctx }) => {
        const carousels = await ctx.prisma.carousel.findMany({
          orderBy: { sortOrder: 'asc' },
        })

        return carousels.map(c => ({
          ...c,
          createdAt: c.createdAt.toISOString(),
        }))
      }),

    create: protectedProcedure
      .input(z.object({
        imageUrl: z.string(),
        category: z.string(),
        majorId: z.number().optional(),
        linkUrl: z.string(),
        sortOrder: z.number().optional(),
        isVisible: z.boolean().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const carousel = await ctx.prisma.carousel.create({
          data: {
            imageUrl: input.imageUrl,
            category: input.category,
            majorId: input.majorId,
            linkUrl: input.linkUrl,
            sortOrder: input.sortOrder ?? 1,
            isVisible: input.isVisible ?? true,
          },
        })

        return {
          ...carousel,
          createdAt: carousel.createdAt.toISOString(),
        }
      }),

    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        imageUrl: z.string().optional(),
        category: z.string().optional(),
        majorId: z.number().optional(),
        linkUrl: z.string().optional(),
        sortOrder: z.number().optional(),
        isVisible: z.boolean().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const { id, ...data } = input

        const carousel = await ctx.prisma.carousel.update({
          where: { id },
          data,
        })

        return {
          ...carousel,
          createdAt: carousel.createdAt.toISOString(),
        }
      }),

    remove: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input, ctx }) => {
        await ctx.prisma.carousel.delete({ where: { id: input.id } })
      }),

    reorder: protectedProcedure
      .input(z.array(z.number()))
      .mutation(async ({ input, ctx }) => {
        for (const [index, id] of input.entries()) {
          await ctx.prisma.carousel.update({
            where: { id },
            data: { sortOrder: index + 1 },
          })
        }
      }),
  }),

  major: router({
    list: publicProcedure.query(async ({ ctx }) => {
      const majors = await ctx.prisma.majorCategory.findMany({
        where: { isVisible: true },
        orderBy: { sortOrder: 'asc' },
      })

      return majors.map(m => ({
        ...m,
        createdAt: m.createdAt.toISOString(),
      }))
    }),

    adminList: protectedProcedure
      .query(async ({ ctx }) => {
        const majors = await ctx.prisma.majorCategory.findMany({
          orderBy: { sortOrder: 'asc' },
        })

        return majors.map(m => ({
          ...m,
          createdAt: m.createdAt.toISOString(),
        }))
      }),

    getBySlug: publicProcedure
      .input(z.object({ slug: z.string() }))
      .query(async ({ input, ctx }) => {
        const major = await ctx.prisma.majorCategory.findUnique({
          where: { slug: input.slug },
        })

        if (!major) {
          throw new TRPCError({ code: 'NOT_FOUND', message: '专业不存在' })
        }

        return {
          ...major,
          createdAt: major.createdAt.toISOString(),
        }
      }),

    create: protectedProcedure
      .input(z.object({
        name: z.string(),
        slug: z.string(),
        description: z.string(),
        iconText: z.string(),
        iconBgColor: z.string(),
        sortOrder: z.number().optional(),
        isVisible: z.boolean().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const existing = await ctx.prisma.majorCategory.findUnique({
          where: { slug: input.slug },
        })

        if (existing) {
          throw new TRPCError({ code: 'CONFLICT', message: '该标识已存在' })
        }

        const major = await ctx.prisma.majorCategory.create({
          data: {
            name: input.name,
            slug: input.slug,
            description: input.description,
            iconText: input.iconText,
            iconBgColor: input.iconBgColor,
            sortOrder: input.sortOrder ?? 1,
            isVisible: input.isVisible ?? true,
          },
        })

        return {
          ...major,
          createdAt: major.createdAt.toISOString(),
        }
      }),

    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        name: z.string().optional(),
        slug: z.string().optional(),
        description: z.string().optional(),
        iconText: z.string().optional(),
        iconBgColor: z.string().optional(),
        sortOrder: z.number().optional(),
        isVisible: z.boolean().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const { id, ...data } = input

        if (input.slug) {
          const existing = await ctx.prisma.majorCategory.findFirst({
            where: { slug: input.slug, id: { not: id } },
          })
          if (existing) {
            throw new TRPCError({ code: 'CONFLICT', message: '该标识已存在' })
          }
        }

        const major = await ctx.prisma.majorCategory.update({
          where: { id },
          data,
        })

        return {
          ...major,
          createdAt: major.createdAt.toISOString(),
        }
      }),

    remove: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input, ctx }) => {
        await ctx.prisma.majorCategory.delete({ where: { id: input.id } })
      }),
  }),

  videoGroup: router({
    list: publicProcedure.query(async ({ ctx }) => {
      const groups = await ctx.prisma.videoGroup.findMany({
        where: { isActive: true },
        orderBy: { sortOrder: 'asc' },
      })

      return groups.map(g => ({
        ...g,
        createdAt: g.createdAt.toISOString(),
      }))
    }),

    adminList: protectedProcedure
      .query(async ({ ctx }) => {
        const groups = await ctx.prisma.videoGroup.findMany({
          orderBy: { sortOrder: 'asc' },
        })

        return groups.map(g => ({
          ...g,
          createdAt: g.createdAt.toISOString(),
        }))
      }),

    create: protectedProcedure
      .input(z.object({
        groupKey: z.string(),
        groupName: z.string(),
        moreUrl: z.string(),
        sortOrder: z.number().optional(),
        isActive: z.boolean().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const existing = await ctx.prisma.videoGroup.findUnique({
          where: { groupKey: input.groupKey },
        })

        if (existing) {
          throw new TRPCError({ code: 'CONFLICT', message: '该标识已存在' })
        }

        const group = await ctx.prisma.videoGroup.create({
          data: {
            groupKey: input.groupKey,
            groupName: input.groupName,
            moreUrl: input.moreUrl,
            sortOrder: input.sortOrder ?? 1,
            isActive: input.isActive ?? true,
          },
        })

        return {
          ...group,
          createdAt: group.createdAt.toISOString(),
        }
      }),

    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        groupKey: z.string().optional(),
        groupName: z.string().optional(),
        moreUrl: z.string().optional(),
        sortOrder: z.number().optional(),
        isActive: z.boolean().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const { id, ...data } = input

        if (input.groupKey) {
          const existing = await ctx.prisma.videoGroup.findFirst({
            where: { groupKey: input.groupKey, id: { not: id } },
          })
          if (existing) {
            throw new TRPCError({ code: 'CONFLICT', message: '该标识已存在' })
          }
        }

        const group = await ctx.prisma.videoGroup.update({
          where: { id },
          data,
        })

        return {
          ...group,
          createdAt: group.createdAt.toISOString(),
        }
      }),

    remove: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input, ctx }) => {
        await ctx.prisma.videoGroup.delete({ where: { id: input.id } })
      }),
  }),

  video: router({
    list: publicProcedure
      .input(z.object({
        page: z.number().min(1),
        pageSize: z.number().min(1),
        title: z.string().optional(),
        groupId: z.number().optional(),
        majorId: z.number().optional(),
        isVisible: z.boolean().optional(),
      }))
      .query(async ({ input, ctx }) => {
        const { page, pageSize, title, groupId, isVisible } = input
        const where: any = {}

        if (title) where.title = { contains: title }
        if (groupId) where.groupId = groupId
        if (isVisible !== undefined) where.isVisible = isVisible

        const [list, total] = await Promise.all([
          ctx.prisma.video.findMany({
            where,
            include: { group: true },
            skip: (page - 1) * pageSize,
            take: pageSize,
            orderBy: { createdAt: 'desc' },
          }),
          ctx.prisma.video.count({ where }),
        ])

        return {
          list: list.map(v => ({
            ...v,
            groupName: v.group.groupName,
            majorIds: [],
            createdAt: v.createdAt.toISOString(),
          })),
          total,
          page,
          pageSize,
        }
      }),

    adminList: protectedProcedure
      .input(z.object({
        page: z.number().min(1),
        pageSize: z.number().min(1),
        title: z.string().optional(),
        groupId: z.number().optional(),
        majorId: z.number().optional(),
        isVisible: z.boolean().optional(),
      }))
      .query(async ({ input, ctx }) => {
        const { page, pageSize, title, groupId, isVisible } = input
        const where: any = {}

        if (title) where.title = { contains: title }
        if (groupId) where.groupId = groupId
        if (isVisible !== undefined) where.isVisible = isVisible

        const [list, total] = await Promise.all([
          ctx.prisma.video.findMany({
            where,
            include: { group: true },
            skip: (page - 1) * pageSize,
            take: pageSize,
            orderBy: { createdAt: 'desc' },
          }),
          ctx.prisma.video.count({ where }),
        ])

        return {
          list: list.map(v => ({
            ...v,
            groupName: v.group.groupName,
            majorIds: [],
            createdAt: v.createdAt.toISOString(),
          })),
          total,
          page,
          pageSize,
        }
      }),

    create: protectedProcedure
      .input(z.object({
        title: z.string(),
        playerTitle: z.string(),
        bilibiliUrl: z.string(),
        organizer: z.string(),
        organizedDate: z.string(),
        groupId: z.number(),
        majorIds: z.array(z.number()),
        description: z.string(),
        seoTitle: z.string().optional(),
        seoDescription: z.string().optional(),
        seoKeywords: z.string().optional(),
        canonicalUrl: z.string().optional(),
        isVisible: z.boolean().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const group = await ctx.prisma.videoGroup.findUnique({
          where: { id: input.groupId },
        })

        if (!group) {
          throw new TRPCError({ code: 'NOT_FOUND', message: '分组不存在' })
        }

        const video = await ctx.prisma.video.create({
          data: {
            title: input.title,
            playerTitle: input.playerTitle,
            bilibiliUrl: input.bilibiliUrl,
            organizer: input.organizer,
            organizedDate: input.organizedDate,
            groupId: input.groupId,
            majorIds: JSON.stringify(input.majorIds),
            description: input.description,
            seoTitle: input.seoTitle,
            seoDescription: input.seoDescription,
            seoKeywords: input.seoKeywords,
            canonicalUrl: input.canonicalUrl,
            isVisible: input.isVisible ?? true,
          },
          include: { group: true },
        })

        return {
          ...video,
          groupName: video.group.groupName,
          majorIds: input.majorIds,
          createdAt: video.createdAt.toISOString(),
        }
      }),

    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        title: z.string().optional(),
        playerTitle: z.string().optional(),
        bilibiliUrl: z.string().optional(),
        organizer: z.string().optional(),
        organizedDate: z.string().optional(),
        groupId: z.number().optional(),
        majorIds: z.array(z.number()).optional(),
        description: z.string().optional(),
        seoTitle: z.string().optional(),
        seoDescription: z.string().optional(),
        seoKeywords: z.string().optional(),
        canonicalUrl: z.string().optional(),
        isVisible: z.boolean().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const { id, majorIds, ...data } = input

        if (input.groupId) {
          const group = await ctx.prisma.videoGroup.findUnique({
            where: { id: input.groupId },
          })
          if (!group) {
            throw new TRPCError({ code: 'NOT_FOUND', message: '分组不存在' })
          }
        }

        const updateData: any = { ...data }
        if (majorIds !== undefined) {
          updateData.majorIds = JSON.stringify(majorIds)
        }

        const video = await ctx.prisma.video.update({
          where: { id },
          data: updateData,
          include: { group: true },
        })

        return {
          ...video,
          groupName: video.group.groupName,
          majorIds: JSON.parse(video.majorIds || '[]'),
          createdAt: video.createdAt.toISOString(),
        }
      }),

    remove: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input, ctx }) => {
        await ctx.prisma.video.delete({ where: { id: input.id } })
      }),
  }),
})
