// ============================================================
// Mock 数据 — 仅定义数据结构，不填充真实数据
// 等待后期手动录入
// ============================================================

import type {
  Admin,
  Member,
  Role,
  Permission,
  Carousel,
  MajorCategory,
  VideoGroup,
  Video,
  SiteSettings,
  NavMenu,
  FooterItem,
  DashboardStats,
  GroupVideoStats,
  MajorVideoStats,
  LoginResult,
} from '../types';

// ---- 权限资源列表 ----
export const RESOURCES = ['dashboard', 'member', 'admin', 'role', 'carousel', 'major', 'video', 'siteSettings', 'navMenu', 'footer'];
export const ACTIONS = ['read', 'write', 'delete'];

// ---- 模拟权限数据 ----
export const mockPermissions: Permission[] = RESOURCES.flatMap((resource, ri) =>
  ACTIONS.map((action, ai) => ({
    id: ri * 10 + ai + 1,
    resource,
    action,
    name: `${resource}:${action}`,
  }))
);

// ---- 模拟角色 ----
export const mockRoles: Role[] = [
  {
    id: 1,
    name: '超级管理员',
    slug: 'superadmin',
    isPreset: true,
    permissions: mockPermissions,
    createdAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 2,
    name: '内容编辑',
    slug: 'editor',
    isPreset: false,
    permissions: mockPermissions.filter((p) =>
      ['carousel', 'major', 'video'].includes(p.resource) && p.action !== 'delete'
    ),
    createdAt: '2024-01-01T00:00:00Z',
  },
];

// ---- 模拟管理员 ----
export const mockAdmins: Admin[] = [
  {
    id: 1,
    username: 'admin',
    email: 'admin@example.com',
    roleId: 1,
    roleName: '超级管理员',
    role: 'superadmin',
    status: 1,
    lastLoginAt: new Date().toISOString(),
    createdAt: '2024-01-01T00:00:00Z',
  },
];

// ---- 登录结果 ----
export const mockLoginResult: LoginResult = {
  token: 'mock_jwt_token_xxxxxxxxxxxxxxxx',
  admin: mockAdmins[0],
};

// ---- 模拟注册用户（演示数据）----
export const mockMembers: Member[] = [
  { id: 1, username: 'zhangsan', phone: '13800138001', gender: 1, province: '北京', registeredAt: '2024-06-15T08:30:00Z', lastLoginAt: '2025-05-18T14:20:00Z', status: 1, avatar: '' },
  { id: 2, username: 'lisi88', phone: '13900139002', gender: 2, province: '上海', registeredAt: '2024-07-22T16:45:00Z', lastLoginAt: '2025-05-17T09:10:00Z', status: 1, avatar: '' },
  { id: 3, username: 'wangwu_dev', phone: '13700137003', gender: 1, province: '广东', registeredAt: '2024-08-05T11:00:00Z', lastLoginAt: '2025-05-10T20:30:00Z', status: 0, avatar: '' },
  { id: 4, username: 'zhaoliu4', phone: '13600136004', gender: 2, province: '浙江', registeredAt: '2024-09-12T13:15:00Z', lastLoginAt: '2025-05-15T08:45:00Z', status: 1, avatar: '' },
  { id: 5, username: 'chenqi', phone: '13500135005', gender: 0, province: '江苏', registeredAt: '2024-10-01T09:00:00Z', lastLoginAt: '2025-04-28T17:00:00Z', status: 1, avatar: '' },
  { id: 6, username: 'sunba_admin', phone: '13300133006', gender: 1, province: '四川', registeredAt: '2024-11-18T10:30:00Z', lastLoginAt: '2025-05-19T07:20:00Z', status: 1, avatar: '' },
  { id: 7, username: 'zhoujiu', phone: '13200132007', gender: 2, province: '湖北', registeredAt: '2024-12-25T14:00:00Z', lastLoginAt: '2025-03-15T12:10:00Z', status: 0, avatar: '' },
  { id: 8, username: 'wushi_king', phone: '13100131008', gender: 1, province: '湖南', registeredAt: '2025-01-08T08:45:00Z', lastLoginAt: '2025-05-16T22:00:00Z', status: 1, avatar: '' },
  { id: 9, username: 'zhengyi99', phone: '13000130009', gender: 2, province: '河南', registeredAt: '2025-02-14T16:20:00Z', lastLoginAt: '2025-05-14T11:30:00Z', status: 1, avatar: '' },
  { id: 10, username: 'haoshi_dev', phone: '12900129010', gender: 1, province: '山东', registeredAt: '2025-03-01T07:00:00Z', lastLoginAt: '2025-05-11T19:45:00Z', status: 1, avatar: '' },
  { id: 11, username: 'linshiyi', phone: '12800128011', gender: 2, province: '北京', registeredAt: '2025-03-20T15:30:00Z', lastLoginAt: '2025-05-12T10:00:00Z', status: 1, avatar: '' },
  { id: 12, username: 'huangshier', phone: '12700127012', gender: 0, province: '其他', registeredAt: '2025-04-05T09:15:00Z', lastLoginAt: '2025-04-20T14:30:00Z', status: 0, avatar: '' },
];

