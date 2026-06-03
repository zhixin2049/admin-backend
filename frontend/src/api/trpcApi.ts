import { trpc } from '../utils/trpc'

export const trpcAuthApi = {
  login: async (form: { username: string; password: string }) => {
    const result = await trpc.auth.login.mutate(form)
    if (result.token) {
      localStorage.setItem('admin_token', result.token)
    }
    return result
  },

  logout: async () => {
    await trpc.auth.logout.mutate()
    localStorage.removeItem('admin_token')
  },

  getProfile: async () => {
    return trpc.auth.getProfile.query()
  },
}

export const trpcMemberApi = {
  list: async (params: { page: number; pageSize: number; keyword?: string }) => {
    return trpc.member.list.query(params)
  },

  create: async (data: { username: string; password: string; phone: string; gender: 0 | 1 | 2; province: string; status?: 0 | 1 }) => {
    return trpc.member.create.mutate(data)
  },

  update: async (id: number, data: Partial<{ username: string; phone: string; gender: 0 | 1 | 2; province: string; status: 0 | 1; password: string }>) => {
    return trpc.member.update.mutate({ id, ...data })
  },

  toggleStatus: async (id: number, status: 0 | 1) => {
    return trpc.member.toggleStatus.mutate({ id, status })
  },

  login: async (account: string, password: string) => {
    return trpc.member.login.mutate({ account, password })
  },
}

export const trpcAdminApi = {
  list: async (params: { page: number; pageSize: number }) => {
    return trpc.admin.list.query(params)
  },

  create: async (data: { username: string; email: string; password: string; roleId: number; status?: 0 | 1 }) => {
    return trpc.admin.create.mutate(data)
  },

  update: async (id: number, data: Partial<{ username: string; email: string; password: string; roleId: number; status: 0 | 1 }>) => {
    return trpc.admin.update.mutate({ id, ...data })
  },

  remove: async (id: number) => {
    return trpc.admin.remove.mutate({ id })
  },
}

export const trpcRoleApi = {
  list: async () => {
    return trpc.role.list.query()
  },

  create: async (data: { name: string; slug: string; isPreset?: boolean; permissionIds?: number[] }) => {
    return trpc.role.create.mutate(data)
  },

  update: async (id: number, data: Partial<{ name: string; slug: string; isPreset?: boolean; permissionIds?: number[] }>) => {
    return trpc.role.update.mutate({ id, ...data })
  },

  remove: async (id: number) => {
    return trpc.role.remove.mutate({ id })
  },

  permissions: async () => {
    return trpc.role.permissions.query()
  },
}

