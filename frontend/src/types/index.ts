// ============================================================
// 全局类型定义
// ============================================================

// ---- 通用 API 响应 ----
export interface ApiResponse<T = unknown> {
  code: number;
  message: string;
  data: T;
}

export interface PageResult<T> {
  list: T[];
  total: number;
  page: number;
  pageSize: number;
}

// ---- 权限 ----
export interface Permission {
  id: number;
  resource: string; // 资源标识，如 'user', 'content'
  action: string;   // 操作标识，如 'read', 'write', 'delete'
  name: string;
}

export interface Role {
  id: number;
  name: string;
  slug: string;       // 唯一标识
  isPreset: boolean;  // 是否预设角色（超级管理员等）
  permissions: Permission[];
  createdAt: string;
}

// ---- 用户 ----
export interface Member {
  id: number;
  username: string;
  phone: string;
  gender: 0 | 1 | 2; // 0未知 1男 2女
  province: string;
  registeredAt: string;
  lastLoginAt: string;
  status: 0 | 1;      // 0禁用 1启用
  avatar?: string;
}

export interface Admin {
  id: number;
  username: string;
  email: string;
  roleId: number;
  roleName?: string;
  role?: string;       // slug，用于权限校验（如 superadmin）
  status: 0 | 1;
  lastLoginAt: string;
  createdAt: string;
}

// ---- 内容 ----
export interface Carousel {
  id: number;
  imageUrl: string;
  category: 'index' | 'major'; // 归属分类
  majorId?: number;             // 分类为"专业页"时关联的专业 ID
  linkUrl: string;
  sortOrder: number;
  isVisible: boolean;
  createdAt: string;
}

export interface MajorCategory {
  id: number;
  name: string;
  slug: string;
  description: string;
  iconText: string;
  iconBgColor: string;
  sortOrder: number;
  isVisible: boolean;
  createdAt: string;
}

export interface MajorHome {
  majorId: number;
  slug: string;
  featuredCard: FeaturedCard;
  columnCards: ColumnCard[];
}

export interface DescriptionCard {
  title: string;
  content: string; // 富文本 HTML
  updatedAt?: string; // ISO 时间戳，保存时自动写入
  isVisible?: boolean; // 是否在前端显示，默认 true
}

export interface FeaturedCard {
  icon: string;
  boldTitle: string;
  normalTitle: string;
  cardIntro?: string; // 卡片简介
  description: string; // 富文本（向后兼容，新逻辑用 descriptions）
  descriptions: DescriptionCard[]; // 多段富文本描述卡片（含标题）
  tags: string[];
  seoKeywords?: string;
  seoDescription?: string;
  isVisible?: boolean;
}

export interface ColumnCard {
  id: number;
  title: string;
  cardIntro?: string; // 卡片简介
  content: string; // 富文本（向后兼容，新逻辑用 descriptions）
  descriptions?: DescriptionCard[]; // 多段富文本描述卡片（含标题）
  sortOrder: number;
  slug: string;
  seoTitle?: string;
  seoDescription?: string;
  seoKeywords?: string;
  canonicalUrl?: string;
  isVisible: boolean;
}

export interface VideoGroup {
  id: number;
  groupKey: string;
  groupName: string;
  moreUrl: string;
  sortOrder: number;
  isActive: boolean;
  createdAt: string;
}

export interface Video {
  id: number;
  title: string;
  playerTitle: string;
  bilibiliUrl: string;
  organizer: string;
  organizedDate: string;
  groupId: number;
  groupName?: string;
  majorIds: number[];
  majorName?: string;
  description: string; // 富文本
  seoTitle?: string;
  seoDescription?: string;
  seoKeywords?: string;
  canonicalUrl?: string;
  isVisible: boolean;
  createdAt: string;
}

// ---- 系统设置 ----
export interface SiteSettings {
  siteName: string;
  siteDescription: string;
  siteKeywords: string;
  userAgreement: string; // 富文本
}

export interface NavMenu {
  id: number;
  parentId: number | null;
  displayName: string;
  linkType: 'internal' | 'external';
  linkUrl: string;
  openNewTab: boolean;
  sortOrder: number;
  isVisible: boolean;
  children?: NavMenu[];
}

export interface FooterItem {
  id: number;
  content: string;
  sortOrder: number;
  isVisible: boolean;
  createdAt: string;
}

// ---- 仪表盘 ----
export interface DashboardStats {
  totalMembers: number;
  totalMajors: number;
  todayNewMembers: number;
  activeAdmins: number;
}

export interface GroupVideoStats {
  groupName: string;
  count: number;
}

export interface MajorVideoStats {
  majorName: string;
  count: number;
}

// ---- 路由/菜单 ----
export interface RouteItem {
  path: string;
  name: string;
  icon?: React.ReactNode;
  component?: React.LazyExoticComponent<React.ComponentType>;
  children?: RouteItem[];
  meta?: {
    title: string;
    requiresAuth?: boolean;
    roles?: string[];
    hidden?: boolean;
  };
}

// ---- Tab ----
export interface TabItem {
  key: string;
  label: string;
  path: string;
  closable: boolean;
}

// ---- 登录 ----
export interface LoginForm {
  username: string;
  password: string;
  remember?: boolean;
}

export interface LoginResult {
  token: string;
  admin: Admin;
}
