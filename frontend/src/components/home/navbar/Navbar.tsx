import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, ConfigProvider, Drawer, Avatar, Button, Layout, Flex, Typography } from 'antd';
import type { MenuProps } from 'antd';
import { useNavMenuStore, useUserStore } from '../../../store';
import { navMenuApi } from '../../../api';
import { buildNavTree, getTopLevelMenus } from './utils';
import type { NavMenu } from '../../../types';
import { UserOutlined } from '@ant-design/icons';
import {
  MOBILE_BREAKPOINT,
  navbarStyle,
  containerStyle,
  containerMobileStyle,
  logoLinkStyle,
  logoIconStyle,
  logoTextStyle,
  rightMenuStyle,
  hamburgerWrapperStyle,
  hamburgerWrapperHiddenStyle,
  hamburgerBtnStyle,
  hamburgerLineStyle,
} from './styles';

const { Header } = Layout;
const { Text } = Typography;

// ============================================================
// NavMenu 树 → antd Menu items
// ============================================================
function toMenuItems(nodes: NavMenu[]): MenuProps['items'] {
  return nodes
    .filter((n) => n.isVisible)
    .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))
    .map((node) => ({
      key: String(node.id),
      label: node.linkUrl ? (
        <a
          href={node.linkUrl}
          target={node.linkUrl === '/' ? undefined : '_blank'}
          rel={node.linkUrl === '/' ? undefined : 'noopener noreferrer'}
          style={{ color: 'inherit' }}
        >
          {node.displayName}
        </a>
      ) : (
        node.displayName
      ),
      children:
        node.children && node.children.length > 0
          ? toMenuItems(node.children)
          : undefined,
    }));
}

// ============================================================
// antd Menu 主题 tokens（保持原有配色）
// ============================================================
const navbarMenuTheme = {
  components: {
    Menu: {
      itemBg: 'transparent',
      itemColor: 'rgba(255, 255, 255, 1)',
      itemHoverColor: '#ff8400',
      itemSelectedColor: 'rgba(255, 255, 255, 1)',
      itemHoverBg: 'transparent',
      horizontalItemSelectedColor: 'rgba(255, 255, 255, 1)',
      horizontalLineWidth: 0,
      subMenuItemBg: '#1a1a2e',
      popupBg: '#1a1a2e',
      darkPopupBg: '#1a1a2e',
      itemActiveBg: 'transparent',
      fontSize: 15,
    },
  },
};

