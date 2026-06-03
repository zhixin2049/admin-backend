import React, { useEffect, useState } from 'react';
import {
  Table, Button, Space, Switch, Modal, Form, Input, InputNumber,
  Typography, Popconfirm, message,
} from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { footerApi } from '../../../api';
import type { FooterItem } from '../../../types';

// ============================================================
// 页脚信息管理
// ============================================================

const { Title } = Typography;

const FooterManage: React.FC = () => {
  const [data, setData] = useState<FooterItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editRecord, setEditRecord] = useState<FooterItem | null>(null);
  const [form] = Form.useForm();

  const fetchData = async () => {
    setLoading(true);
    const list = await footerApi.list();
    setData(list.sort((a, b) => a.sortOrder - b.sortOrder));
    setLoading(false);
  };

  useEffect(() => {
    // 首次加载时如果 localStorage 无数据，写入默认页脚
    const existing = localStorage.getItem('mock_footer_items');
    if (!existing || JSON.parse(existing).length === 0) {
      const defaults: FooterItem[] = [
        { id: 1, content: '联系站长：18521031173', sortOrder: 1, isVisible: true, createdAt: new Date().toISOString() },
        { id: 2, content: '©2026复现本', sortOrder: 2, isVisible: true, createdAt: new Date().toISOString() },
        { id: 3, content: '沪ICP备19026706号-6', sortOrder: 3, isVisible: true, createdAt: new Date().toISOString() },
      ];
      localStorage.setItem('mock_footer_items', JSON.stringify(defaults));
    }
    fetchData();
  }, []);

  const openCreate = () => {
    setEditRecord(null);
    form.resetFields();
    form.setFieldsValue({ sortOrder: data.length + 1, isVisible: true });
    setModalVisible(true);
  };

  const openEdit = (record: FooterItem) => {
    setEditRecord(record);
    form.setFieldsValue(record);
    setModalVisible(true);
  };

  const handleSave = async () => {
    const values = await form.validateFields();
    if (editRecord) {
      await footerApi.update(editRecord.id, values);
      message.success('更新成功');
    } else {
      await footerApi.create(values);
      message.success('新增成功');
    }
    setModalVisible(false);
    fetchData();
  };

  const columns: ColumnsType<FooterItem> = [
    { title: '页脚文字内容', dataIndex: 'content', key: 'content', ellipsis: true },
    { title: '排序', dataIndex: 'sortOrder', key: 'sortOrder', width: 80, align: 'center' },
    {
      title: '状态',
      dataIndex: 'isVisible',
      key: 'isVisible',
      width: 90,
      render: (v: boolean, record) => (
        <Switch size="small" checked={v} onChange={async (checked) => {
          await footerApi.update(record.id, { isVisible: checked });
          fetchData();
        }} />
      ),
    },
    {
      title: '操作',
      key: 'action',
      width: 120,
      render: (_, record) => (
        <Space>
          <Button type="text" icon={<EditOutlined />} onClick={() => openEdit(record)} />
          <Popconfirm title="确认删除？" onConfirm={async () => { await footerApi.remove(record.id); fetchData(); }}>
            <Button type="text" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div className="page-card">
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <Title level={5} style={{ margin: 0 }}>页脚信息管理</Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>新增页脚项</Button>
      </div>

      <Table
        rowKey="id"
        dataSource={data}
        columns={columns}
        loading={loading}
        pagination={false}
        locale={{ emptyText: '暂无页脚数据' }}
      />

      <Modal
        title={editRecord ? '编辑页脚' : '新增页脚'}
        open={modalVisible}
        onOk={handleSave}
        onCancel={() => setModalVisible(false)}
        destroyOnClose
      >
        <Form form={form} layout="vertical">
          <Form.Item name="content" label="文字内容" rules={[{ required: true, message: '请输入内容' }]}>
            <Input placeholder="如：© 2024 版权所有" />
          </Form.Item>
          <Form.Item name="sortOrder" label="排序序号">
            <InputNumber min={1} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="isVisible" label="是否显示" valuePropName="checked">
            <Switch checkedChildren="显示" unCheckedChildren="隐藏" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default FooterManage;
