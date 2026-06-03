import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  // 创建默认角色
  const existingRoles = await prisma.role.count()
  if (existingRoles === 0) {
    const superAdminRole = await prisma.role.create({
      data: {
        name: '超级管理员',
        slug: 'superadmin',
        isPreset: true,
      },
    })

    await prisma.role.create({
      data: {
        name: '内容编辑',
        slug: 'editor',
        isPreset: false,
      },
    })

    // 创建默认管理员
    const hashedPassword = await bcrypt.hash('admin123', 10)
    await prisma.admin.create({
      data: {
        username: 'admin',
        email: 'admin@example.com',
        password: hashedPassword,
        roleId: superAdminRole.id,
        status: 1,
      },
    })

    console.log('Created default admin: admin/admin123')
  }

  // 创建专业分类
  const existingMajors = await prisma.majorCategory.count()
  if (existingMajors === 0) {
    const majors = [
      { name: '哲学', slug: 'zhexue', description: '人文科学', iconText: '哲', iconBgColor: '#e3f2fd', sortOrder: 1 },
      { name: '经济学', slug: 'jingjixue', description: '社会科学', iconText: '经', iconBgColor: '#e8f5e9', sortOrder: 2 },
      { name: '法学', slug: 'faxue', description: '社会科学', iconText: '法', iconBgColor: '#f3e5f5', sortOrder: 3 },
      { name: '教育学', slug: 'jiaoyuxue', description: '社会科学', iconText: '教', iconBgColor: '#fff3e0', sortOrder: 4 },
      { name: '文学', slug: 'wenxue', description: '人文科学', iconText: '文', iconBgColor: '#fce4ec', sortOrder: 5 },
      { name: '历史学', slug: 'lishixue', description: '人文科学', iconText: '史', iconBgColor: '#fff8e1', sortOrder: 6 },
      { name: '理学', slug: 'lixue', description: '自然科学', iconText: '理', iconBgColor: '#e0f2f1', sortOrder: 7 },
      { name: '工学', slug: 'gongxue', description: '工程技术', iconText: '工', iconBgColor: '#e8eaf6', sortOrder: 8 },
    ]

    await prisma.majorCategory.createMany({
      data: majors.map(m => ({ ...m, isVisible: true })),
    })
    console.log('Created major categories')
  }

  // 创建轮播图
  const existingCarousels = await prisma.carousel.count()
  if (existingCarousels === 0) {
    const carousels = [
      { imageUrl: 'https://picsum.photos/seed/c1/1200/400', category: 'index', linkUrl: '/', sortOrder: 1, isVisible: true },
      { imageUrl: 'https://picsum.photos/seed/c2/1200/400', category: 'index', linkUrl: '/major', sortOrder: 2, isVisible: true },
    ]

    await prisma.carousel.createMany({
      data: carousels,
    })
    console.log('Created carousels')
  }

  // 创建视频分组
  const existingVideoGroups = await prisma.videoGroup.count()
  if (existingVideoGroups === 0) {
    const groups = [
      { groupKey: 'zhangxuefeng', groupName: '升学就业指导', moreUrl: '/videos', sortOrder: 1, isActive: true },
      { groupKey: 'hangneiren', groupName: '专业与就业', moreUrl: '/videos', sortOrder: 2, isActive: true },
    ]

    await prisma.videoGroup.createMany({
      data: groups,
    })
    console.log('Created video groups')
  }

  // 创建导航菜单
  const existingNavMenus = await prisma.navMenu.count()
  if (existingNavMenus === 0) {
    const menus = [
      { displayName: '平台首页', linkType: 'internal', linkUrl: '/', openNewTab: false, sortOrder: 1, isVisible: true },
      { displayName: '专业解读', linkType: 'internal', linkUrl: '/major', openNewTab: false, sortOrder: 2, isVisible: true },
      { displayName: '院校查询', linkType: 'internal', linkUrl: '/college', openNewTab: false, sortOrder: 3, isVisible: true },
      { displayName: '就业分析', linkType: 'internal', linkUrl: '/career', openNewTab: false, sortOrder: 4, isVisible: true },
      { displayName: '志愿填报', linkType: 'internal', linkUrl: '/volunteer', openNewTab: false, sortOrder: 5, isVisible: true },
    ]

    await prisma.navMenu.createMany({
      data: menus.map(m => ({ ...m, parentId: null })),
    })
    console.log('Created nav menus')
  }

  // 创建网站设置
  const existingSettings = await prisma.siteSettings.count()
  if (existingSettings === 0) {
    await prisma.siteSettings.create({
      data: {
        siteName: '升学志愿指导平台',
        siteDescription: '专业的志愿填报与升学指导平台',
        siteKeywords: '志愿填报,升学指导,专业选择',
        userAgreement: '',
      },
    })
    console.log('Created site settings')
  }

  console.log('Database initialization complete!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
