import React from 'react';

export const MOBILE_BREAKPOINT = 900;

// Navbar 外层
export const navbarStyle: React.CSSProperties = {
  background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
  position: 'sticky',
  top: 0,
  zIndex: 1000,
  boxShadow: '0 2px 10px rgba(0,0,0,0.15)',
  width: '100%',
};

// 容器 - 桌面端
export const containerStyle: React.CSSProperties = {
  maxWidth: 1400,
  margin: '0 auto',
  display: 'flex',
  alignItems: 'center',
  padding: '0 2rem',
  height: 70,
};

// 容器 - 移动端
export const containerMobileStyle: React.CSSProperties = {
  ...containerStyle,
  padding: '0 1rem',
  justifyContent: 'space-between',
  position: 'relative',
};

// ---- Logo ----
export const logoLinkStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '0.75rem',
  color: 'white',
  textDecoration: 'none',
  zIndex: 1002,
  flexShrink: 0,
  flex: 1,
};

export const logoIconStyle: React.CSSProperties = {
  width: 42,
  height: 42,
  background: 'linear-gradient(135deg, #00a854, #00c853)',
  borderRadius: 10,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontWeight: 'bold',
  fontSize: '1.2rem',
  color: 'white',
};

export const logoTextStyle: React.CSSProperties = {
  fontSize: '1.3rem',
  fontWeight: 600,
  color: 'white',
};

// ---- 右侧按钮栏 ----
export const rightMenuStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'flex-end',
  gap: '1rem',
  flex: 1,
  zIndex: 1002,
  flexShrink: 0,
};

// 登录按钮
export const loginBtnStyle: React.CSSProperties = {
  color: 'white',
  border: '1px solid rgba(255, 255, 255, 0.3)',
  background: 'transparent',
  borderRadius: 20,
  padding: '0.5rem 1.25rem',
  fontSize: '0.9rem',
  textDecoration: 'none',
  transition: 'background 0.3s',
  display: 'inline-block',
  whiteSpace: 'nowrap',
};

// 注册按钮
export const registerBtnStyle: React.CSSProperties = {
  color: 'white',
  background: '#ff8400',
  border: 'none',
  borderRadius: 20,
  padding: '0.5rem 1.25rem',
  fontSize: '0.9rem',
  textDecoration: 'none',
  transition: 'background 0.3s',
  display: 'inline-block',
  whiteSpace: 'nowrap',
};

// ---- 汉堡按钮 ----
export const hamburgerWrapperStyle: React.CSSProperties = {
  position: 'absolute',
  left: 0,
  right: 0,
  width: 40,
  margin: '0 auto',
  display: 'flex',
  justifyContent: 'center',
  zIndex: 1003,
};

export const hamburgerWrapperHiddenStyle: React.CSSProperties = {
  display: 'none',
};

export const hamburgerBtnStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  gap: 5,
  width: 36,
  height: 36,
  background: 'none',
  border: 'none',
  cursor: 'pointer',
  padding: 0,
};

export const hamburgerLineStyle: React.CSSProperties = {
  display: 'block',
  width: 22,
  height: 2,
  background: 'white',
  borderRadius: 2,
  transition: 'all 0.3s',
};
