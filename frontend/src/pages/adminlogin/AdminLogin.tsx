import React, { useState } from 'react';
import { Form, Input, Button, Checkbox, Card, Typography, message, Space } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store';
import { authApi } from '../../api';
import type { LoginForm } from '../../types';

// ============================================================
// 登录页
// ============================================================

const { Title, Text } = Typography;

const Login: React.FC = () => {
  const navigate = useNavigate();
  const { setToken, setAdmin } = useAuthStore();
  const [loading, setLoading] = useState(false);

  const onFinish = async (values: LoginForm) => {
    setLoading(true);
    try {
      const result = await authApi.login(values);
      setToken(result.token);
      setAdmin(result.admin);
      message.success('登录成功，欢迎回来！');
      navigate('/admin/dashboard', { replace: true });
    } catch (err: unknown) {
      message.error(err instanceof Error ? err.message : '登录失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      }}
    >
      <Card
        style={{
          width: 400,
          borderRadius: 16,
          boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
        }}
        styles={{ body: { padding: '40px 40px 32px' } }}
      >
        <Space direction="vertical" style={{ width: '100%', marginBottom: 32 }} align="center">
          <div style={{ fontSize: 40 }}>⚡</div>
          <Title level={3} style={{ margin: 0 }}>管理后台</Title>
          <Text type="secondary">请使用管理员账号登录</Text>
        </Space>

        <Form
          name="login"
          initialValues={{ remember: true, username: 'admin', password: 'admin123' }}
          onFinish={onFinish}
          size="large"
          autoComplete="off"
        >
          <Form.Item
            name="username"
            rules={[{ required: true, message: '请输入账号' }]}
          >
            <Input
              prefix={<UserOutlined />}
              placeholder="账号"
              autoComplete="username"
            />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[{ required: true, message: '请输入密码' }]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="密码"
              autoComplete="current-password"
            />
          </Form.Item>

          <Form.Item>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Form.Item name="remember" valuePropName="checked" noStyle>
                <Checkbox>记住我</Checkbox>
              </Form.Item>
              <Button type="link" style={{ padding: 0 }}>忘记密码？</Button>
            </div>
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              block
              style={{ height: 44, fontSize: 16, borderRadius: 8 }}
            >
              登 录
            </Button>
          </Form.Item>
        </Form>

        <Text type="secondary" style={{ display: 'block', textAlign: 'center', fontSize: 12 }}>
          演示账号：admin / admin123
        </Text>
      </Card>
    </div>
  );
};

export default Login;
