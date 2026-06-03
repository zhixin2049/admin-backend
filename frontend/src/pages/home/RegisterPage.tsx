import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Form, Input, Button, Select, Radio, Checkbox, Typography, ConfigProvider } from 'antd';
import Navbar from '../../components/home/Navbar';
import { memberApi } from '../../api';

const { Text } = Typography;

// ============================================================
// 省份数据
// ============================================================

const PROVINCES = [
  '北京', '天津', '河北', '山西', '内蒙古',
  '辽宁', '吉林', '黑龙江',
  '上海', '江苏', '浙江', '安徽', '福建', '江西', '山东',
  '河南', '湖北', '湖南', '广东', '广西', '海南',
  '重庆', '四川', '贵州', '云南', '西藏',
  '陕西', '甘肃', '青海', '宁夏', '新疆',
];

// ============================================================
// 注册页面 — antd Form 重构
// ============================================================

const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [agreed, setAgreed] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [username, setUsername] = useState('');

  const handleSubmit = async (values: Record<string, string>) => {
    if (!agreed) return;
    setSubmitError('');
    setSubmitting(true);
    try {
      await memberApi.create({
        username: values.username,
        password: values.password,
        phone: values.phone,
        gender: values.gender === 'male' ? 1 : 2,
        province: values.province,
      });
      setUsername(values.username);
      setSubmitted(true);
    } catch (err: unknown) {
      setSubmitError(err instanceof Error ? err.message : '注册失败，请重试');
    } finally {
      setSubmitting(false);
    }
  };

  // ---- 注册成功 ----
  if (submitted) {
    return (
      <ConfigProvider theme={{ token: { colorPrimary: '#00a854' } }}>
        <Navbar />
        <div style={pageStyle}>
          <div style={cardStyle}>
            <div style={{ textAlign: 'center' }}>
              <div style={successIconStyle}>&#10003;</div>
              <h2 style={{ fontSize: '1.5rem', color: '#333', marginBottom: '0.5rem' }}>注册成功！</h2>
              <p style={{ color: '#666', fontSize: '0.95rem' }}>
                欢迎加入高考志愿指南，您的账号 <strong>{username}</strong> 已创建。
              </p>
              <Button type="primary" block size="large" style={{ marginTop: '1rem' }} onClick={() => navigate('/login')}>
                前往登录
              </Button>
            </div>
          </div>
        </div>
      </ConfigProvider>
    );
  }

  // ---- 注册表单 ----
  return (
    <ConfigProvider theme={{ token: { colorPrimary: '#00a854', borderRadius: 8 } }}>
      <Navbar />
      <div style={pageStyle}>
        <div style={cardStyle}>
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 700, color: '#333', marginBottom: '0.5rem' }}>创建账号</h1>
            <p style={{ color: '#666', fontSize: '0.95rem' }}>
              已有账号？<a href="/login" style={{ color: '#00a854', textDecoration: 'none', fontWeight: 500 }}>立即登录</a>
            </p>
          </div>

          <Form form={form} layout="vertical" size="large" onFinish={handleSubmit}>
            <Form.Item
              name="username"
              label="账号名称"
              rules={[
                { required: true, message: '请输入账号名称' },
                { pattern: /^[a-zA-Z0-9]{6,18}$/, message: '账号名称须为6~18位数字或字母（或两者组合）' },
              ]}
            >
              <Input placeholder="6~18位数字或字母" autoComplete="username" />
            </Form.Item>

            <Form.Item
              name="password"
              label="账号密码"
              rules={[
                { required: true, message: '请输入账号密码' },
                {
                  pattern: /^(?=.*[0-9])(?=.*[a-zA-Z])[a-zA-Z0-9]{6,12}$/,
                  message: '账号密码须为6~12位数字和字母组合，且至少包含一个数字和一个字母',
                },
              ]}
            >
              <Input.Password placeholder="请输入密码" autoComplete="new-password" />
            </Form.Item>

            <Form.Item
              name="phone"
              label="手机号码"
              rules={[
                { required: true, message: '请输入手机号码' },
                { pattern: /^1[3-9]\d{9}$/, message: '手机号码格式不正确' },
              ]}
            >
              <Input placeholder="请输入手机号码" autoComplete="tel" />
            </Form.Item>

            <Form.Item
              name="gender"
              label="用户性别"
              rules={[{ required: true, message: '请选择用户性别' }]}
            >
              <Radio.Group>
                <Radio value="male">男</Radio>
                <Radio value="female">女</Radio>
              </Radio.Group>
            </Form.Item>

            <Form.Item
              name="province"
              label="所在省份"
              rules={[{ required: true, message: '请选择所在省份' }]}
            >
              <Select placeholder="请选择省份" options={PROVINCES.map((p) => ({ value: p, label: p }))} />
            </Form.Item>

            <Form.Item>
              <Checkbox checked={agreed} onChange={(e) => setAgreed(e.target.checked)}>
                我已阅读并同意<a href="#" target="_blank" style={{ color: '#00a854', textDecoration: 'none', fontWeight: 500 }}>《用户注册协议》</a>
              </Checkbox>
            </Form.Item>

            {submitError && (
              <div style={{ textAlign: 'center', marginBottom: 16 }}>
                <Text type="danger">{submitError}</Text>
              </div>
            )}

            <Form.Item>
              <Button type="primary" htmlType="submit" loading={submitting} disabled={!agreed} block>
                注 册
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

export default RegisterPage;
