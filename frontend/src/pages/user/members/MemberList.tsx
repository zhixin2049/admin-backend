import React, { useEffect, useState } from 'react';
import {
  Table, Button, Input, Space, Tag, Switch, Modal, Form, Select,
  Typography, Tooltip, message, Descriptions,
} from 'antd';
import { SearchOutlined, EyeOutlined, EditOutlined, PlusOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { memberApi } from '../../../api';
import type { Member } from '../../../types';

// ============================================================
// 注册用户管理
// ============================================================

const { Title } = Typography;

const PROVINCES = [
  '北京', '天津', '河北', '山西', '内蒙古',
  '辽宁', '吉林', '黑龙江',
  '上海', '江苏', '浙江', '安徽', '福建', '江西', '山东',
  '河南', '湖北', '湖南', '广东', '广西', '海南',
  '重庆', '四川', '贵州', '云南', '西藏',
  '陕西', '甘肃', '青海', '宁夏', '新疆',
];

const MemberList: React.FC = () => {
  const [data, setData] = useState<Member[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [keyword, setKeyword] = useState('');
  const [editVisible, setEditVisible] = useState(false);
  const [detailVisible, setDetailVisible] = useState(false);
  const [createVisible, setCreateVisible] = useState(false);
  const [current, setCurrent] = useState<Member | null>(null);
  const [form] = Form.useForm();
  const [createForm] = Form.useForm();

  const fetchData = async () => {
    setLoading(true);
    try {
      const result = await memberApi.list({ page, pageSize, keyword: keyword || undefined });
      setData(result.list);
      setTotal(result.total);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [page, keyword]);

  const handleToggle = async (record: Member, checked: boolean) => {
    await memberApi.toggleStatus(record.id, checked ? 1 : 0);
    message.success('状态已更新');
    fetchData();
  };

  const handleEdit = (record: Member) => {
    setCurrent(record);
    form.setFieldsValue({
      phone: record.phone,
      gender: record.gender,
      province: record.province,
      status: record.status,
    });
    setEditVisible(true);
  };

  const handleDetail = (record: Member) => {
    setCurrent(record);
    setDetailVisible(true);
  };

  const handleSave = async () => {
    const values = await form.validateFields();
    if (current) {
      // 提取密码字段，密码为空则不修改
      const { password, ...rest } = values;
      const updateData: Partial<Member> & { password?: string } = { ...rest };
      if (password && password.trim()) {
        updateData.password = password;
      }
      await memberApi.update(current.id, updateData);
      message.success('保存成功');
      setEditVisible(false);
      fetchData();
    }
  };

  // ---- 新增用户 ----
  const handleCreate = async () => {
    try {
      const values = await createForm.validateFields();
      await memberApi.create({
        username: values.username,
        password: values.password,
        phone: values.phone,
        gender: values.gender ?? 0,
        province: values.province,
        status: values.status ?? 1,
      });
      message.success('用户创建成功');
      setCreateVisible(false);
      createForm.resetFields();
      setPage(1);
      fetchData();
    } catch (err: unknown) {
      if (err instanceof Error) {
        message.error(err.message);
      }
    }
  };

  const columns: ColumnsType<Member> = [
    { title: '账号名称', dataIndex: 'username', key: 'username', width: 120 },
    { title: '手机号码', dataIndex: 'phone', key: 'phone', width: 130 },
    {
      title: '用户性别',
      dataIndex: 'gender',
      key: 'gender',
      width: 70,
      render: (v: number) => ({ 1: '男', 2: '女' } as Record<number, string>)[v] || '-',
    },
    { title: '所在省份', dataIndex: 'province', key: 'province', width: 90 },
    { title: '注册时间', dataIndex: 'registeredAt', key: 'registeredAt', width: 160, render: (v: string) => v ? new Date(v).toLocaleString('zh-CN') : '-' },
    { title: '最后登录', dataIndex: 'lastLoginAt', key: 'lastLoginAt', width: 160, render: (v: string) => v ? new Date(v).toLocaleString('zh-CN') : '-' },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 90,
      render: (v: 0 | 1, record) => (
        <Switch
          size="small"
          checked={v === 1}
          onChange={(checked) => handleToggle(record, checked)}
          checkedChildren="启用"
          unCheckedChildren="禁用"
        />
      ),
    },
    {
      title: '操作',
      key: 'action',
      fixed: 'right',
      width: 120,
      render: (_, record) => (
        <Space>
          <Tooltip title="详情">
            <Button type="text" icon={<EyeOutlined />} onClick={() => handleDetail(record)} />
          </Tooltip>
          <Tooltip title="编辑">
            <Button type="text" icon={<EditOutlined />} onClick={() => handleEdit(record)} />
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <div className="page-card">
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <Space>
          <Title level={5} style={{ margin: 0 }}>注册用户管理</Title>
          <Button type="primary" icon={<PlusOutlined />} onClick={() => { createForm.resetFields(); setCreateVisible(true); }}>
            新增用户
          </Button>
        </Space>
        <Input
          prefix={<SearchOutlined />}
          placeholder="搜索账号名称或手机号码"
          allowClear
          style={{ width: 260 }}
          onPressEnter={(e) => { setKeyword((e.target as HTMLInputElement).value); setPage(1); }}
          onChange={(e) => { if (!e.target.value) { setKeyword(''); setPage(1); } }}
        />
      </div>

      <Table
        rowKey="id"
        dataSource={data}
        columns={columns}
        loading={loading}
        scroll={{ x: 1000 }}
        pagination={{
          current: page,
          pageSize,
          total,
          showTotal: (t) => `共 ${t} 条`,
          onChange: setPage,
        }}
        locale={{ emptyText: '暂无用户数据' }}
      />

      {/* 新增用户弹窗 */}
      <Modal
        title="新增用户"
        open={createVisible}
        onOk={handleCreate}
        onCancel={() => setCreateVisible(false)}
        destroyOnClose
        okText="创建"
        cancelText="取消"
      >
        <Form form={createForm} layout="vertical" preserve={false}>
          <Form.Item
            name="username"
            label="账号名称"
            rules={[
              { required: true, message: '请输入账号名称' },
              { pattern: /^[a-zA-Z0-9]{6,18}$/, message: '账号名称须为6~18位数字或字母（或两者组合）' },
            ]}
          >
            <Input placeholder="6~18位数字或字母" maxLength={18} />
          </Form.Item>

          <Form.Item
            name="password"
            label="账号密码"
            rules={[
              { required: true, message: '请输入账号密码' },
              { pattern: /^(?=.*[0-9])(?=.*[a-zA-Z])[a-zA-Z0-9]{6,12}$/, message: '账号密码须为6~12位数字和字母组合，且至少包含一个数字和一个字母' },
            ]}
          >
            <Input.Password placeholder="6~12位数字和字母组合" maxLength={12} />
          </Form.Item>

          <Form.Item
            name="phone"
            label="手机号码"
            rules={[
              { required: true, message: '请输入手机号码' },
              { pattern: /^1[3-9]\d{9}$/, message: '手机号码格式不正确' },
            ]}
          >
            <Input placeholder="请输入手机号码" maxLength={11} />
          </Form.Item>

          <Form.Item
            name="gender"
            label="用户性别"
            rules={[{ required: true, message: '请选择用户性别' }]}
          >
            <Select
              placeholder="请选择用户性别"
              options={[
                { value: 1, label: '男' },
                { value: 2, label: '女' },
              ]}
            />
          </Form.Item>

          <Form.Item
            name="province"
            label="所在省份"
            rules={[{ required: true, message: '请选择所在省份' }]}
          >
            <Select
              placeholder="请选择所在省份"
              showSearch
              options={PROVINCES.map((p) => ({ value: p, label: p }))}
            />
          </Form.Item>

          <Form.Item
            name="status"
            label="状态"
            initialValue={1}
          >
            <Select
              options={[
                { value: 1, label: '启用' },
                { value: 0, label: '禁用' },
              ]}
            />
          </Form.Item>
        </Form>
      </Modal>

      {/* 编辑弹窗 */}
      <Modal
        title="编辑用户"
        open={editVisible}
        onOk={handleSave}
        onCancel={() => setEditVisible(false)}
        destroyOnClose
      >
        <Form form={form} layout="vertical">
          <Form.Item name="phone" label="手机号码" rules={[{ pattern: /^1\d{10}$/, message: '手机号码格式不正确' }]}>
            <Input placeholder="请输入手机号码" />
          </Form.Item>
          <Form.Item name="password" label="账号密码">
            <Input.Password placeholder="不修改密码留空" />
          </Form.Item>
          <Form.Item name="gender" label="用户性别">
            <Select options={[{ value: 1, label: '男' }, { value: 2, label: '女' }]} />
          </Form.Item>
          <Form.Item name="province" label="所在省份">
            <Select options={PROVINCES.map((p) => ({ value: p, label: p }))} />
          </Form.Item>
          <Form.Item name="status" label="状态">
            <Select options={[{ value: 1, label: '启用' }, { value: 0, label: '禁用' }]} />
          </Form.Item>
        </Form>
      </Modal>

      {/* 详情弹窗 */}
      <Modal
        title="用户详情"
        open={detailVisible}
        footer={null}
        onCancel={() => setDetailVisible(false)}
      >
        {current && (
          <Descriptions column={1} size="small" bordered>
            <Descriptions.Item label="账号名称">{current.username}</Descriptions.Item>
            <Descriptions.Item label="手机号码">{current.phone}</Descriptions.Item>
            <Descriptions.Item label="用户性别">{({ 1: '男', 2: '女' } as Record<number, string>)[current.gender] || '-'}</Descriptions.Item>
            <Descriptions.Item label="所在省份">{current.province}</Descriptions.Item>
            <Descriptions.Item label="注册时间">{current.registeredAt ? new Date(current.registeredAt).toLocaleString('zh-CN') : '-'}</Descriptions.Item>
            <Descriptions.Item label="最后登录">{current.lastLoginAt ? new Date(current.lastLoginAt).toLocaleString('zh-CN') : '-'}</Descriptions.Item>
            <Descriptions.Item label="状态"><Tag color={current.status === 1 ? 'green' : 'red'}>{current.status === 1 ? '启用' : '禁用'}</Tag></Descriptions.Item>
          </Descriptions>
        )}
      </Modal>
    </div>
  );
};

export default MemberList;