// ============================================================
// Navbar 组件
// ============================================================
const Navbar: React.FC = () => {
  const navigate = useNavigate();
  const user = useUserStore((s) => s.user);
  const logout = useUserStore((s) => s.logout);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(
    () => typeof window !== 'undefined' && window.innerWidth < MOBILE_BREAKPOINT,
  );
  const { menus, setMenus } = useNavMenuStore();

  // 响应式监听
  useEffect(() => {
    const mediaQuery = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`);
    const handler = (e: MediaQueryListEvent) => {
      setIsMobile(e.matches);
      if (!e.matches) setDrawerOpen(false);
    };
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  // 启动时从 localStorage 同步菜单数据
  useEffect(() => {
    navMenuApi.list().then((list) => setMenus(list));
  }, [setMenus]);

  const treeData = buildNavTree(menus);
  const topLevel = getTopLevelMenus(treeData);
  const menuItems = toMenuItems(topLevel);

  const container = isMobile ? containerMobileStyle : containerStyle;
  const hamburgerWrapper = isMobile ? hamburgerWrapperStyle : hamburgerWrapperHiddenStyle;

  return (
    <Header
      style={{
        ...navbarStyle,
        height: 70,
        lineHeight: '70px',
        padding: 0,
        display: 'flex',
        alignItems: 'center',
        background: navbarStyle.background,
      }}
    >
      <Flex
        align="center"
        style={{
          ...container,
          width: '100%',
        }}
      >
        {/* ---- Logo ---- */}
        <Link to="/" style={logoLinkStyle}>
          <div style={logoIconStyle}>高</div>
          <Text
            style={{
              ...logoTextStyle,
              color: 'white',
              fontSize: '1.3rem',
              fontWeight: 600,
            }}
          >
            AI主题站开发
          </Text>
        </Link>

        {/* ---- 桌面端: antd Menu horizontal ---- */}
        {!isMobile && (
          <ConfigProvider theme={navbarMenuTheme}>
            <Menu
              className="navbar-menu"
              mode="horizontal"
              items={menuItems}
              style={{
                background: 'transparent',
                borderBottom: 'none',
                flex: 1,
                justifyContent: 'center',
                lineHeight: '70px',
              }}
            />
          </ConfigProvider>
        )}

        {/* ---- 汉堡按钮（移动端） ---- */}
        <Flex
          style={hamburgerWrapper}
          align="center"
          justify="center"
        >
          <button
            style={hamburgerBtnStyle}
            onClick={() => setDrawerOpen(true)}
            aria-label="菜单"
          >
            {[0, 1, 2].map((i) => (
              <span key={i} style={hamburgerLineStyle} />
            ))}
          </button>
        </Flex>

        {/* ---- 右侧按钮 ---- */}
        <Flex align="center" gap="middle" style={rightMenuStyle}>
          {user ? (
            <>
              <Avatar style={{ backgroundColor: '#ff8400' }} icon={<UserOutlined />} />
              <span
                style={{
                  color: 'rgba(255,255,255,0.9)',
                  fontSize: isMobile ? '0.85rem' : '0.9rem',
                  whiteSpace: 'nowrap',
                }}
              >
                {user.username}
              </span>
              <Button
                className="navbar-btn"
                onClick={() => {
                  logout();
                  navigate('/');
                }}
                style={{
                  color: 'white',
                  background: 'transparent',
                  border: '1px solid rgba(255, 255, 255, 0.3)',
                  borderRadius: 20,
                  padding: isMobile ? '0.4rem 0.8rem' : '0.5rem 1.25rem',
                  fontSize: isMobile ? '0.85rem' : '0.9rem',
                  whiteSpace: 'nowrap',
                  transition: 'background 0.3s',
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.15)';
                  (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.3)';
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.background = 'transparent';
                  (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.3)';
                }}
              >
                退出
              </Button>
            </>
          ) : (
            <>
              <Button
                className="navbar-btn"
                href="/login"
                style={{
                  color: 'white',
                  background: 'transparent',
                  border: '1px solid rgba(255, 255, 255, 0.3)',
                  borderRadius: 20,
                  padding: isMobile ? '0.4rem 0.8rem' : '0.5rem 1.25rem',
                  fontSize: isMobile ? '0.85rem' : '0.9rem',
                  whiteSpace: 'nowrap',
                  transition: 'color 0.3s',
                }}
              >
                登录
              </Button>
              <Button
                className="navbar-btn"
                href="/register"
                type="primary"
                style={{
                  color: 'white',
                  background: '#ff8400',
                  border: 'none',
                  borderRadius: 20,
                  padding: isMobile ? '0.4rem 0.8rem' : '0.5rem 1.25rem',
                  fontSize: isMobile ? '0.85rem' : '0.9rem',
                  whiteSpace: 'nowrap',
                }}
              >
                注册
              </Button>
            </>
          )}
        </Flex>
      </Flex>

      {/* ---- 移动端: Drawer + Menu inline ---- */}
      <Drawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        placement="right"
        width={280}
        styles={{
          body: { padding: 0, background: '#1a1a2e' },
          header: { display: 'none' },
        }}
      >
        <ConfigProvider theme={navbarMenuTheme}>
          <Menu
            className="navbar-menu-mobile"
            mode="inline"
            items={menuItems}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'rgba(255,255,255,0.9)',
              paddingTop: 16,
            }}
            onClick={() => setDrawerOpen(false)}
          />
        </ConfigProvider>
      </Drawer>
    </Header>
  );
};

export default Navbar;
