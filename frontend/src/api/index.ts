// ============================================================
// API 接口封装（使用 Mock 数据模拟，后期替换真实接口）
// ============================================================

import type {
  LoginForm, LoginResult, PageResult, Member, Admin, Role,
  Carousel, MajorCategory, VideoGroup, Video, SiteSettings,
  NavMenu, FooterItem, DashboardStats, GroupVideoStats, MajorVideoStats,
  MajorHome,
} from '../types';
import {
  mockLoginResult, mockMembers, mockAdmins, mockRoles,
  mockCarousels, mockMajors, mockVideoGroups, mockVideos,
  mockSiteSettings, mockFooterItems,
  mockDashboardStats,
} from '../mock';

// ============================================================
// localStorage 持久化 — 导航菜单
// ============================================================
const NAV_MENU_KEY = 'mock_nav_menus';

const DEFAULT_NAV_MENUS: NavMenu[] = [
  { id: 1, parentId: null, displayName: '平台首页', linkType: 'internal', linkUrl: '/', openNewTab: false, sortOrder: 1, isVisible: true },
  { id: 2, parentId: null, displayName: '专业解读', linkType: 'internal', linkUrl: '/major', openNewTab: false, sortOrder: 2, isVisible: true },
  { id: 3, parentId: null, displayName: '院校查询', linkType: 'internal', linkUrl: '/college', openNewTab: false, sortOrder: 3, isVisible: true },
  { id: 4, parentId: null, displayName: '就业分析', linkType: 'internal', linkUrl: '/career', openNewTab: false, sortOrder: 4, isVisible: true },
  { id: 5, parentId: null, displayName: '志愿填报', linkType: 'internal', linkUrl: '/volunteer', openNewTab: false, sortOrder: 5, isVisible: true },
];

function loadNavMenus(): NavMenu[] {
  try {
    const stored = localStorage.getItem(NAV_MENU_KEY);
    if (stored) {
      const parsed: NavMenu[] = JSON.parse(stored);
      // 归一化所有 parentId 为 number | null
      return parsed.map((m) => {
        const pid = m.parentId;
        const normalized = (pid === undefined || pid === null || pid === 0)
          ? null
          : Number(pid);
        return { ...m, parentId: normalized };
      });
    }
  } catch (e) { console.error('[loadNavMenus] parse失败，清空重置', e); }
  return DEFAULT_NAV_MENUS;
}

function saveNavMenus(menus: NavMenu[]): void {
  localStorage.setItem(NAV_MENU_KEY, JSON.stringify(menus));
}

// 模拟网络延迟
const delay = (ms = 300) => new Promise((resolve) => setTimeout(resolve, ms));

// ---- 认证 ----
export const authApi = {
  login: async (form: LoginForm): Promise<LoginResult> => {
    await delay();
    // 从 localStorage 加载所有管理员
    const admins = loadAdmins();
    // 按用户名查找
    const admin = admins.find((a) => a.username === form.username);
    if (!admin) {
      throw new Error('账号或密码错误');
    }
    if (admin.status === 0) {
      throw new Error('该账号已被禁用');
    }
    // 读取该管理员的密码凭证
    const stored = localStorage.getItem(ADMIN_CREDENTIALS_KEY);
    const creds: Record<string, string> = stored ? JSON.parse(stored) : {};
    const pwd = creds[form.username];
    if (pwd === undefined) {
      // 兼容：如果凭证中不存在（老数据），仅允许 admin/admin123
      if (form.username === 'admin' && form.password === 'admin123') {
        creds.admin = 'admin123';
        localStorage.setItem(ADMIN_CREDENTIALS_KEY, JSON.stringify(creds));
      } else {
        throw new Error('账号或密码错误');
      }
    } else if (pwd !== form.password) {
      throw new Error('账号或密码错误');
    }
    // 更新最后登录时间
    admin.lastLoginAt = new Date().toISOString();
    saveAdmins(admins);
    // 生成 token
    const token = 'mock_jwt_' + Date.now();
    return { token, admin };
  },
  logout: async (): Promise<void> => {
    await delay(200);
  },
  getProfile: async (): Promise<LoginResult['admin']> => {
    await delay(200);
    // 返回默认管理员信息（前台使用，可能与实际登录用户不同）
    const admins = loadAdmins();
    return admins.length > 0 ? admins[0] : mockLoginResult.admin;
  },
};