// ---- 仪表盘统计 ----
export const mockDashboardStats: DashboardStats = {
  totalMembers: mockMembers.length,
  totalMajors: 31,
  todayNewMembers: 0,
  activeAdmins: 1,
};

// ---- 分组视频统计 ----
export const mockGroupVideoStats: GroupVideoStats[] = [];

// ---- 专业视频统计 ----
export const mockMajorVideoStats: MajorVideoStats[] = [];

// ---- 轮播图（官网默认 4 张）----
export const mockCarousels: Carousel[] = [
  { id: 1, imageUrl: 'https://pic.imgdb.cn/item/674b4ce8e4b4cb2d3f3a01e8.png', category: 'index', linkUrl: '/', sortOrder: 1, isVisible: true, createdAt: '2026-05-22T00:00:00Z' },
  { id: 2, imageUrl: 'https://pic.imgdb.cn/item/674b4ce8e4b4cb2d3f3a01e8.png', category: 'index', linkUrl: '/major', sortOrder: 2, isVisible: true, createdAt: '2026-05-22T00:00:00Z' },
  { id: 3, imageUrl: 'https://pic.imgdb.cn/item/674b4ce8e4b4cb2d3f3a01e8.png', category: 'index', linkUrl: '/college', sortOrder: 3, isVisible: true, createdAt: '2026-05-22T00:00:00Z' },
  { id: 4, imageUrl: 'https://pic.imgdb.cn/item/674b4ce8e4b4cb2d3f3a01e8.png', category: 'index', linkUrl: '/volunteer', sortOrder: 4, isVisible: true, createdAt: '2026-05-22T00:00:00Z' },
];

