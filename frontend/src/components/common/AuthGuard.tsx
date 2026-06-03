import React, { useMemo } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../../store';
import { loadRoles } from '../../api';
import { message } from 'antd';

// ============================================================
// 路由守卫：检查登录状态和角色权限
// ============================================================

interface AuthGuardProps {
  children: React.ReactNode;
  roles?: string[];
  path?: string; // 当前路由路径，用于权限检查
}

const AuthGuard: React.FC<AuthGuardProps> = ({ children, roles, path }) => {
  const { isLoggedIn, admin } = useAuthStore();
  const adminRole = (admin?.role || '').toLowerCase();

  // 加载当前角色的权限
  const permissions = useMemo(() => {
    if (!adminRole) return [];
    try {
      const allRoles = loadRoles();
      const matched = allRoles.find((r) => r.slug.toLowerCase() === adminRole);
      return matched?.permissions || [];
    } catch {
      return [];
    }
  }, [adminRole]);

  if (!isLoggedIn) {
    return <Navigate to="/adminlogin" replace />;
  }

  // 角色权限检查
  if (roles && roles.length > 0 && admin) {
    // superadmin 通吃
    if (adminRole === 'superadmin') return <>{children}</>;
    // slug 匹配
    const slugMatch = roles.some((r) => r.toLowerCase() === adminRole);
    if (slugMatch) return <>{children}</>;
    // 权限匹配：检查角色的 permissions 是否覆盖当前路由
    if (path && permissions.length > 0) {
      const ROUTE_RESOURCE: Record<string, string> = {
        '/admin/dashboard': 'dashboard',
        '/admin/user/members': 'member',
        '/admin/user/admins': 'admin',
        '/admin/user/roles': 'role',
        '/admin/content/carousel': 'carousel',
        '/admin/content/major': 'major',
        '/admin/content/majorhome': 'major',
        '/admin/content/video-group': 'video',
        '/admin/content/video': 'video',
        '/admin/system/site': 'siteSettings',
        '/admin/system/menu': 'navMenu',
        '/admin/system/footer': 'footer',
      };
      const resource = ROUTE_RESOURCE[path];
      if (resource && permissions.some((p) => p.resource === resource && p.action === 'read')) {
        return <>{children}</>;
      }
    }
    message.error('您没有访问该页面的权限');
    return <Navigate to="/admin/dashboard" replace />;
  }

  return <>{children}</>;
};

export default AuthGuard;
