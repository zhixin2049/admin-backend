import React, { useEffect, useState } from 'react';
import {
  Table, Button, Space, Tag, Modal, Form, Input, Select,
  Typography, Tooltip, message, Popconfirm,
} from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { adminApi, roleApi } from '../../../api';
import type { Admin, Role } from '../../../types';

// ============================================================
// 管理员账号管理
// ============================================================

const { Title } = Typography;

const AdminList: React.FC = () => {
  const [data, setData] = useState<Admin[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [modalVisible, setModalVisible] = useState(false);
  const [editRecord, setEditRecord] = useState<Admin | null>(null);
  const [form] = Form.useForm();

  const fetchData = async () => {
    setLoading(true);
    try {
      const [r, rList] = await Promise.all([
        adminApi.list({ page, pageSize: 10 }),
        roleApi.list(),
      ]);
      setData(r.list);
      setTotal(r.total);
      setRoles(rList);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [page]);

  const openCreate = () => {
    setEditRecord(null);
    form.resetFields();
    setModalVisible(true);
  };

  const openEdit = (record: Admin) => {
    setEditRecord(record);
    form.setFieldsValue({ ...record, password: '' });
    setModalVisible(true);
  };

  const handleDelete = async (id: number) => {
    await adminApi.remove(id);
    message.success('已删除');
    fetchData();
  };

  const handleSave = async () => {
    const values = await form.validateFields();
    if (editRecord) {
      await adminApi.update(editRecord.id, values);
      message.success('更新成功');
    } else {
      await adminApi.create(values);
      message.success('新增成功');
    }
    setModalVisible(false);
    fetchData();
  };

  const columns: ColumnsType<Admin> = [
    { title: '管理员名', dataIndex: 'username', key: 'username' },
    { title: '邮箱', dataIndex: 'email', key: 'email' },
    {
      title: '角色',
      dataIndex: 'roleName',
      key: 'roleName',
      render: (v: string) => <Tag color="blue">{v || '-'}</Tag>,
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (v: 0 | 1) => <Tag color={v === 1 ? 'green' : 'red'}>{v === 1 ? '启用' : '禁用'}</Tag>,
    },
    {
      title: '最后登录',
      dataIndex: 'lastLoginAt',
      key: 'lastLoginAt',
      render: (v: string) => v ? new Date(v).toLocaleString('zh-CN') : '-',
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Space>
          <Tooltip title="编辑">
            <Button type="text" icon={<EditOutlined />} onClick={() => openEdit(record)} />
          </Tooltip>
          <Popconfirm title="确认删除？" onConfirm={() => handleDelete(record.id)}>
            <Tooltip title="删除">
              <Button type="text" danger icon={<DeleteOutlined />} />
            </Tooltip>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div className="page-card">
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <Title level={5} style={{ margin: 0 }}>管理员账号管理</Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>新增管理员</Button>
      </div>

      <Table
        rowKey="id"
        dataSource={data}
        columns={columns}
        loading={loading}
        pagination={{ current: page, total, showTotal: (t) => `共 ${t} 条`, onChange: setPage }}
        locale={{ emptyText: '暂无管理员数据' }}
      />

      <Modal
        title={editRecord ? '编辑管理员' : '新增管理员'}
        open={modalVisible}
        onOk={handleSave}
        onCancel={() => setModalVisible(false)}
        destroyOnClose
      >
        <Form form={form} layout="vertical">
          <Form.Item name="username" label="账号名" rules={[{ required: true, message: '请输入账号名' }]}>
            <Input placeholder="账号名" />
          </Form.Item>
          <Form.Item name="email" label="邮箱" rules={[{ type: 'email', message: '邮箱格式不正确' }, { required: true }]}>
            <Input placeholder="邮箱" />
          </Form.Item>
          <Form.Item
            name="password"
            label="密码"
            rules={editRecord ? [] : [{ required: true, message: '请输入密码' }, { min: 6, message: '至少6位' }]}
          >
            <Input.Password placeholder={editRecord ? '不修改请留空' : '请输入密码'} />
          </Form.Item>
          <Form.Item name="roleId" label="角色" rules={[{ required: true, message: '请选择角色' }]}>
            <Select
              options={roles.map((r) => ({ value: r.id, label: r.name }))}
              placeholder="选择角色"
            />
          </Form.Item>
          <Form.Item name="status" label="状态" initialValue={1}>
            <Select options={[{ value: 1, label: '启用' }, { value: 0, label: '禁用' }]} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default AdminList;
