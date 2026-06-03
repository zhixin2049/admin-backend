import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Form, Input, Button, Typography, ConfigProvider } from 'antd';
import Navbar from '../../components/home/Navbar';
import { memberApi } from '../../api';
import { useUserStore } from '../../store';

const { Text } = Typography;

// ============================================================
// 登录页面 — antd Form 重构
// ============================================================

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const setUser = useUserStore((s) => s.setUser);
  const [form] = Form.useForm();
  const [loggedIn, setLoggedIn] = useState(false);
  const [account, setAccount] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const handleSubmit = async (values: { account: string; password: string }) => {
    setSubmitError('');
    setSubmitting(true);
    try {
      const member = await memberApi.login(values.account, values.password);
      setUser(member);
      setAccount(values.account);
      setLoggedIn(true);
    } catch (err: unknown) {
      setSubmitError(err instanceof Error ? err.message : '登录失败，请重试');
    } finally {
      setSubmitting(false);
    }
  };

  // ---- 登录成功 ----
  if (loggedIn) {
    return (
      <ConfigProvider theme={{ token: { colorPrimary: '#00a854' } }}>
        <Navbar />
        <div style={pageStyle}>
          <div style={cardStyle}>
            <div style={{ textAlign: 'center' }}>
              <div style={successIconStyle}>&#10003;</div>
              <h2 style={{ fontSize: '1.5rem', color: '#333', marginBottom: '0.5rem' }}>登录成功！</h2>
              <p style={{ color: '#666', fontSize: '0.95rem' }}>
                欢迎回来，<strong>{account}</strong>
              </p>
              <Button type="primary" block size="large" style={{ marginTop: '1rem' }} onClick={() => navigate('/')}>
                返回首页
              </Button>
            </div>
          </div>
        </div>
      </ConfigProvider>
    );
  }

  // ---- 登录表单 ----
  return (
    <ConfigProvider theme={{ token: { colorPrimary: '#00a854', borderRadius: 8 } }}>
      <Navbar />
      <div style={pageStyle}>
        <div style={cardStyle}>
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 700, color: '#333', marginBottom: '0.5rem' }}>账号登录</h1>
            <p style={{ color: '#666', fontSize: '0.95rem' }}>
              还没有账号？<a href="/register" style={{ color: '#00a854', textDecoration: 'none', fontWeight: 500 }}>立即注册</a>
            </p>
          </div>

          <Form form={form} layout="vertical" size="large" onFinish={handleSubmit}>
            <Form.Item
              name="account"
              label="账号/手机"
              rules={[{ required: true, message: '请输入账号名称或手机号码' }]}
            >
              <Input placeholder="请输入账号名称或手机号码" autoComplete="username" />
            </Form.Item>

            <Form.Item
              name="password"
              label="用户密码"
              rules={[{ required: true, message: '请输入用户密码' }]}
            >
              <Input.Password placeholder="请输入用户密码" autoComplete="current-password" />
            </Form.Item>

            {submitError && (
              <div style={{ textAlign: 'center', marginBottom: 16 }}>
                <Text type="danger">{submitError}</Text>
              </div>
            )}

            <Form.Item>
              <Button type="primary" htmlType="submit" loading={submitting} block>
                登 录
              </Button>
            </Form.Item>
          </Form>
        </div>
      </div>
    </ConfigProvider>
  );
};

// ---- 保留原有视觉的样式常量 ----

const pageStyle: React.CSSProperties = {
  minHeight: 'calc(100vh - 70px)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '2rem 1rem',
  background: '#f5f5f5',
};

const cardStyle: React.CSSProperties = {
  background: '#fff',
  borderRadius: 16,
  padding: '2.5rem 2rem',
  width: '100%',
  maxWidth: 520,
  boxShadow: '0 4px 16px rgba(0,0,0,0.12)',
};

const successIconStyle: React.CSSProperties = {
  width: 60,
  height: 60,
  background: '#00a854',
  borderRadius: '50%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: 'white',
  fontSize: '1.8rem',
  fontWeight: 'bold',
  margin: '0 auto 1.25rem',
};

export default LoginPage;
