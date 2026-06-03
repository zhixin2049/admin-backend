import React, { Suspense, lazy } from 'react';
import { Navigate, type RouteObject } from 'react-router-dom';
import { Spin } from 'antd';
import MainLayout from '../layouts/MainLayout';
import { menuRoutes, Login, Home, Register, PublicLogin } from './routes';
import type { RouteItem } from '../types';
import AuthGuard from '../components/common/AuthGuard';

const ListsPage = lazy(() => import('../pages/home/Lists'));
const VideoDetail = lazy(() => import('../pages/home/VideoDetail'));
const MajorDetail = lazy(() => import('../pages/home/MajorDetail'));
const MajorDetailBig = lazy(() => import('../pages/home/MajorDetailBig'));
const MajorCardDetail = lazy(() => import('../pages/home/MajorCardDetail'));
const VideoForm = lazy(() => import('../pages/content/video/VideoForm'));
const CardEditPage = lazy(() => import('../pages/content/majorhome/CardEditPage'));
const FeaturedCardEditPage = lazy(() => import('../pages/content/majorhome/FeaturedCardEditPage'));

// ============================================================
// 将菜单路由配置展平为 React Router RouteObject
// ============================================================

const LoadingFallback = () => (
  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', minHeight: 200 }}>
    <Spin size="large" />
  </div>
);

function buildRoutes(items: RouteItem[]): RouteObject[] {
  return items.flatMap((item) => {
    if (item.children && item.children.length > 0) {
      return buildRoutes(item.children);
    }
    if (!item.component) return [];
    const Component = item.component;
    return [
      {
        path: item.path,
        element: (
          <AuthGuard roles={item.meta?.roles} path={item.path}>
            <Suspense fallback={<LoadingFallback />}>
              <Component />
            </Suspense>
          </AuthGuard>
        ),
      },
    ];
  });
}

export const appRoutes: RouteObject[] = [
  {
    path: '/',
    element: (
      <Suspense fallback={<LoadingFallback />}>
        <Home />
      </Suspense>
    ),
  },
  {
    path: '/login',
    element: (
      <Suspense fallback={<LoadingFallback />}>
        <PublicLogin />
      </Suspense>
    ),
  },
  {
    path: '/register',
    element: (
      <Suspense fallback={<LoadingFallback />}>
        <Register />
      </Suspense>
    ),
  },
  {
    path: '/adminlogin',
    element: (
      <Suspense fallback={<LoadingFallback />}>
        <Login />
      </Suspense>
    ),
  },
  {
    path: '/admin',
    element: <MainLayout />,
    children: [
      { index: true, element: <Navigate to="/admin/dashboard" replace /> },
      ...buildRoutes(menuRoutes),
      {
        path: 'content/video/create',
        element: (
          <Suspense fallback={<LoadingFallback />}>
            <VideoForm />
          </Suspense>
        ),
      },
      {
        path: 'content/video/edit/:id',
        element: (
          <Suspense fallback={<LoadingFallback />}>
            <VideoForm />
          </Suspense>
        ),
      },
      {
        path: 'content/majorhome/card/edit/:cardId',
        element: (
          <Suspense fallback={<LoadingFallback />}>
            <CardEditPage />
          </Suspense>
        ),
      },
      {
        path: 'content/majorhome/featured/edit/:majorId',
        element: (
          <Suspense fallback={<LoadingFallback />}>
            <FeaturedCardEditPage />
          </Suspense>
        ),
      },
    ],
  },
  {
    path: '/videos',
    element: (
      <Suspense fallback={<LoadingFallback />}>
        <ListsPage />
      </Suspense>
    ),
  },
  {
    path: '/videos/detail/:id',
    element: (
      <Suspense fallback={<LoadingFallback />}>
        <VideoDetail />
      </Suspense>
    ),
  },
  {
    path: '/major/:slug/big',
    element: (
      <Suspense fallback={<LoadingFallback />}>
        <MajorDetailBig />
      </Suspense>
    ),
  },
  {
    path: '/major/:slug/:cardNum',
    element: (
      <Suspense fallback={<LoadingFallback />}>
        <MajorCardDetail />
      </Suspense>
    ),
  },
  {
    path: '/major/:slug',
    element: (
      <Suspense fallback={<LoadingFallback />}>
        <MajorDetail />
      </Suspense>
    ),
  },
  { path: '*', element: <Navigate to="/" replace /> },
];
