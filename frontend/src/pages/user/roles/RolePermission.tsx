import React, { useEffect, useState } from 'react';
import {
  Row, Col, Card, Table, Button, Checkbox, Space, Tag, Modal, Form, Input, Switch,
  Typography, Tooltip, Popconfirm, message, Empty,
} from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { roleApi } from '../../../api';
import { mockPermissions, RESOURCES, ACTIONS } from '../../../mock';
import type { Role, Permission } from '../../../types';

// ============================================================
// 角色与权限管理（左右双栏布局）
// ============================================================

const { Title, Text } = Typography;

const RESOURCE_LABELS: Record<string, string> = {
  dashboard: '仪表盘',
  member: '注册用户',
  admin: '管理员',
  role: '角色权限',
  carousel: '轮播图',
  major: '专业分类',
  video: '视频',
  siteSettings: '网站设置',
  navMenu: '导航菜单',
  footer: '页脚',
};

const ACTION_LABELS: Record<string, string> = {
  read: '查看',
  write: '编辑',
  delete: '删除',
};

const RolePermission: React.FC = () => {
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [editRole, setEditRole] = useState<Role | null>(null);
  const [form] = Form.useForm();
  // 权限矩阵本地编辑状态
  const [permMatrix, setPermMatrix] = useState<Record<string, Record<string, boolean>>>({});

  const fetchRoles = async () => {
    setLoading(true);
    const list = await roleApi.list();
    setRoles(list);
    if (list.length > 0 && !selectedRole) setSelectedRole(list[0]);
    setLoading(false);
  };

  useEffect(() => { fetchRoles(); }, []);

  // 当选中角色变化时，刷新权限矩阵
  useEffect(() => {
    if (selectedRole) {
      const matrix: Record<string, Record<string, boolean>> = {};
      RESOURCES.forEach((res) => {
        matrix[res] = {};
        ACTIONS.forEach((act) => {
          matrix[res][act] = selectedRole.permissions.some(
            (p) => p.resource === res && p.action === act
          );
        });
      });
      setPermMatrix(matrix);
    }
  }, [selectedRole]);

  const handlePermChange = async (resource: string, action: string, checked: boolean) => {
    if (!selectedRole || selectedRole.isPreset) return;
    const newMatrix = {
      ...permMatrix,
      [resource]: { ...permMatrix[resource], [action]: checked },
    };
    setPermMatrix(newMatrix);

    // 构建新权限列表并保存
    const newPermissions: Permission[] = mockPermissions.filter(
      (p) => newMatrix[p.resource]?.[p.action]
    );
    await roleApi.update(selectedRole.id, { permissions: newPermissions });
    message.success('权限已更新');
    // 刷新角色数据
    const list = await roleApi.list();
    setRoles(list);
    const updated = list.find((r) => r.id === selectedRole.id);
    if (updated) setSelectedRole(updated);
  };

  const openCreate = () => {
    setEditRole(null);
    form.resetFields();
    setModalVisible(true);
  };

  const openEdit = (role: Role) => {
    setEditRole(role);
    form.setFieldsValue({ name: role.name, slug: role.slug });
    setModalVisible(true);
  };

  const handleSave = async () => {
    const values = await form.validateFields();
    if (editRole) {
      await roleApi.update(editRole.id, values);
      message.success('更新成功');
    } else {
      await roleApi.create({ ...values, isPreset: false, permissions: [] });
      message.success('新增成功');
    }
    setModalVisible(false);
    fetchRoles();
  };

  const handleDelete = async (id: number) => {
    await roleApi.remove(id);
    message.success('已删除');
    setSelectedRole(null);
    fetchRoles();
  };

  const roleColumns: ColumnsType<Role> = [
    { title: '角色名', dataIndex: 'name', key: 'name' },
    { title: 'Slug', dataIndex: 'slug', key: 'slug', render: (v) => <code>{v}</code> },
    {
      title: '预设',
      dataIndex: 'isPreset',
      key: 'isPreset',
      render: (v: boolean) => v ? <Tag color="gold">系统</Tag> : <Tag>自定义</Tag>,
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Space>
          <Button type="text" size="small" icon={<EditOutlined />} onClick={() => openEdit(record)} />
          {!record.isPreset && (
            <Popconfirm title="确认删除？" onConfirm={() => handleDelete(record.id)}>
              <Button type="text" size="small" danger icon={<DeleteOutlined />} />
            </Popconfirm>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div>
      <Row gutter={16}>
        {/* 左栏：角色列表 */}
        <Col xs={24} md={10} lg={8}>
          <Card
            title="角色列表"
            extra={<Button type="primary" size="small" icon={<PlusOutlined />} onClick={openCreate}>新增</Button>}
            bordered={false}
            style={{ borderRadius: 8 }}
          >
            <Table
              rowKey="id"
              dataSource={roles}
              columns={roleColumns}
              loading={loading}
              size="small"
              pagination={false}
              rowClassName={(r) => r.id === selectedRole?.id ? 'ant-table-row-selected' : ''}
              onRow={(record) => ({
                onClick: () => setSelectedRole(record),
                style: { cursor: 'pointer' },
              })}
              locale={{ emptyText: '暂无角色' }}
            />
          </Card>
        </Col>

        {/* 右栏：权限矩阵 */}
        <Col xs={24} md={14} lg={16}>
          <Card
            title={
              selectedRole ? (
                <span>权限矩阵 — <Tag color="blue">{selectedRole.name}</Tag>
                  {selectedRole.isPreset && <Tag color="gold" style={{ marginLeft: 4 }}>系统角色（只读）</Tag>}
                </span>
              ) : '权限矩阵（选择左侧角色）'
            }
            bordered={false}
            style={{ borderRadius: 8 }}
          >
            {selectedRole ? (
              <Table
                rowKey="resource"
                dataSource={RESOURCES.map((res) => {
                  const row: Record<string, unknown> = { resource: res };
                  ACTIONS.forEach((act) => { row[act] = permMatrix[res]?.[act] || false; });
                  return row;
                })}
                columns={[
                  {
                    title: '资源',
                    dataIndex: 'resource',
                    key: 'resource',
                    render: (res: string) => <Text>{RESOURCE_LABELS[res] || res}</Text>,
                  },
                  ...ACTIONS.map((act) => ({
                    title: ACTION_LABELS[act],
                    key: act,
                    align: 'center' as const,
                    width: 90,
                    render: (_: unknown, record: Record<string, unknown>) => (
                      <Checkbox
                        checked={!!record[act]}
                        disabled={selectedRole.isPreset}
                        onChange={(e) => handlePermChange(record.resource as string, act, e.target.checked)}
                      />
                    ),
                  })),
                ]}
                pagination={false}
                size="small"
              />
            ) : (
              <Empty description="请先在左侧选择一个角色" />
            )}
          </Card>
        </Col>
      </Row>

      {/* 新增/编辑角色 Modal */}
      <Modal
        title={editRole ? '编辑角色' : '新增角色'}
        open={modalVisible}
        onOk={handleSave}
        onCancel={() => setModalVisible(false)}
        destroyOnClose
      >
        <Form form={form} layout="vertical">
          <Form.Item name="name" label="角色名称" rules={[{ required: true, message: '请输入角色名称' }]}>
            <Input placeholder="如：内容编辑" />
          </Form.Item>
          <Form.Item
            name="slug"
            label="标识 Slug"
            rules={[
              { required: true, message: '请输入 Slug' },
              { pattern: /^[a-z0-9]+$/, message: '只能使用小写字母和数字' },
            ]}
          >
            <Input placeholder="如：editor（只能小写字母+数字）" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default RolePermission;