// ---- 仪表盘 ----
export const dashboardApi = {
  getStats: async (): Promise<DashboardStats> => {
    await delay();
    const members = loadMembers();
    const today = new Date().toISOString().slice(0, 10);
    const todayNew = members.filter((m) => m.registeredAt?.startsWith(today)).length;
    return {
      totalMembers: members.length,
      totalMajors: mockDashboardStats.totalMajors,
      todayNewMembers: todayNew,
      activeAdmins: mockDashboardStats.activeAdmins,
    };
  },
  getGroupVideoStats: async (): Promise<GroupVideoStats[]> => {
    await delay();
    const videos = loadVideos();
    const groups = loadVideoGroups();
    // 按 groupId 聚合视频数量
    const countMap = new Map<number, number>();
    videos.forEach((v) => {
      if (v.groupId) {
        countMap.set(v.groupId, (countMap.get(v.groupId) || 0) + 1);
      }
    });
    return groups.map((g) => ({
      groupName: g.groupName,
      count: countMap.get(g.id) || 0,
    }));
  },
  getMajorVideoStats: async (): Promise<MajorVideoStats[]> => {
    await delay();
    const videos = loadVideos();
    const majors = loadMajors();
    // 按 majorIds 聚合视频数量（一个视频可属于多个专业）
    const countMap = new Map<number, number>();
    videos.forEach((v) => {
      if (v.majorIds && v.majorIds.length > 0) {
        v.majorIds.forEach((mid) => {
          countMap.set(mid, (countMap.get(mid) || 0) + 1);
        });
      }
    });
    return majors.map((m) => ({
      majorName: m.name,
      count: countMap.get(m.id) || 0,
    }));
  },
};

// ---- 注册用户 (localStorage 持久化) ----
const MEMBER_KEY = 'mock_members';
const CREDENTIALS_KEY = 'mock_credentials';
const ADMIN_CREDENTIALS_KEY = 'mock_admin_credentials';
const MOCK_ADMINS_KEY = 'mock_admins';
const MOCK_ROLES_KEY = 'mock_roles';

// 凭证存储：{ [username | phone]: password }
function loadCredentials(): Record<string, string> {
  try {
    const stored = localStorage.getItem(CREDENTIALS_KEY);
    if (stored) return JSON.parse(stored);
  } catch (e) { console.error('[loadCredentials] parse失败', e); }
  return {};
}

function saveCredentials(creds: Record<string, string>): void {
  localStorage.setItem(CREDENTIALS_KEY, JSON.stringify(creds));
}

function loadMembers(): Member[] {
  try {
    const stored = localStorage.getItem(MEMBER_KEY);
    if (stored) return JSON.parse(stored);
  } catch (e) { console.error('[loadMembers] parse失败', e); }
  // 首次加载：把默认 mock 数据写入 localStorage
  saveMembers(mockMembers);
  return mockMembers;
}

function saveMembers(members: Member[]): void {
  localStorage.setItem(MEMBER_KEY, JSON.stringify(members));
}

