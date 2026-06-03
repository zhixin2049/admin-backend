import React, { useEffect, useState } from 'react';
import { Form, Input, Button, Card, Typography, Divider, message, Space } from 'antd';
import { SaveOutlined } from '@ant-design/icons';
import RichTextEditor from '../../../components/common/RichTextEditor';
import { siteApi } from '../../../api';
import type { SiteSettings } from '../../../types';

// ============================================================
// 网站基础设置
// ============================================================

const { Title } = Typography;

const SiteSettingsPage: React.FC = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setLoading(true);
    siteApi.get().then((data) => {
      form.setFieldsValue(data);
    }).finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    const values = await form.validateFields() as SiteSettings;
    setSaving(true);
    try {
      await siteApi.save(values);
      message.success('保存成功');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="page-card" style={{ maxWidth: 800 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 24 }}>
        <Title level={5} style={{ margin: 0 }}>网站基础设置</Title>
        <Button type="primary" icon={<SaveOutlined />} loading={saving} onClick={handleSave}>
          保存设置
        </Button>
      </div>

      <Form form={form} layout="vertical">
        <Divider plain>基本信息</Divider>
        <Form.Item name="siteName" label="网站名称" rules={[{ required: true, message: '请输入网站名称' }]}>
          <Input placeholder="网站名称" />
        </Form.Item>
        <Form.Item name="siteDescription" label="网站描述">
          <Input.TextArea rows={3} placeholder="网站简介，用于 SEO meta description" />
        </Form.Item>
        <Form.Item name="siteKeywords" label="关键词">
          <Input placeholder="关键词1,关键词2,关键词3（逗号分隔）" />
        </Form.Item>

        <Divider plain>用户注册协议</Divider>
        <Form.Item name="userAgreement" label="注册协议（支持 HTML 富文本）">
          <RichTextEditor placeholder="<h2>用户注册协议</h2><p>请在此输入协议内容...</p>" />
        </Form.Item>
      </Form>
    </div>
  );
};

export default SiteSettingsPage;
