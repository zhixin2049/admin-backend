import React from 'react';
import { Breadcrumb } from 'antd';
import { Link, useLocation } from 'react-router-dom';
import { menuRoutes } from '../../router/routes';
import type { RouteItem } from '../../types';
import { HomeOutlined } from '@ant-design/icons';

// ============================================================
// 面包屑导航（根据当前路由动态生成）
// ============================================================

interface Crumb {
  title: React.ReactNode;
  path?: string;
}

function buildCrumbs(routes: RouteItem[], pathname: string, prefix: Crumb[] = []): Crumb[] | null {
  const linkStyle = { color: 'var(--brand-color)' };
  for (const route of routes) {
    const current: Crumb = {
      title: route.path === '/dashboard' ? (
        <Link to={route.path} style={linkStyle}><HomeOutlined /> {route.meta?.title}</Link>
      ) : (
        route.children ? route.meta?.title : <Link to={route.path} style={linkStyle}>{route.meta?.title}</Link>
      ),
      path: route.path,
    };
    if (route.path === pathname) {
      return [...prefix, current];
    }
    if (route.children) {
      const result = buildCrumbs(route.children, pathname, [...prefix, current]);
      if (result) return result;
    }
  }
  return null;
}

const BreadcrumbBar: React.FC = () => {
  const location = useLocation();
  const crumbs = buildCrumbs(menuRoutes, location.pathname) || [
    { title: <Link to="/dashboard" style={{ color: 'var(--brand-color)' }}><HomeOutlined /> 仪表盘</Link> },
  ];

  return (
    <Breadcrumb
      items={crumbs.map((c) => ({ title: c.title }))}
      style={{ fontSize: 13, lineHeight: '22px' }}
    />
  );
};

export default BreadcrumbBar;