export const memberApi = {
  list: async (params: { page: number; pageSize: number; keyword?: string }): Promise<PageResult<Member>> => {
    await delay();
    const members = loadMembers();
    const filtered = params.keyword
      ? members.filter((m) =>
          m.username.includes(params.keyword!) || m.phone.includes(params.keyword!)
        )
      : members;
    // 按注册时间降序（最新在前）
    const sorted = filtered.sort((a, b) => new Date(b.registeredAt).getTime() - new Date(a.registeredAt).getTime());
    const start = (params.page - 1) * params.pageSize;
    return { list: sorted.slice(start, start + params.pageSize), total: sorted.length, page: params.page, pageSize: params.pageSize };
  },
  create: async (data: { username: string; password: string; phone: string; gender: 0 | 1 | 2; province: string; status?: 0 | 1 }): Promise<Member> => {
    await delay();
    const members = loadMembers();
    // 去重：不允许重复的账号名或手机号
    const exists = members.find((m) => m.username === data.username || m.phone === data.phone);
    if (exists) {
      if (exists.username === data.username) throw new Error('该账号名已被注册');
      if (exists.phone === data.phone) throw new Error('该手机号已被注册');
    }
    const newMember: Member = {
      id: Date.now(),
      username: data.username,
      phone: data.phone,
      gender: data.gender,
      province: data.province,
      registeredAt: new Date().toISOString(),
      lastLoginAt: '',
      status: data.status ?? 1,
      avatar: '',
    };
    // 保存密码凭证（用户名和手机号都可作为登录账号）
    const creds = loadCredentials();
    creds[data.username] = data.password;
    creds[data.phone] = data.password;
    saveCredentials(creds);

    members.push(newMember);
    saveMembers(members);
    return newMember;
  },
  update: async (id: number, data: Partial<Member> & { password?: string }): Promise<Member> => {
    await delay();
    const members = loadMembers();
    const item = members.find((m) => m.id === id);
    if (!item) throw new Error('用户不存在');
    // 密码不存储在 Member 对象中，仅作模拟修改提示
    const { password: _pwd, ...rest } = data;
    Object.assign(item, rest);
    saveMembers(members);
    return item;
  },
  toggleStatus: async (id: number, status: 0 | 1): Promise<void> => {
    await delay(200);
    const members = loadMembers();
    const item = members.find((m) => m.id === id);
    if (item) {
      item.status = status;
      saveMembers(members);
    }
  },
  /** 验证登录：检查账号是否存在且密码匹配，返回用户信息或抛出错误 */
  login: async (account: string, password: string): Promise<Member> => {
    await delay();
    const members = loadMembers();
    const creds = loadCredentials();
    // 检查账户是否已注册（按用户名或手机号查找）
    const member = members.find((m) => m.username === account || m.phone === account);
    if (!member) {
      throw new Error('账号未注册，请先注册');
    }
    if (member.status === 0) {
      throw new Error('该账号已被禁用');
    }
    // 校验密码：用用户名查凭证
    const storedPwd = creds[member.username];
    if (storedPwd === undefined) {
      // 兼容旧账号（凭证系统上线前注册的），首次登录补录密码
      creds[member.username] = password;
      creds[member.phone] = password;
      saveCredentials(creds);
    } else if (storedPwd !== password) {
      throw new Error('密码错误');
    }
    // 更新最后登录时间
    member.lastLoginAt = new Date().toISOString();
    saveMembers(members);
    return member;
  },
};

// ---- 管理员 (localStorage 持久化) ----
function loadAdmins(): Admin[] {
  try {
    const stored = localStorage.getItem(MOCK_ADMINS_KEY);
    if (stored) return JSON.parse(stored);
  } catch (e) { console.error('[loadAdmins] parse失败', e); }
  saveAdmins(mockAdmins);
  return mockAdmins;
}

function saveAdmins(admins: Admin[]): void {
  localStorage.setItem(MOCK_ADMINS_KEY, JSON.stringify(admins));
}