export const trpcContentApi = {
  carousel: {
    list: async (category?: string) => {
      return trpc.content.carousel.list.query({ category })
    },

    adminList: async () => {
      return trpc.content.carousel.adminList.query()
    },

    create: async (data: { imageUrl: string; category: string; majorId?: number; linkUrl: string; sortOrder?: number; isVisible?: boolean }) => {
      return trpc.content.carousel.create.mutate(data)
    },

    update: async (id: number, data: Partial<{ imageUrl: string; category: string; majorId?: number; linkUrl: string; sortOrder?: number; isVisible?: boolean }>) => {
      return trpc.content.carousel.update.mutate({ id, ...data })
    },

    remove: async (id: number) => {
      return trpc.content.carousel.remove.mutate({ id })
    },

    reorder: async (ids: number[]) => {
      return trpc.content.carousel.reorder.mutate(ids)
    },
  },

  major: {
    list: async () => {
      return trpc.content.major.list.query()
    },

    adminList: async () => {
      return trpc.content.major.adminList.query()
    },

    getBySlug: async (slug: string) => {
      return trpc.content.major.getBySlug.query({ slug })
    },

    create: async (data: { name: string; slug: string; description: string; iconText: string; iconBgColor: string; sortOrder?: number; isVisible?: boolean }) => {
      return trpc.content.major.create.mutate(data)
    },

    update: async (id: number, data: Partial<{ name: string; slug: string; description: string; iconText: string; iconBgColor: string; sortOrder?: number; isVisible?: boolean }>) => {
      return trpc.content.major.update.mutate({ id, ...data })
    },

    remove: async (id: number) => {
      return trpc.content.major.remove.mutate({ id })
    },
  },

  videoGroup: {
    list: async () => {
      return trpc.content.videoGroup.list.query()
    },

    adminList: async () => {
      return trpc.content.videoGroup.adminList.query()
    },

    create: async (data: { groupKey: string; groupName: string; moreUrl: string; sortOrder?: number; isActive?: boolean }) => {
      return trpc.content.videoGroup.create.mutate(data)
    },

    update: async (id: number, data: Partial<{ groupKey: string; groupName: string; moreUrl: string; sortOrder?: number; isActive?: boolean }>) => {
      return trpc.content.videoGroup.update.mutate({ id, ...data })
    },

    remove: async (id: number) => {
      return trpc.content.videoGroup.remove.mutate({ id })
    },
  },

  video: {
    list: async (params: { page: number; pageSize: number; title?: string; groupId?: number; majorId?: number; isVisible?: boolean }) => {
      return trpc.content.video.list.query(params)
    },

    adminList: async (params: { page: number; pageSize: number; title?: string; groupId?: number; majorId?: number; isVisible?: boolean }) => {
      return trpc.content.video.adminList.query(params)
    },

    create: async (data: { title: string; playerTitle: string; bilibiliUrl: string; organizer: string; organizedDate: string; groupId: number; majorIds: number[]; description: string; seoTitle?: string; seoDescription?: string; seoKeywords?: string; canonicalUrl?: string; isVisible?: boolean }) => {
      return trpc.content.video.create.mutate(data)
    },

    update: async (id: number, data: Partial<{ title: string; playerTitle: string; bilibiliUrl: string; organizer: string; organizedDate: string; groupId: number; majorIds: number[]; description: string; seoTitle?: string; seoDescription?: string; seoKeywords?: string; canonicalUrl?: string; isVisible?: boolean }>) => {
      return trpc.content.video.update.mutate({ id, ...data })
    },

    remove: async (id: number) => {
      return trpc.content.video.remove.mutate({ id })
    },
  },
}

export const trpcSystemApi = {
  siteSettings: {
    get: async () => {
      return trpc.system.siteSettings.get.query()
    },

    save: async (data: { siteName: string; siteDescription: string; siteKeywords: string; userAgreement: string }) => {
      return trpc.system.siteSettings.save.mutate(data)
    },
  },

  navMenu: {
    list: async () => {
      return trpc.system.navMenu.list.query()
    },

    adminList: async () => {
      return trpc.system.navMenu.adminList.query()
    },

    create: async (data: { parentId?: number | null; displayName: string; linkType: string; linkUrl: string; openNewTab?: boolean; sortOrder?: number; isVisible?: boolean }) => {
      return trpc.system.navMenu.create.mutate(data)
    },

    update: async (id: number, data: Partial<{ parentId?: number | null; displayName: string; linkType: string; linkUrl: string; openNewTab?: boolean; sortOrder?: number; isVisible?: boolean }>) => {
      return trpc.system.navMenu.update.mutate({ id, ...data })
    },

    remove: async (id: number) => {
      return trpc.system.navMenu.remove.mutate({ id })
    },
  },

  footer: {
    list: async () => {
      return trpc.system.footer.list.query()
    },

    adminList: async () => {
      return trpc.system.footer.adminList.query()
    },

    create: async (data: { content: string; sortOrder?: number; isVisible?: boolean }) => {
      return trpc.system.footer.create.mutate(data)
    },

    update: async (id: number, data: Partial<{ content: string; sortOrder?: number; isVisible?: boolean }>) => {
      return trpc.system.footer.update.mutate({ id, ...data })
    },

    remove: async (id: number) => {
      return trpc.system.footer.remove.mutate({ id })
    },
  },
}

export const trpcDashboardApi = {
  getStats: async () => {
    return trpc.dashboard.getStats.query()
  },

  getGroupVideoStats: async () => {
    return trpc.dashboard.getGroupVideoStats.query()
  },

  getMajorVideoStats: async () => {
    return trpc.dashboard.getMajorVideoStats.query()
  },
}