// ---- 专业分类（31 种热门专业大类）----
export const mockMajors: MajorCategory[] = [
  { id: 1,  name: '哲学',              slug: 'zhexue',              description: '人文科学',   iconText: '哲',   iconBgColor: '#e3f2fd', sortOrder: 1,  isVisible: true, createdAt: '2026-05-26T00:00:00Z' },
  { id: 2,  name: '经济学',            slug: 'jingjixue',           description: '社会科学',   iconText: '经',   iconBgColor: '#e8f5e9', sortOrder: 2,  isVisible: true, createdAt: '2026-05-26T00:00:00Z' },
  { id: 3,  name: '法学',              slug: 'faxue',               description: '社会科学',   iconText: '法',   iconBgColor: '#f3e5f5', sortOrder: 3,  isVisible: true, createdAt: '2026-05-26T00:00:00Z' },
  { id: 4,  name: '教育学',            slug: 'jiaoyuxue',           description: '社会科学',   iconText: '教',   iconBgColor: '#fff3e0', sortOrder: 4,  isVisible: true, createdAt: '2026-05-26T00:00:00Z' },
  { id: 5,  name: '文学',              slug: 'wenxue',              description: '人文科学',   iconText: '文',   iconBgColor: '#fce4ec', sortOrder: 5,  isVisible: true, createdAt: '2026-05-26T00:00:00Z' },
  { id: 6,  name: '历史学',            slug: 'lishixue',            description: '人文科学',   iconText: '史',   iconBgColor: '#fff8e1', sortOrder: 6,  isVisible: true, createdAt: '2026-05-26T00:00:00Z' },
  { id: 7,  name: '理学',              slug: 'lixue',               description: '自然科学',   iconText: '理',   iconBgColor: '#e0f2f1', sortOrder: 7,  isVisible: true, createdAt: '2026-05-26T00:00:00Z' },
  { id: 8,  name: '工学',              slug: 'gongxue',             description: '工程技术',   iconText: '工',   iconBgColor: '#e8eaf6', sortOrder: 8,  isVisible: true, createdAt: '2026-05-26T00:00:00Z' },
  { id: 9,  name: '农学',              slug: 'nongxue',             description: '生命科学',   iconText: '农',   iconBgColor: '#fce4ec', sortOrder: 9,  isVisible: true, createdAt: '2026-05-26T00:00:00Z' },
  { id: 10, name: '医学',              slug: 'yixue',               description: '生命科学',   iconText: '医',   iconBgColor: '#e0f7fa', sortOrder: 10, isVisible: true, createdAt: '2026-05-26T00:00:00Z' },
  { id: 11, name: '管理学',            slug: 'guanlixue',           description: '社会科学',   iconText: '管',   iconBgColor: '#f3e5f5', sortOrder: 11, isVisible: true, createdAt: '2026-05-26T00:00:00Z' },
  { id: 12, name: '艺术学',            slug: 'yishuxue',            description: '人文科学',   iconText: '艺',   iconBgColor: '#e3f2fd', sortOrder: 12, isVisible: true, createdAt: '2026-05-26T00:00:00Z' },
  { id: 13, name: '计算机类',          slug: 'jisuanji',            description: '工学',       iconText: '计',   iconBgColor: '#e0f7fa', sortOrder: 13, isVisible: true, createdAt: '2026-05-26T00:00:00Z' },
  { id: 14, name: '电子信息类',        slug: 'dianzixinxi',         description: '工学',       iconText: '电信', iconBgColor: '#e8eaf6', sortOrder: 14, isVisible: true, createdAt: '2026-05-26T00:00:00Z' },
  { id: 15, name: '机械类',            slug: 'jixie',               description: '工学',       iconText: '机械', iconBgColor: '#fff3e0', sortOrder: 15, isVisible: true, createdAt: '2026-05-26T00:00:00Z' },
  { id: 16, name: '土木类',            slug: 'tumu',                description: '工学',       iconText: '土木', iconBgColor: '#fff8e1', sortOrder: 16, isVisible: true, createdAt: '2026-05-26T00:00:00Z' },
  { id: 17, name: '建筑类',            slug: 'jianzhu',             description: '工学',       iconText: '建筑', iconBgColor: '#e3f2fd', sortOrder: 17, isVisible: true, createdAt: '2026-05-26T00:00:00Z' },
  { id: 18, name: '化工与制药类',      slug: 'huagongzhiyao',       description: '工学',       iconText: '化工', iconBgColor: '#e0f2f1', sortOrder: 18, isVisible: true, createdAt: '2026-05-26T00:00:00Z' },
  { id: 19, name: '材料类',            slug: 'cailiao',             description: '工学',       iconText: '材料', iconBgColor: '#f3e5f5', sortOrder: 19, isVisible: true, createdAt: '2026-05-26T00:00:00Z' },
  { id: 20, name: '能源动力类',        slug: 'nengyuandongli',      description: '工学',       iconText: '能动', iconBgColor: '#ffebee', sortOrder: 20, isVisible: true, createdAt: '2026-05-26T00:00:00Z' },
  { id: 21, name: '电气类',            slug: 'dianqi',              description: '工学',       iconText: '电气', iconBgColor: '#fff3e0', sortOrder: 21, isVisible: true, createdAt: '2026-05-26T00:00:00Z' },
  { id: 22, name: '自动化类',          slug: 'zidonghua',           description: '工学',       iconText: '自动', iconBgColor: '#e0f7fa', sortOrder: 22, isVisible: true, createdAt: '2026-05-26T00:00:00Z' },
  { id: 23, name: '航空航天类',        slug: 'hangkonghangtian',    description: '工学',       iconText: '航太', iconBgColor: '#e8eaf6', sortOrder: 23, isVisible: true, createdAt: '2026-05-26T00:00:00Z' },
  { id: 24, name: '交通运输类',        slug: 'jiaotongyunshu',      description: '工学',       iconText: '交通', iconBgColor: '#e0f2f1', sortOrder: 24, isVisible: true, createdAt: '2026-05-26T00:00:00Z' },
  { id: 25, name: '环境科学与工程类',  slug: 'huanjingkexue',       description: '工学',       iconText: '环境', iconBgColor: '#ffebee', sortOrder: 25, isVisible: true, createdAt: '2026-05-26T00:00:00Z' },
  { id: 26, name: '生物医学工程类',    slug: 'shengwuyixue',        description: '工学',       iconText: '生医', iconBgColor: '#fff3e0', sortOrder: 26, isVisible: true, createdAt: '2026-05-26T00:00:00Z' },
  { id: 27, name: '食品科学与工程类',  slug: 'shipinkexue',         description: '工学',       iconText: '食品', iconBgColor: '#e8eaf6', sortOrder: 27, isVisible: true, createdAt: '2026-05-26T00:00:00Z' },
  { id: 28, name: '数学类',            slug: 'shuxue',              description: '理学',       iconText: '数学', iconBgColor: '#f3e5f5', sortOrder: 28, isVisible: true, createdAt: '2026-05-26T00:00:00Z' },
  { id: 29, name: '物理学类',          slug: 'wulixue',             description: '理学',       iconText: '物理', iconBgColor: '#e0f2f1', sortOrder: 29, isVisible: true, createdAt: '2026-05-26T00:00:00Z' },
  { id: 30, name: '化学类',            slug: 'huaxue',              description: '理学',       iconText: '化学', iconBgColor: '#e8f5e9', sortOrder: 30, isVisible: true, createdAt: '2026-05-26T00:00:00Z' },
  { id: 31, name: '生物科学类',        slug: 'shengwukexue',        description: '理学',       iconText: '生物', iconBgColor: '#e3f2fd', sortOrder: 31, isVisible: true, createdAt: '2026-05-26T00:00:00Z' },
];