export const adminApi = {
  list: async (params: { page: number; pageSize: number }): Promise<PageResult<Admin>> => {
    await delay();
    const admins = loadAdmins();
    const start = (params.page - 1) * params.pageSize;
    return { list: admins.slice(start, start + params.pageSize), total: admins.length, page: params.page, pageSize: params.pageSize };
  },
  create: async (data: Omit<Admin, 'id' | 'createdAt' | 'lastLoginAt'> & { password?: string }): Promise<Admin> => {
    await delay();
    const admins = loadAdmins();
    // 去重检查
    if (admins.find((a) => a.username === data.username)) {
      throw new Error('该账号名已存在');
    }
    const { password, ...adminData } = data;
    // 根据 roleId 解析 role slug 和 roleName
    const roles = loadRoles();
    const roleInfo = roles.find((r) => r.id === adminData.roleId);
    const newAdmin: Admin = {
      ...adminData,
      id: Date.now(),
      role: roleInfo?.slug || '',
      roleName: roleInfo?.name || '',
      createdAt: new Date().toISOString(),
      lastLoginAt: '',
    };
    admins.push(newAdmin);
    saveAdmins(admins);
    // 保存密码凭证
    if (password) {
      const stored = localStorage.getItem(ADMIN_CREDENTIALS_KEY);
      let creds: Record<string, string> = {};
      if (stored) {
        try { creds = JSON.parse(stored); } catch { /* ignore */ }
      }
      creds[data.username] = password;
      localStorage.setItem(ADMIN_CREDENTIALS_KEY, JSON.stringify(creds));
    }
    return newAdmin;
  },
  update: async (id: number, data: Partial<Admin> & { password?: string }): Promise<Admin> => {
    await delay();
    const admins = loadAdmins();
    const item = admins.find((a) => a.id === id);
    if (!item) throw new Error('管理员不存在');
    // 保存密码到管理员凭证存储
    if (data.password) {
      const stored = localStorage.getItem(ADMIN_CREDENTIALS_KEY);
      let creds: Record<string, string> = {};
      if (stored) {
        try { creds = JSON.parse(stored); } catch { /* ignore */ }
      }
      creds[item.username] = data.password;
      localStorage.setItem(ADMIN_CREDENTIALS_KEY, JSON.stringify(creds));
    }
    const { password: _, ...rest } = data;
    Object.assign(item, rest);
    // 如果修改了 roleId，同步更新 role slug 和 roleName
    if (data.roleId !== undefined) {
      const roles = loadRoles();
      const roleInfo = roles.find((r) => r.id === data.roleId);
      if (roleInfo) {
        item.role = roleInfo.slug;
        item.roleName = roleInfo.name;
      }
    }
    saveAdmins(admins);
    return item;
  },
  remove: async (id: number): Promise<void> => {
    await delay();
    const admins = loadAdmins();
    const idx = admins.findIndex((a) => a.id === id);
    if (idx !== -1) {
      admins.splice(idx, 1);
      saveAdmins(admins);
    }
  },
};

// ---- 角色 (localStorage 持久化) ----
export function loadRoles(): Role[] {
  try {
    const stored = localStorage.getItem(MOCK_ROLES_KEY);
    if (stored) return JSON.parse(stored);
  } catch (e) { console.error('[loadRoles] parse失败', e); }
  saveRoles(mockRoles);
  return mockRoles;
}

function saveRoles(roles: Role[]): void {
  localStorage.setItem(MOCK_ROLES_KEY, JSON.stringify(roles));
}

export const roleApi = {
  list: async (): Promise<Role[]> => {
    await delay();
    return loadRoles();
  },
  create: async (data: Omit<Role, 'id' | 'createdAt'>): Promise<Role> => {
    await delay();
    const roles = loadRoles();
    const newRole: Role = { ...data, id: Date.now(), createdAt: new Date().toISOString() };
    roles.push(newRole);
    saveRoles(roles);
    return newRole;
  },
  update: async (id: number, data: Partial<Role>): Promise<Role> => {
    await delay();
    const roles = loadRoles();
    const item = roles.find((r) => r.id === id);
    if (!item) throw new Error('角色不存在');
    Object.assign(item, data);
    saveRoles(roles);
    return item;
  },
  remove: async (id: number): Promise<void> => {
    await delay();
    const roles = loadRoles();
    const idx = roles.findIndex((r) => r.id === id);
    if (idx !== -1) {
      roles.splice(idx, 1);
      saveRoles(roles);
    }
  },
};

