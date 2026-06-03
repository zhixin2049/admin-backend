import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Admin, TabItem, NavMenu, Member } from '../types';

// ============================================================
// Zustand 全局状态管理
// ============================================================

// ---- 认证 Store ----
interface AuthState {
  token: string | null;
  admin: Admin | null;
  isLoggedIn: boolean;
  setToken: (token: string) => void;
  setAdmin: (admin: Admin) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      admin: null,
      isLoggedIn: false,
      setToken: (token) => set({ token, isLoggedIn: !!token }),
      setAdmin: (admin) => set({ admin }),
      logout: () => {
        localStorage.removeItem('auth-storage');
        set({ token: null, admin: null, isLoggedIn: false });
      },
    }),
    {
      name: 'auth-storage',
    }
  )
);

// ---- 布局 Store（侧边栏、深色模式） ----
interface LayoutState {
  collapsed: boolean;
  darkMode: boolean;
  toggleCollapsed: () => void;
  toggleDarkMode: () => void;
  setCollapsed: (v: boolean) => void;
}

export const useLayoutStore = create<LayoutState>()(
  persist(
    (set) => ({
      collapsed: false,
      darkMode: false,
      toggleCollapsed: () => set((s) => ({ collapsed: !s.collapsed })),
      toggleDarkMode: () => set((s) => ({ darkMode: !s.darkMode })),
      setCollapsed: (v) => set({ collapsed: v }),
    }),
    { name: 'layout-storage' }
  )
);

// ---- Tab 标签页 Store ----
interface TabState {
  tabs: TabItem[];
  activeKey: string;
  addTab: (tab: TabItem) => void;
  removeTab: (key: string) => void;
  setActiveKey: (key: string) => void;
  clearTabs: () => void;
}

const DEFAULT_TAB: TabItem = {
  key: '/admin/dashboard',
  label: '仪表盘',
  path: '/admin/dashboard',
  closable: false,
};

export const useTabStore = create<TabState>()((set, get) => ({
  tabs: [DEFAULT_TAB],
  activeKey: '/admin/dashboard',
  addTab: (tab) => {
    const { tabs } = get();
    const exists = tabs.find((t) => t.key === tab.key);
    if (!exists) {
      set({ tabs: [...tabs, tab] });
    }
    set({ activeKey: tab.key });
  },
  removeTab: (key) => {
    const { tabs, activeKey } = get();
    if (tabs.length === 1) return;
    const idx = tabs.findIndex((t) => t.key === key);
    const newTabs = tabs.filter((t) => t.key !== key);
    let newActive = activeKey;
    if (activeKey === key) {
      newActive = newTabs[Math.max(0, idx - 1)].key;
    }
    set({ tabs: newTabs, activeKey: newActive });
  },
  setActiveKey: (key) => set({ activeKey: key }),
  clearTabs: () => set({ tabs: [DEFAULT_TAB], activeKey: '/admin/dashboard' }),
}));

// ---- 导航菜单 Store ----
interface NavMenuState {
  menus: NavMenu[];
  loaded: boolean;
  setMenus: (menus: NavMenu[]) => void;
  upsertMenu: (menu: NavMenu) => void;
  removeMenu: (id: number) => void;
}

const DEFAULT_NAV_MENUS: NavMenu[] = [
  { id: 1, parentId: null, displayName: '平台首页', linkType: 'internal', linkUrl: '/', openNewTab: false, sortOrder: 1, isVisible: true },
  { id: 2, parentId: null, displayName: '专业解读', linkType: 'internal', linkUrl: '/major', openNewTab: false, sortOrder: 2, isVisible: true },
  { id: 3, parentId: null, displayName: '院校查询', linkType: 'internal', linkUrl: '/college', openNewTab: false, sortOrder: 3, isVisible: true },
  { id: 4, parentId: null, displayName: '就业分析', linkType: 'internal', linkUrl: '/career', openNewTab: false, sortOrder: 4, isVisible: true },
  { id: 5, parentId: null, displayName: '志愿填报', linkType: 'internal', linkUrl: '/volunteer', openNewTab: false, sortOrder: 5, isVisible: true },
];

export const useNavMenuStore = create<NavMenuState>()(
  persist(
    (set) => ({
      menus: DEFAULT_NAV_MENUS,
      loaded: false,
      setMenus: (menus) => set({ menus, loaded: true }),
      upsertMenu: (menu) =>
        set((state) => {
          const exists = state.menus.find((m) => m.id === menu.id);
          if (exists) {
            // 保留原有的 children（菜单数据是 flat 数组，children 由 buildTableTree 构建）
            return { menus: state.menus.map((m) => (m.id === menu.id ? { ...m, ...menu, children: m.children } : m)) };
          }
          return { menus: [...state.menus, menu] };
        }),
      removeMenu: (id) =>
        set((state) => ({ menus: state.menus.filter((m) => m.id !== id) })),
    }),
    { name: 'navmenu-storage' }
  )
);

// ---- 前端用户 Store（官网登录状态） ----
interface UserState {
  user: Member | null;
  setUser: (user: Member) => void;
  logout: () => void;
}

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      user: null,
      setUser: (user) => set({ user }),
      logout: () => {
        localStorage.removeItem('user-storage');
        set({ user: null });
      },
    }),
    { name: 'user-storage' }
  )
);
