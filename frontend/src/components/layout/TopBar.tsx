import React from 'react';
import { Button, Avatar, Dropdown, Switch, Space, Typography } from 'antd';
import type { MenuProps } from 'antd';
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  MoonOutlined,
  SunOutlined,
  GlobalOutlined,
  LogoutOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useAuthStore, useLayoutStore } from '../../store';
import { authApi } from '../../api';

// ============================================================
// 顶部导航栏
// ============================================================

const TopBar: React.FC = () => {
  const navigate = useNavigate();
  const { admin, logout } = useAuthStore();
  const { collapsed, toggleCollapsed, darkMode, toggleDarkMode } = useLayoutStore();

  const handleLogout = async () => {
    await authApi.logout();
    logout();
    navigate('/adminlogin', { replace: true });
  };

  const userMenuItems: MenuProps['items'] = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: '个人信息',
    },
    { type: 'divider' },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: '退出登录',
      danger: true,
      onClick: handleLogout,
    },
  ];

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 16px',
        height: '100%',
        borderBottom: '1px solid rgba(0,0,0,0.06)',
      }}
    >
      {/* 左侧：折叠按钮 */}
      <Button
        type="text"
        icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
        onClick={toggleCollapsed}
        style={{ fontSize: 18, color: 'var(--brand-color)' }}
      />

      {/* 右侧工具栏 */}
      <Space size={16}>
        {/* 回到官网 */}
        <Button type="text" icon={<GlobalOutlined />} href="/" target="_blank" style={{ color: 'var(--brand-color)' }}>
          返回前台首页
        </Button>

        {/* 深色模式切换 */}
        <Space size={8}>
          {darkMode ? <MoonOutlined /> : <SunOutlined />}
          <Switch
            size="small"
            checked={darkMode}
            onChange={toggleDarkMode}
            checkedChildren="深色"
            unCheckedChildren="浅色"
          />
        </Space>

        {/* 管理员 */}
        <Dropdown menu={{ items: userMenuItems }} placement="bottomRight" arrow>
          <Avatar size={32} icon={<UserOutlined />} style={{ backgroundColor: 'var(--ant-color-primary)', cursor: 'pointer' }} />
        </Dropdown>
      </Space>
    </div>
  );
};

export default TopBar;