// ---- 轮播图 ----
const CAROUSEL_KEY = 'mock_carousels';

function loadCarousels(): Carousel[] {
  try {
    const stored = localStorage.getItem(CAROUSEL_KEY);
    if (stored) return JSON.parse(stored) as Carousel[];
  } catch (e) { console.error('[loadCarousels] parse失败', e); }
  return mockCarousels;
}

function saveCarousels(list: Carousel[]): void {
  localStorage.setItem(CAROUSEL_KEY, JSON.stringify(list));
}

export const carouselApi = {
  list: async (): Promise<Carousel[]> => { await delay(); return loadCarousels(); },
  create: async (data: Omit<Carousel, 'id' | 'createdAt'>): Promise<Carousel> => {
    await delay();
    const list = loadCarousels();
    const item: Carousel = { ...data, id: Date.now(), createdAt: new Date().toISOString() };
    list.push(item);
    saveCarousels(list);
    return item;
  },
  update: async (id: number, data: Partial<Carousel>): Promise<Carousel> => {
    await delay();
    const list = loadCarousels();
    const item = list.find((c) => c.id === id);
    if (!item) throw new Error('轮播图不存在');
    Object.assign(item, data);
    saveCarousels(list);
    return item;
  },
  remove: async (id: number): Promise<void> => {
    await delay();
    const list = loadCarousels();
    const idx = list.findIndex((c) => c.id === id);
    if (idx !== -1) list.splice(idx, 1);
    saveCarousels(list);
  },
  reorder: async (ids: number[]): Promise<void> => {
    await delay();
    const list = loadCarousels();
    ids.forEach((id, idx) => {
      const item = list.find((c) => c.id === id);
      if (item) item.sortOrder = idx + 1;
    });
    saveCarousels(list);
  },
};

// ---- 专业分类 ----
const MAJOR_KEY = 'mock_majors';

const loadMajors = (): MajorCategory[] => {
  try {
    const raw = localStorage.getItem(MAJOR_KEY);
    return raw ? (JSON.parse(raw) as MajorCategory[]) : [...mockMajors];
  } catch { return [...mockMajors]; }
};

const saveMajors = (list: MajorCategory[]) => {
  localStorage.setItem(MAJOR_KEY, JSON.stringify(list));
};

export const majorApi = {
  list: async (): Promise<MajorCategory[]> => { await delay(); return loadMajors(); },
  create: async (data: Omit<MajorCategory, 'id' | 'createdAt'>): Promise<MajorCategory> => {
    await delay();
    const item: MajorCategory = { ...data, id: Date.now(), createdAt: new Date().toISOString() };
    const list = loadMajors();
    list.push(item);
    saveMajors(list);
    return item;
  },
  update: async (id: number, data: Partial<MajorCategory>): Promise<MajorCategory> => {
    await delay();
    const list = loadMajors();
    const item = list.find((m) => m.id === id);
    if (!item) throw new Error('专业不存在');
    const updated = Object.assign(item, data);
    saveMajors(list);
    return updated;
  },
  remove: async (id: number): Promise<void> => {
    await delay();
    const list = loadMajors();
    const idx = list.findIndex((m) => m.id === id);
    if (idx !== -1) { list.splice(idx, 1); saveMajors(list); }
  },
};

// ---- 专业主页 ----
const MAJOR_HOME_KEY = 'mock_major_homes';

