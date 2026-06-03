import React, { useEffect, useState } from 'react';
import {
  Table, Button, Space, Switch, Modal, Form, Input, InputNumber,
  ColorPicker, Typography, Tooltip, Popconfirm, message, Tag,
} from 'antd';
import {
  PlusOutlined, EditOutlined, DeleteOutlined,
  ArrowUpOutlined, ArrowDownOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { majorApi } from '../../../api';
import type { MajorCategory } from '../../../types';

// ============================================================
// 专业分类管理
// ============================================================

const { Title } = Typography;

const MajorCategoryPage: React.FC = () => {
  const [data, setData] = useState<MajorCategory[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editRecord, setEditRecord] = useState<MajorCategory | null>(null);
  const [form] = Form.useForm();

  const fetchData = async () => {
    setLoading(true);
    const list = await majorApi.list();
    setData(list.sort((a, b) => a.sortOrder - b.sortOrder));
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const openCreate = () => {
    setEditRecord(null);
    form.resetFields();
    form.setFieldsValue({ sortOrder: data.length + 1, isVisible: true, iconBgColor: '#1677ff' });
    setModalVisible(true);
  };

  const openEdit = (record: MajorCategory) => {
    setEditRecord(record);
    form.setFieldsValue(record);
    setModalVisible(true);
  };

  const handleDelete = async (id: number) => {
    await majorApi.remove(id);
    message.success('已删除');
    window.dispatchEvent(new CustomEvent('major-data-changed'));
    fetchData();
  };

  const handleSave = async () => {
    const values = await form.validateFields();
    // ColorPicker 返回的可能是对象，需转成 hex 字符串
    if (values.iconBgColor && typeof values.iconBgColor !== 'string') {
      values.iconBgColor = values.iconBgColor.toHexString?.() || '#1677ff';
    }
    if (editRecord) {
      await majorApi.update(editRecord.id, values);
      message.success('更新成功');
    } else {
      await majorApi.create(values);
      message.success('新增成功');
    }
    setModalVisible(false);
    window.dispatchEvent(new CustomEvent('major-data-changed'));
    fetchData();
  };

  const handleMove = async (index: number, dir: 'up' | 'down') => {
    const newData = [...data];
    const target = dir === 'up' ? index - 1 : index + 1;
    if (target < 0 || target >= newData.length) return;
    [newData[index], newData[target]] = [newData[target], newData[index]];
    const updated = newData.map((item, idx) => ({ ...item, sortOrder: idx + 1 }));
    setData(updated);
    for (const item of updated) {
      await majorApi.update(item.id, { sortOrder: item.sortOrder });
    }
    window.dispatchEvent(new CustomEvent('major-data-changed'));
    message.success('排序已更新');
  };

  const columns: ColumnsType<MajorCategory> = [
    {
      title: '图标预览',
      key: 'icon',
      width: 80,
      render: (_, record) => (
        <div style={{
          width: 36, height: 36, borderRadius: 8,
          background: record.iconBgColor || '#1677ff',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: '#fff', fontSize: 14, fontWeight: 700,
        }}>
          {record.iconText || '?'}
        </div>
      ),
    },
    { title: '名称', dataIndex: 'name', key: 'name', width: 120 },
    { title: '一句话说专业', dataIndex: 'description', key: 'description', ellipsis: true },
    {
      title: 'Slug',
      dataIndex: 'slug',
      key: 'slug',
      width: 120,
      render: (v: string) => <code>{v}</code>,
    },
    { title: '排序', dataIndex: 'sortOrder', key: 'sortOrder', width: 70, align: 'center' },
    {
      title: '状态',
      dataIndex: 'isVisible',
      key: 'isVisible',
      width: 80,
      render: (v: boolean, record) => (
        <Switch size="small" checked={v} onChange={async (checked) => {
          await majorApi.update(record.id, { isVisible: checked });
          window.dispatchEvent(new CustomEvent('major-data-changed'));
          fetchData();
        }} />
      ),
    },
    {
      title: '操作',
      key: 'action',
      width: 160,
      render: (_, record, index) => (
        <Space>
          <Button type="text" size="small" icon={<ArrowUpOutlined />} onClick={() => handleMove(index, 'up')} disabled={index === 0} />
          <Button type="text" size="small" icon={<ArrowDownOutlined />} onClick={() => handleMove(index, 'down')} disabled={index === data.length - 1} />
          <Button type="text" size="small" icon={<EditOutlined />} onClick={() => openEdit(record)} />
          <Popconfirm title="确认删除？" onConfirm={() => handleDelete(record.id)}>
            <Button type="text" size="small" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div className="page-card">
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <Title level={5} style={{ margin: 0 }}>专业分类管理</Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>新增专业</Button>
      </div>

      <Table
        rowKey="id"
        dataSource={data}
        columns={columns}
        loading={loading}
        pagination={false}
        locale={{ emptyText: '暂无专业数据' }}
      />

      <Modal
        title={editRecord ? '编辑专业' : '新增专业'}
        open={modalVisible}
        onOk={handleSave}
        onCancel={() => setModalVisible(false)}
        destroyOnClose
        width={540}
      >
        <Form form={form} layout="vertical">
          <Form.Item name="name" label="专业名称" rules={[{ required: true }]}>
            <Input placeholder="如：法学" />
          </Form.Item>
          <Form.Item
            name="slug"
            label="Slug 标识"
            rules={[
              { required: true },
              { pattern: /^[a-z0-9]+$/, message: '只能使用小写字母和数字，不允许连字符/下划线' },
            ]}
            extra="示例：law、economics2024（只允许小写字母+数字）"
          >
            <Input placeholder="law" />
          </Form.Item>
          <Form.Item name="description" label="一句话说专业">
            <Input.TextArea rows={2} placeholder="一句话简介" />
          </Form.Item>
          <Form.Item name="iconText" label="图标文字">
            <Input maxLength={4} placeholder="2~4 个字符，显示在图标上" />
          </Form.Item>
          <Form.Item name="iconBgColor" label="图标背景色">
            <ColorPicker format="hex" />
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

export default MajorCategoryPage;
