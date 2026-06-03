import React, { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Layout, ConfigProvider, theme } from 'antd';
import zhCN from 'antd/locale/zh_CN';
import { useLayoutStore, useTabStore } from '../store';
import SideMenu from '../components/layout/SideMenu';
import TopBar from '../components/layout/TopBar';
import TabsBar from '../components/layout/TabsBar';
import BreadcrumbBar from '../components/layout/BreadcrumbBar';
import { menuRoutes } from '../router/routes';
import '../styles/layout.css';

const { Header, Sider, Content } = Layout;

// ============================================================
// 主布局组件：侧边栏 + 顶栏 + 标签页 + 内容区
// ============================================================

function findTitle(path: string): string {
  // 特殊路由的标题映射
  if (path === '/admin/content/video/create') return '新增视频';
  if (path.startsWith('/admin/content/video/edit/')) return '编辑视频';
  if (path.startsWith('/admin/content/majorhome/featured/edit/')) return '编辑大卡片';
  const flatRoutes = (routes: typeof menuRoutes): typeof menuRoutes => {
    return routes.flatMap((r) => (r.children ? flatRoutes(r.children) : [r]));
  };
  const found = flatRoutes(menuRoutes).find((r) => r.path === path);
  return found?.meta?.title || path;
}

const MainLayout: React.FC = () => {
  const { collapsed, darkMode } = useLayoutStore();
  const { addTab } = useTabStore();
  const location = useLocation();

  // 路由变化时自动添加 Tab
  useEffect(() => {
    if (location.pathname !== '/' && !location.pathname.includes('/content/majorhome/card/edit') && !location.pathname.includes('/content/majorhome/featured/edit')) {
      addTab({
        key: location.pathname,
        label: findTitle(location.pathname),
        path: location.pathname,
        closable: location.pathname !== '/admin/dashboard',
      });
    }
  }, [location.pathname, addTab]);

  return (
    <ConfigProvider
      locale={zhCN}
      theme={{
        algorithm: darkMode ? theme.darkAlgorithm : theme.defaultAlgorithm,
        token: {
          colorPrimary: '#1677ff',
          borderRadius: 6,
        },
      }}
    >
      <Layout style={{ minHeight: '100vh' }}>
        {/* 侧边栏 */}
        <Sider
          trigger={null}
          collapsible
          collapsed={collapsed}
          width={220}
          collapsedWidth={64}
          style={{
            overflow: 'auto',
            height: '100vh',
            position: 'fixed',
            left: 0,
            top: 0,
            bottom: 0,
            zIndex: 100,
          }}
        >
          {/* Logo */}
          <div className="layout-logo">
            {!collapsed ? (
              <span className="layout-logo-text">⚡ 管理后台</span>
            ) : (
              <span className="layout-logo-icon">⚡</span>
            )}
          </div>
          <SideMenu />
        </Sider>

        {/* 右侧主区域 */}
        <Layout style={{ marginLeft: collapsed ? 64 : 220, transition: 'margin-left 0.2s' }}>
          {/* 顶部导航 */}
          <Header
            style={{
              padding: 0,
              position: 'sticky',
              top: 0,
              zIndex: 99,
              width: '100%',
              height: 56,
              lineHeight: '56px',
            }}
          >
            <TopBar />
          </Header>

          {/* 标签页 */}
          <TabsBar />

          {/* 面包屑（卡片/大卡片编辑页用自带面包屑，此处隐藏） */}
          {!location.pathname.includes('/content/majorhome/card/edit') && !location.pathname.includes('/content/majorhome/featured/edit') && (
            <div style={{ padding: '8px 16px 0' }}>
              <BreadcrumbBar />
            </div>
          )}

          {/* 页面内容 */}
          <Content style={{ margin: '8px 16px 16px', minHeight: 280, borderRadius: 8, overflow: 'auto' }}>
            <Outlet />
          </Content>
        </Layout>
      </Layout>
    </ConfigProvider>
  );
};

export default MainLayout;
