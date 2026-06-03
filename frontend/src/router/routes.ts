import { lazy } from 'react';
import type { RouteItem } from '../types';
import {
  DashboardOutlined,
  UserOutlined,
  TeamOutlined,
  SafetyOutlined,
  PictureOutlined,
  AppstoreOutlined,
  PlaySquareOutlined,
  SettingOutlined,
  MenuOutlined,
  FileTextOutlined,
  VideoCameraOutlined,
  HomeOutlined,
} from '@ant-design/icons';
import React from 'react';

// 懒加载页面组件
const Home = lazy(() => import('../pages/home/Home'));
const Login = lazy(() => import('../pages/adminlogin/AdminLogin'));
const Register = lazy(() => import('../pages/home/RegisterPage'));
const PublicLogin = lazy(() => import('../pages/home/LoginPage'));
const Dashboard = lazy(() => import('../pages/dashboard/Dashboard'));
const MemberList = lazy(() => import('../pages/user/members/MemberList'));
const AdminList = lazy(() => import('../pages/user/admins/AdminList'));
const RolePermission = lazy(() => import('../pages/user/roles/RolePermission'));
const CarouselManage = lazy(() => import('../pages/content/carousel/CarouselManage'));
const MajorCategory = lazy(() => import('../pages/content/major/MajorCategory'));
const MajorHomeManage = lazy(() => import('../pages/content/majorhome/MajorHomeManage'));
const VideoGroup = lazy(() => import('../pages/content/video/VideoGroup'));
const VideoList = lazy(() => import('../pages/content/video/VideoList'));
const SiteSettings = lazy(() => import('../pages/system/site/SiteSettings'));
const NavMenuManage = lazy(() => import('../pages/system/menu/NavMenuManage'));
const FooterManage = lazy(() => import('../pages/system/footer/FooterManage'));

// ============================================================
// 侧边栏菜单配置（同时作为路由配置）
// icon 必须是 React.ReactNode
// ============================================================
export const menuRoutes: RouteItem[] = [
  {
    path: '/admin/dashboard',
    name: 'dashboard',
    icon: React.createElement(DashboardOutlined),
    component: Dashboard,
    meta: { title: '仪表盘', requiresAuth: true },
  },
  {
    path: '/admin/user',
    name: 'user',
    icon: React.createElement(UserOutlined),
    meta: { title: '用户管理', requiresAuth: true },
    children: [
      {
        path: '/admin/user/members',
        name: 'members',
        icon: React.createElement(TeamOutlined),
        component: MemberList,
        meta: { title: '注册用户', requiresAuth: true, roles: ['superadmin', 'editor'] },
      },
      {
        path: '/admin/user/admins',
        name: 'admins',
        icon: React.createElement(UserOutlined),
        component: AdminList,
        meta: { title: '管理员账号', requiresAuth: true, roles: ['superadmin'] },
      },
      {
        path: '/admin/user/roles',
        name: 'roles',
        icon: React.createElement(SafetyOutlined),
        component: RolePermission,
        meta: { title: '角色与权限', requiresAuth: true, roles: ['superadmin'] },
      },
    ],
  },
  {
    path: '/admin/content',
    name: 'content',
    icon: React.createElement(AppstoreOutlined),
    meta: { title: '内容管理', requiresAuth: true },
    children: [
      {
        path: '/admin/content/carousel',
        name: 'carousel',
        icon: React.createElement(PictureOutlined),
        component: CarouselManage,
        meta: { title: '轮播图管理', requiresAuth: true, roles: ['superadmin'] },
      },
      {
        path: '/admin/content/major',
        name: 'major',
        icon: React.createElement(AppstoreOutlined),
        component: MajorCategory,
        meta: { title: '专业分类', requiresAuth: true, roles: ['superadmin'] },
      },
      {
        path: '/admin/content/majorhome',
        name: 'majorhome',
        icon: React.createElement(HomeOutlined),
        component: MajorHomeManage,
        meta: { title: '专业主页列表', requiresAuth: true, roles: ['superadmin'] },
      },
      {
        path: '/admin/content/video-group',
        name: 'videoGroup',
        icon: React.createElement(VideoCameraOutlined),
        component: VideoGroup,
        meta: { title: '视频分组', requiresAuth: true, roles: ['superadmin'] },
      },
      {
        path: '/admin/content/video',
        name: 'video',
        icon: React.createElement(PlaySquareOutlined),
        component: VideoList,
        meta: { title: '视频详情页列表', requiresAuth: true, roles: ['superadmin'] },
      },
    ],
  },
  {
    path: '/admin/system',
    name: 'system',
    icon: React.createElement(SettingOutlined),
    meta: { title: '系统设置', requiresAuth: true },
    children: [
      {
        path: '/admin/system/site',
        name: 'site',
        icon: React.createElement(SettingOutlined),
        component: SiteSettings,
        meta: { title: '网站设置', requiresAuth: true, roles: ['superadmin'] },
      },
      {
        path: '/admin/system/menu',
        name: 'navmenu',
        icon: React.createElement(MenuOutlined),
        component: NavMenuManage,
        meta: { title: '导航菜单', requiresAuth: true, roles: ['superadmin'] },
      },
      {
        path: '/admin/system/footer',
        name: 'footer',
        icon: React.createElement(FileTextOutlined),
        component: FooterManage,
        meta: { title: '页脚管理', requiresAuth: true, roles: ['superadmin'] },
      },
    ],
  },
];

export { Login, Home, Register, PublicLogin };
