import React from 'react';
import { BrowserRouter, useRoutes } from 'react-router-dom';
import { App as AntdApp } from 'antd';
import { appRoutes } from './router';

// ============================================================
// 路由渲染组件
// ============================================================
const AppRoutes: React.FC = () => {
  const element = useRoutes(appRoutes);
  return element;
};

const App: React.FC = () => {
  return (
    <AntdApp>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AntdApp>
  );
};

export default App;