function loadMajorHomes(): Record<number, MajorHome> {
  try {
    const raw = localStorage.getItem(MAJOR_HOME_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch { return {}; }
}

function saveMajorHomes(data: Record<number, MajorHome>) {
  localStorage.setItem(MAJOR_HOME_KEY, JSON.stringify(data));
}

export const majorHomeApi = {
  loadAll: (): Record<number, MajorHome> => loadMajorHomes(),
  saveAll: (data: Record<number, MajorHome>): void => saveMajorHomes(data),
};

// ---- 视频分组 ----
const VIDEO_GROUP_KEY = 'mock_video_groups';

const loadVideoGroups = (): VideoGroup[] => {
  try {
    const raw = localStorage.getItem(VIDEO_GROUP_KEY);
    return raw ? (JSON.parse(raw) as VideoGroup[]) : [...mockVideoGroups];
  } catch { return [...mockVideoGroups]; }
};

const saveVideoGroups = (list: VideoGroup[]) => {
  localStorage.setItem(VIDEO_GROUP_KEY, JSON.stringify(list));
};

export const videoGroupApi = {
  list: async (): Promise<VideoGroup[]> => { await delay(); return loadVideoGroups(); },
  create: async (data: Omit<VideoGroup, 'id' | 'createdAt'>): Promise<VideoGroup> => {
    await delay();
    const item: VideoGroup = { ...data, id: Date.now(), createdAt: new Date().toISOString() };
    const list = loadVideoGroups();
    list.push(item);
    saveVideoGroups(list);
    return item;
  },
  update: async (id: number, data: Partial<VideoGroup>): Promise<VideoGroup> => {
    await delay();
    const list = loadVideoGroups();
    const item = list.find((v) => v.id === id);
    if (!item) throw new Error('分组不存在');
    Object.assign(item, data);
    saveVideoGroups(list);
    return item;
  },
  remove: async (id: number): Promise<void> => {
    await delay();
    const list = loadVideoGroups();
    const idx = list.findIndex((v) => v.id === id);
    if (idx !== -1) {
      list.splice(idx, 1);
      saveVideoGroups(list);
    }
  },
};

// ---- 视频 ----
const VIDEO_KEY = 'mock_videos';

const loadVideos = (): Video[] => {
  try {
    const raw = localStorage.getItem(VIDEO_KEY);
    return raw ? (JSON.parse(raw) as Video[]) : [...mockVideos];
  } catch { return [...mockVideos]; }
};

const saveVideos = (list: Video[]) => {
  localStorage.setItem(VIDEO_KEY, JSON.stringify(list));
};

export const videoApi = {
  list: async (params: { page: number; pageSize: number; title?: string; groupId?: number; majorId?: number; isVisible?: boolean }): Promise<PageResult<Video>> => {
    await delay();
    let filtered = loadVideos();
    if (params.title) filtered = filtered.filter((v) => v.title.includes(params.title!));
    if (params.groupId) filtered = filtered.filter((v) => v.groupId === params.groupId);
    if (params.majorId) filtered = filtered.filter((v) => v.majorIds?.includes(params.majorId!));
    if (params.isVisible !== undefined) filtered = filtered.filter((v) => v.isVisible === params.isVisible);
    // 按 id 降序排列（新增视频在前）
    filtered.sort((a, b) => b.id - a.id);
    const start = (params.page - 1) * params.pageSize;
    return { list: filtered.slice(start, start + params.pageSize), total: filtered.length, page: params.page, pageSize: params.pageSize };
  },
  create: async (data: Omit<Video, 'id' | 'createdAt'>): Promise<Video> => {
    await delay();
    const item: Video = { ...data, id: Date.now(), createdAt: new Date().toISOString() };
    const list = loadVideos();
    list.push(item);
    saveVideos(list);
    return item;
  },
  update: async (id: number, data: Partial<Video>): Promise<Video> => {
    await delay();
    const list = loadVideos();
    const item = list.find((v) => v.id === id);
    if (!item) throw new Error('视频不存在');
    Object.assign(item, data);
    saveVideos(list);
    return item;
  },
  remove: async (id: number): Promise<void> => {
    await delay();
    const list = loadVideos();
    const idx = list.findIndex((v) => v.id === id);
    if (idx !== -1) {
      list.splice(idx, 1);
      saveVideos(list);
    }
  },
};

// ---- 网站设置 ----
export const siteApi = {
  get: async (): Promise<SiteSettings> => { await delay(); return mockSiteSettings; },
  save: async (data: SiteSettings): Promise<SiteSettings> => {
    await delay();
    Object.assign(mockSiteSettings, data);
    return mockSiteSettings;
  },
};

// ---- 导航菜单 ----
export const navMenuApi = {
  list: async (): Promise<NavMenu[]> => { await delay(); return loadNavMenus(); },
  create: async (data: Omit<NavMenu, 'id'>): Promise<NavMenu> => {
    await delay();
    const menus = loadNavMenus();
    const item: NavMenu = {
      ...data,
      id: Date.now(),
      parentId: data.parentId === null || data.parentId === undefined ? null : Number(data.parentId),
    };
    menus.push(item);
    saveNavMenus(menus);
    return item;
  },
  update: async (id: number, data: Partial<NavMenu>): Promise<NavMenu> => {
    await delay();
    const menus = loadNavMenus();
    const idx = menus.findIndex((m) => m.id === id);
    if (idx === -1) throw new Error('菜单不存在');
    const merged = { ...menus[idx], ...data };
    // 防御：parentId 统一为 number | null，避免 string/undefined 导致树构建失败
    if (merged.parentId === undefined) {
      merged.parentId = null;
    } else if (merged.parentId !== null) {
      merged.parentId = Number(merged.parentId);
    }
    menus[idx] = merged;
    saveNavMenus(menus);
    return menus[idx];
  },
  remove: async (id: number): Promise<void> => {
    await delay();
    const menus = loadNavMenus();
    const filtered = menus.filter((m) => m.id !== id);
    saveNavMenus(filtered);
  },
};

// ============================================================
// localStorage 持久化 — 页脚
// ============================================================
const FOOTER_KEY = 'mock_footer_items';

function loadFooterItems(): FooterItem[] {
  try {
    const stored = localStorage.getItem(FOOTER_KEY);
    if (stored) return JSON.parse(stored);
  } catch (e) { console.error('[loadFooterItems] parse失败', e); }
  return [];
}

function saveFooterItems(items: FooterItem[]): void {
  localStorage.setItem(FOOTER_KEY, JSON.stringify(items));
}

// ---- 页脚 ----
export const footerApi = {
  list: async (): Promise<FooterItem[]> => {
    await delay();
    const items = loadFooterItems();
    return items.sort((a, b) => a.sortOrder - b.sortOrder);
  },
  create: async (data: Omit<FooterItem, 'id' | 'createdAt'>): Promise<FooterItem> => {
    await delay();
    const items = loadFooterItems();
    const item: FooterItem = { ...data, id: Date.now(), createdAt: new Date().toISOString() };
    items.push(item);
    saveFooterItems(items);
    // 通知官网刷新
    window.dispatchEvent(new CustomEvent('footer-data-changed'));
    return item;
  },
  update: async (id: number, data: Partial<FooterItem>): Promise<FooterItem> => {
    await delay();
    const items = loadFooterItems();
    const item = items.find((f) => f.id === id);
    if (!item) throw new Error('页脚不存在');
    Object.assign(item, data);
    saveFooterItems(items);
    // 通知官网刷新
    window.dispatchEvent(new CustomEvent('footer-data-changed'));
    return item;
  },
  remove: async (id: number): Promise<void> => {
    await delay();
    const items = loadFooterItems();
    const idx = items.findIndex((f) => f.id === id);
    if (idx !== -1) items.splice(idx, 1);
    saveFooterItems(items);
    // 通知官网刷新
    window.dispatchEvent(new CustomEvent('footer-data-changed'));
  },
};
