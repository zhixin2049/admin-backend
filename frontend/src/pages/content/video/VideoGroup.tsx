import React, { useEffect, useState } from 'react';
import {
  Table, Button, Space, Switch, Modal, Form, Input, InputNumber,
  Typography, Popconfirm, message,
} from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, ArrowUpOutlined, ArrowDownOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { videoGroupApi } from '../../../api';
import type { VideoGroup } from '../../../types';

// ============================================================
// 视频分组配置
// ============================================================

const { Title } = Typography;

const VideoGroupPage: React.FC = () => {
  const [data, setData] = useState<VideoGroup[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editRecord, setEditRecord] = useState<VideoGroup | null>(null);
  const [form] = Form.useForm();

  const fetchData = async () => {
    setLoading(true);
    const list = await videoGroupApi.list();
    setData(list.sort((a, b) => a.sortOrder - b.sortOrder));
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const openCreate = () => {
    setEditRecord(null);
    form.resetFields();
    form.setFieldsValue({ sortOrder: data.length + 1, isActive: true });
    setModalVisible(true);
  };

  const openEdit = (record: VideoGroup) => {
    setEditRecord(record);
    form.setFieldsValue(record);
    setModalVisible(true);
  };

  const handleSave = async () => {
    const values = await form.validateFields();
    if (editRecord) {
      await videoGroupApi.update(editRecord.id, values);
      message.success('更新成功');
    } else {
      await videoGroupApi.create(values);
      message.success('新增成功');
    }
    setModalVisible(false);
    fetchData();
  };

  const handleMove = async (index: number, dir: 'up' | 'down') => {
    const newData = [...data];
    const target = dir === 'up' ? index - 1 : index + 1;
    if (target < 0 || target >= newData.length) return;
    [newData[index], newData[target]] = [newData[target], newData[index]];
    const updated = newData.map((item, idx) => ({ ...item, sortOrder: idx + 1 }));
    setData(updated);
    for (const item of updated) await videoGroupApi.update(item.id, { sortOrder: item.sortOrder });
    message.success('排序已更新');
  };

  const columns: ColumnsType<VideoGroup> = [
    { title: '分组名称', dataIndex: 'groupName', key: 'groupName' },
    { title: '标识 Key', dataIndex: 'groupKey', key: 'groupKey', render: (v: string) => <code>{v}</code> },
    { title: '更多链接', dataIndex: 'moreUrl', key: 'moreUrl', ellipsis: true },
    { title: '排序', dataIndex: 'sortOrder', key: 'sortOrder', width: 70, align: 'center' },
    {
      title: '状态',
      dataIndex: 'isActive',
      key: 'isActive',
      width: 80,
      render: (v: boolean, record) => (
        <Switch size="small" checked={v} onChange={async (checked) => {
          await videoGroupApi.update(record.id, { isActive: checked });
          fetchData();
        }} />
      ),
    },
    {
      title: '操作',
      key: 'action',
      width: 180,
      render: (_, record, index) => (
        <Space>
          <Button type="text" size="small" icon={<ArrowUpOutlined />} onClick={() => handleMove(index, 'up')} disabled={index === 0} />
          <Button type="text" size="small" icon={<ArrowDownOutlined />} onClick={() => handleMove(index, 'down')} disabled={index === data.length - 1} />
          <Button type="text" size="small" icon={<EditOutlined />} onClick={() => openEdit(record)} />
          <Popconfirm title="确认删除？" onConfirm={async () => { await videoGroupApi.remove(record.id); message.success('已删除'); fetchData(); }}>
            <Button type="text" size="small" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div className="page-card">
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <Title level={5} style={{ margin: 0 }}>视频分组配置</Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>新增分组</Button>
      </div>

      <Table
        rowKey="id"
        dataSource={data}
        columns={columns}
        loading={loading}
        pagination={false}
        locale={{ emptyText: '暂无分组数据' }}
      />

      <Modal
        title={editRecord ? '编辑分组' : '新增分组'}
        open={modalVisible}
        onOk={handleSave}
        onCancel={() => setModalVisible(false)}
        destroyOnClose
      >
        <Form form={form} layout="vertical">
          <Form.Item name="groupName" label="分组名称" rules={[{ required: true }]}>
            <Input placeholder="如：精品推荐" />
          </Form.Item>
          <Form.Item
            name="groupKey"
            label="分组标识"
            rules={[{ required: true }, { pattern: /^[a-z0-9]+$/, message: '只能使用小写字母和数字' }]}
          >
            <Input placeholder="featured（小写字母+数字）" />
          </Form.Item>
          <Form.Item name="moreUrl" label="更多链接">
            <Input placeholder="/videos?group=xxx" />
          </Form.Item>
          <Form.Item name="sortOrder" label="排序序号">
            <InputNumber min={1} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="isActive" label="是否启用" valuePropName="checked">
            <Switch checkedChildren="启用" unCheckedChildren="停用" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default VideoGroupPage;
