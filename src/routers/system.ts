import { z } from 'zod'
import { router, publicProcedure, protectedProcedure } from '../trpc'

export const systemRouter = router({
  siteSettings: router({
    get: publicProcedure.query(async ({ ctx }) => {
      const settings = await ctx.prisma.siteSettings.findFirst()
      if (!settings) {
        return {
          siteName: '',
          siteDescription: '',
          siteKeywords: '',
          userAgreement: '',
        }
      }
      return settings
    }),

    save: protectedProcedure
      .input(z.object({
        siteName: z.string(),
        siteDescription: z.string(),
        siteKeywords: z.string(),
        userAgreement: z.string(),
      }))
      .mutation(async ({ input, ctx }) => {
        const existing = await ctx.prisma.siteSettings.findFirst()

        if (existing) {
          return ctx.prisma.siteSettings.update({
            where: { id: existing.id },
            data: input,
          })
        }

        return ctx.prisma.siteSettings.create({ data: input })
      }),
  }),

  navMenu: router({
    list: publicProcedure.query(async ({ ctx }) => {
      const menus = await ctx.prisma.navMenu.findMany({
        where: { isVisible: true },
        orderBy: { sortOrder: 'asc' },
      })

      const menuMap = new Map<number | null, any[]>()
      menus.forEach(menu => {
        const parentId = menu.parentId ?? null
        if (!menuMap.has(parentId)) {
          menuMap.set(parentId, [])
        }
        menuMap.get(parentId)!.push(menu)
      })

      const buildTree = (parentId: number | null): any[] => {
        const children = menuMap.get(parentId) || []
        return children.map(child => ({
          ...child,
          children: buildTree(child.id),
        }))
      }

      return buildTree(null)
    }),

    adminList: protectedProcedure
      .query(async ({ ctx }) => {
        const menus = await ctx.prisma.navMenu.findMany({
          orderBy: { sortOrder: 'asc' },
        })

        return menus
      }),

    create: protectedProcedure
      .input(z.object({
        parentId: z.number().optional().nullable(),
        displayName: z.string(),
        linkType: z.string(),
        linkUrl: z.string(),
        openNewTab: z.boolean().optional(),
        sortOrder: z.number().optional(),
        isVisible: z.boolean().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        return ctx.prisma.navMenu.create({
          data: {
            parentId: input.parentId ?? null,
            displayName: input.displayName,
            linkType: input.linkType,
            linkUrl: input.linkUrl,
            openNewTab: input.openNewTab ?? false,
            sortOrder: input.sortOrder ?? 1,
            isVisible: input.isVisible ?? true,
          },
        })
      }),

    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        parentId: z.number().optional().nullable(),
        displayName: z.string().optional(),
        linkType: z.string().optional(),
        linkUrl: z.string().optional(),
        openNewTab: z.boolean().optional(),
        sortOrder: z.number().optional(),
        isVisible: z.boolean().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const { id, ...data } = input
        const normalizedData: any = { ...data }
        if (normalizedData.parentId === undefined || normalizedData.parentId === null) {
          normalizedData.parentId = null
        }

        return ctx.prisma.navMenu.update({
          where: { id },
          data: normalizedData,
        })
      }),

    remove: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input, ctx }) => {
        await ctx.prisma.navMenu.delete({ where: { id: input.id } })
      }),
  }),

  footer: router({
    list: publicProcedure.query(async ({ ctx }) => {
      const items = await ctx.prisma.footerItem.findMany({
        where: { isVisible: true },
        orderBy: { sortOrder: 'asc' },
      })

      return items.map(item => ({
        ...item,
        createdAt: item.createdAt.toISOString(),
      }))
    }),

    adminList: protectedProcedure
      .query(async ({ ctx }) => {
        const items = await ctx.prisma.footerItem.findMany({
          orderBy: { sortOrder: 'asc' },
        })

        return items.map(item => ({
          ...item,
          createdAt: item.createdAt.toISOString(),
        }))
      }),

    create: protectedProcedure
      .input(z.object({
        content: z.string(),
        sortOrder: z.number().optional(),
        isVisible: z.boolean().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const item = await ctx.prisma.footerItem.create({
          data: {
            content: input.content,
            sortOrder: input.sortOrder ?? 1,
            isVisible: input.isVisible ?? true,
          },
        })

        return {
          ...item,
          createdAt: item.createdAt.toISOString(),
        }
      }),

    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        content: z.string().optional(),
        sortOrder: z.number().optional(),
        isVisible: z.boolean().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const { id, ...data } = input

        const item = await ctx.prisma.footerItem.update({
          where: { id },
          data,
        })

        return {
          ...item,
          createdAt: item.createdAt.toISOString(),
        }
      }),

    remove: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input, ctx }) => {
        await ctx.prisma.footerItem.delete({ where: { id: input.id } })
      }),
  }),
})