// ---- 视频分组 ----
export const mockVideoGroups: VideoGroup[] = [
  { id: 1, groupKey: 'zhangxuefeng', groupName: '【视频】张雪峰老师升学就业指导', moreUrl: '/videos', sortOrder: 1, isActive: true, createdAt: '2026-05-22T00:00:00Z' },
  { id: 2, groupKey: 'hangneiren', groupName: '【视频】行内人讲专业与就业', moreUrl: '/videos', sortOrder: 2, isActive: true, createdAt: '2026-05-22T00:00:00Z' },
];

// ---- 视频 ----
export const mockVideos: Video[] = [
  // ---- 张雪峰老师 (groupId=1) ----
  { id: 1,  title: '公检法：法学生的主流选择', playerTitle: '公检法：法学生的主流选择', bilibiliUrl: 'https://www.bilibili.com/video/BV1fmcBzZE3C', organizer: '师兄师姐说', organizedDate: '2024-04-10', groupId: 1, majorIds: [ 3],  description: '本视频邀请法学本硕毕业生，深度解析公检法系统的就业现状、职业发展路径。', isVisible: true, createdAt: '2026-05-22T00:00:00Z' },
  { id: 2,  title: '考研与读博的选择',         playerTitle: '考研与读博的选择',         bilibiliUrl: '', organizer: '师兄师姐说', organizedDate: '2024-04-01', groupId: 1, majorIds: [ 3],  description: '', isVisible: true, createdAt: '2026-05-22T00:00:00Z' },
  { id: 3,  title: '法考：法律人的门槛',       playerTitle: '法考：法律人的门槛',       bilibiliUrl: '', organizer: '师兄师姐说', organizedDate: '2024-03-25', groupId: 1, majorIds: [ 3],  description: '', isVisible: true, createdAt: '2026-05-22T00:00:00Z' },
  { id: 4,  title: '法学本科都学什么？',       playerTitle: '法学本科都学什么？',       bilibiliUrl: '', organizer: '师兄师姐说', organizedDate: '2024-03-20', groupId: 1, majorIds: [ 3],  description: '', isVisible: true, createdAt: '2026-05-22T00:00:00Z' },
  { id: 5,  title: '为什么选择法学？',         playerTitle: '为什么选择法学？',         bilibiliUrl: '', organizer: '师兄师姐说', organizedDate: '2024-03-15', groupId: 1, majorIds: [ 3],  description: '', isVisible: true, createdAt: '2026-05-22T00:00:00Z' },
  { id: 6,  title: '经济学就业前景分析',       playerTitle: '经济学就业前景分析',       bilibiliUrl: '', organizer: '师兄师姐说', organizedDate: '2024-04-08', groupId: 1, majorIds: [ 2],  description: '', isVisible: true, createdAt: '2026-05-22T00:00:00Z' },
  { id: 7,  title: '计算机专业到底学什么',     playerTitle: '计算机专业到底学什么',     bilibiliUrl: '', organizer: '师兄师姐说', organizedDate: '2024-04-05', groupId: 1, majorIds: [ 13], description: '', isVisible: true, createdAt: '2026-05-22T00:00:00Z' },
  { id: 8,  title: '医学生成长路径全解析',     playerTitle: '医学生成长路径全解析',     bilibiliUrl: '', organizer: '师兄师姐说', organizedDate: '2024-03-30', groupId: 1, majorIds: [ 10], description: '', isVisible: true, createdAt: '2026-05-22T00:00:00Z' },
  // ---- 行内人讲专业与就业 (groupId=2) ----
  { id: 9,  title: '公检法：法学生的主流选择', playerTitle: '公检法：法学生的主流选择', bilibiliUrl: 'https://www.bilibili.com/video/BV1fmcBzZE3C', organizer: '师兄师姐说', organizedDate: '2024-04-10', groupId: 2, majorIds: [ 3],  description: '本视频邀请法学本硕毕业生，深度解析公检法系统的就业现状、职业发展路径。', isVisible: true, createdAt: '2026-05-22T00:00:00Z' },
  { id: 10, title: '考研与读博的选择',         playerTitle: '考研与读博的选择',         bilibiliUrl: '', organizer: '师兄师姐说', organizedDate: '2024-04-01', groupId: 2, majorIds: [ 3],  description: '', isVisible: true, createdAt: '2026-05-22T00:00:00Z' },
  { id: 11, title: '法考：法律人的门槛',       playerTitle: '法考：法律人的门槛',       bilibiliUrl: '', organizer: '师兄师姐说', organizedDate: '2024-03-25', groupId: 2, majorIds: [ 3],  description: '', isVisible: true, createdAt: '2026-05-22T00:00:00Z' },
  { id: 12, title: '法学本科都学什么？',       playerTitle: '法学本科都学什么？',       bilibiliUrl: '', organizer: '师兄师姐说', organizedDate: '2024-03-20', groupId: 2, majorIds: [ 3],  description: '', isVisible: true, createdAt: '2026-05-22T00:00:00Z' },
  { id: 13, title: '为什么选择法学？',         playerTitle: '为什么选择法学？',         bilibiliUrl: '', organizer: '师兄师姐说', organizedDate: '2024-03-15', groupId: 2, majorIds: [ 3],  description: '', isVisible: true, createdAt: '2026-05-22T00:00:00Z' },
  { id: 14, title: '工学大类就业实况',         playerTitle: '工学大类就业实况',         bilibiliUrl: '', organizer: '师兄师姐说', organizedDate: '2024-04-12', groupId: 2, majorIds: [ 8],  description: '', isVisible: true, createdAt: '2026-05-22T00:00:00Z' },
  { id: 15, title: '管理学毕业生都在做什么',   playerTitle: '管理学毕业生都在做什么',   bilibiliUrl: '', organizer: '师兄师姐说', organizedDate: '2024-04-03', groupId: 2, majorIds: [ 11], description: '', isVisible: true, createdAt: '2026-05-22T00:00:00Z' },
  { id: 16, title: '理科生的多种出路',         playerTitle: '理科生的多种出路',         bilibiliUrl: '', organizer: '师兄师姐说', organizedDate: '2024-03-26', groupId: 2, majorIds: [ 7],  description: '', isVisible: true, createdAt: '2026-05-22T00:00:00Z' },
  { id: 17, title: '教育学就业方向盘点',       playerTitle: '教育学就业方向盘点',       bilibiliUrl: '', organizer: '师兄师姐说', organizedDate: '2024-03-22', groupId: 2, majorIds: [ 4],  description: '', isVisible: true, createdAt: '2026-05-22T00:00:00Z' },
  { id: 18, title: '建筑学专业到底值不值',     playerTitle: '建筑学专业到底值不值',     bilibiliUrl: '', organizer: '师兄师姐说', organizedDate: '2024-03-18', groupId: 2, majorIds: [ 17], description: '', isVisible: true, createdAt: '2026-05-22T00:00:00Z' },
];

// ---- 网站设置默认值 ----
export const mockSiteSettings: SiteSettings = {
  siteName: '',
  siteDescription: '',
  siteKeywords: '',
  userAgreement: '',
};

// ---- 导航菜单（官网首页默认5个菜单）----
export const mockNavMenus: NavMenu[] = [
  { id: 1, parentId: null, displayName: '平台首页', linkType: 'internal', linkUrl: '/', openNewTab: false, sortOrder: 1, isVisible: true },
  { id: 2, parentId: null, displayName: '专业解读', linkType: 'internal', linkUrl: '/major', openNewTab: false, sortOrder: 2, isVisible: true },
  { id: 3, parentId: null, displayName: '院校查询', linkType: 'internal', linkUrl: '/college', openNewTab: false, sortOrder: 3, isVisible: true },
  { id: 4, parentId: null, displayName: '就业分析', linkType: 'internal', linkUrl: '/career', openNewTab: false, sortOrder: 4, isVisible: true },
  { id: 5, parentId: null, displayName: '志愿填报', linkType: 'internal', linkUrl: '/volunteer', openNewTab: false, sortOrder: 5, isVisible: true },
];

// ---- 页脚（空数据）----
export const mockFooterItems: FooterItem[] = [];
