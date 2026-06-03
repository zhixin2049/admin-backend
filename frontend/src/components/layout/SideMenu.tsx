import React, { useState, useMemo, useEffect } from 'react';
import { Menu } from 'antd';
import { useNavigate, useLocation } from 'react-router-dom';
import type { MenuProps } from 'antd';
import { menuRoutes } from '../../router/routes';
import { useAuthStore } from '../../store';
import { loadRoles } from '../../api';
import type { RouteItem, Permission } from '../../types';

// ============================================================
// 侧边栏菜单（按角色权限过滤，默认展开全部）
// ============================================================

type MenuItem = Required<MenuProps>['items'][number];

/** 路由路径 → 所需权限映射 */
const ROUTE_PERMISSION: Record<string, { resource: string; action: string }> = {
  '/admin/dashboard':        { resource: 'dashboard',   action: 'read' },
  '/admin/user/members':     { resource: 'member',      action: 'read' },
  '/admin/user/admins':      { resource: 'admin',       action: 'read' },
  '/admin/user/roles':       { resource: 'role',        action: 'read' },
  '/admin/content/carousel': { resource: 'carousel',    action: 'read' },
  '/admin/content/major':    { resource: 'major',       action: 'read' },
  '/admin/content/majorhome':{ resource: 'major',       action: 'read' },
  '/admin/content/video-group':{ resource: 'video',     action: 'read' },
  '/admin/content/video':    { resource: 'video',       action: 'read' },
  '/admin/system/site':      { resource: 'siteSettings',action: 'read' },
  '/admin/system/menu':      { resource: 'navMenu',     action: 'read' },
  '/admin/system/footer':    { resource: 'footer',      action: 'read' },
};

/** 判断当前管理员是否有权限访问该路由 */
function canAccess(route: RouteItem, adminRole: string, permissions: Permission[]): boolean {
  // superadmin 拥有所有权限
  if (adminRole === 'superadmin') return true;
  // 无角色限制 → 所有角色可见
  if (!route.meta?.roles || route.meta.roles.length === 0) return true;
  // 1) 角色 slug 匹配（如 editor 匹配 ['superadmin', 'editor']）
  if (route.meta.roles.some((r) => r.toLowerCase() === adminRole)) return true;
  // 2) 权限匹配：admin 的角色权限覆盖该路由所需 resource:action
  const required = ROUTE_PERMISSION[route.path];
  if (required) {
    return permissions.some(
      (p) => p.resource === required.resource && p.action === required.action
    );
  }
  return false;
}

/** 递归过滤路由树：只保留有权限的节点 */
function filterRoutes(routes: RouteItem[], adminRole: string, permissions: Permission[]): RouteItem[] {
  return routes
    .filter((r) => !r.meta?.hidden)
    .map((r) => {
      if (r.children && r.children.length > 0) {
        const filteredChildren = filterRoutes(r.children, adminRole, permissions);
        if (filteredChildren.length === 0) return null;
        return { ...r, children: filteredChildren };
      }
      return canAccess(r, adminRole, permissions) ? r : null;
    })
    .filter((r): r is RouteItem => r !== null);
}

function buildMenuItems(routes: RouteItem[]): MenuItem[] {
  return routes.map((r) => {
    if (r.children && r.children.length > 0) {
      return {
        key: r.path,
        icon: r.icon as React.ReactNode,
        label: r.meta?.title || r.name,
        children: buildMenuItems(r.children),
      };
    }
    return {
      key: r.path,
      icon: r.icon as React.ReactNode,
      label: r.meta?.title || r.name,
    };
  });
}

/** 提取所有带 children 的父菜单 key */
function getAllParentKeys(routes: RouteItem[]): string[] {
  return routes
    .filter((r) => r.children && r.children.length > 0)
    .map((r) => r.path);
}

const SideMenu: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const admin = useAuthStore((s) => s.admin);
  const adminRole = (admin?.role || '').toLowerCase();

  // 加载当前角色的权限列表
  const permissions = useMemo<Permission[]>(() => {
    if (!adminRole) return [];
    try {
      const roles = loadRoles();
      const matched = roles.find((r) => r.slug.toLowerCase() === adminRole);
      return matched?.permissions || [];
    } catch {
      return [];
    }
  }, [adminRole]);

  // 按角色过滤后的菜单路由
  const filteredRoutes = useMemo(
    () => filterRoutes(menuRoutes, adminRole, permissions),
    [adminRole, permissions],
  );

  // 默认展开所有父菜单（过滤后的）
  const allParentKeys = useMemo(() => getAllParentKeys(filteredRoutes), [filteredRoutes]);
  const [openKeys, setOpenKeys] = useState<string[]>(allParentKeys);

  // 点击子菜单时，确保父菜单保持展开
  useEffect(() => {
    const activeParents = filteredRoutes
      .filter((r) => r.children?.some((c) => location.pathname.startsWith(c.path)))
      .map((r) => r.path);
    if (activeParents.length > 0) {
      setOpenKeys((prev) => Array.from(new Set([...prev, ...activeParents])));
    }
  }, [location.pathname, filteredRoutes]);

  // 当 filteredRoutes 变化时重置展开项
  useEffect(() => {
    setOpenKeys(getAllParentKeys(filteredRoutes));
  }, [filteredRoutes]);

  const handleClick: MenuProps['onClick'] = ({ key }) => {
    navigate(key);
  };

  const handleOpenChange = (keys: string[]) => {
    setOpenKeys(keys);
  };

  return (
    <Menu
      mode="inline"
      selectedKeys={[location.pathname]}
      openKeys={openKeys}
      items={buildMenuItems(filteredRoutes)}
      onClick={handleClick}
      onOpenChange={handleOpenChange}
      style={{ border: 'none', flex: 1 }}
    />
  );
};

export default SideMenu;
