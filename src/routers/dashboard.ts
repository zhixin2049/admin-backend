import { router, protectedProcedure } from '../trpc'

export const dashboardRouter = router({
  getStats: protectedProcedure
    .query(async ({ ctx }) => {
      const [totalMembers, totalMajors, todayNewMembers, activeAdmins] = await Promise.all([
        ctx.prisma.member.count(),
        ctx.prisma.majorCategory.count({ where: { isVisible: true } }),
        ctx.prisma.member.count({
          where: {
            registeredAt: {
              gte: new Date(new Date().toDateString()),
            },
          },
        }),
        ctx.prisma.admin.count({ where: { status: 1 } }),
      ])

      return {
        totalMembers,
        totalMajors,
        todayNewMembers,
        activeAdmins,
      }
    }),

  getGroupVideoStats: protectedProcedure
    .query(async ({ ctx }) => {
      const groups = await ctx.prisma.videoGroup.findMany({
        where: { isActive: true },
        include: { videos: true },
      })

      return groups.map(group => ({
        groupName: group.groupName,
        count: group.videos.length,
      }))
    }),

  getMajorVideoStats: protectedProcedure
    .query(async ({ ctx }) => {
      const majors = await ctx.prisma.majorCategory.findMany({
        where: { isVisible: true },
      })

      return majors.map(major => ({
        majorName: major.name,
        count: 0,
      }))
    }),
})
