import React, { useEffect, useState, useCallback } from 'react';
import {
  Table, Button, Space, Switch, Modal, Input, Select, InputNumber,
  Tag, Typography, Popconfirm, message, TreeSelect, Form,
} from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { navMenuApi } from '../../../api';
import type { NavMenu } from '../../../types';
import { useNavMenuStore } from '../../../store';

const { Title } = Typography;

// ============================================================
// 树形数据构建
// ============================================================

function buildTreeData(menus: NavMenu[]): { title: string; value: number; children?: unknown[] }[] {
  const topLevel = menus.filter((m) => m.parentId === null || m.parentId === undefined || m.parentId === 0);
  return topLevel
    .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))
    .map((m) => ({
      title: m.displayName,
      value: Number(m.id),
      children: buildChildren(menus, Number(m.id)),
    }));
}

function buildChildren(menus: NavMenu[], parentId: number): { title: string; value: number; children?: unknown[] }[] {
  return menus
    .filter((m) => Number(m.parentId) === Number(parentId))
    .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))
    .map((m) => ({
      title: m.displayName,
      value: Number(m.id),
      children: buildChildren(menus, Number(m.id)),
    }));
}

function buildTableTree(menus: NavMenu[]): NavMenu[] {
  const map = new Map<number, NavMenu>();
  const roots: NavMenu[] = [];

  menus.forEach((m) => {
    const normalized: NavMenu = { ...m, children: [] };
    if (normalized.parentId !== null && normalized.parentId !== undefined && normalized.parentId !== 0) {
      normalized.parentId = Number(normalized.parentId);
    } else if (normalized.parentId === 0) {
      normalized.parentId = null;
    }
    map.set(Number(normalized.id), normalized);
  });

  map.forEach((m) => {
    if (m.parentId === null || m.parentId === undefined) {
      roots.push(m);
    } else {
      const parent = map.get(Number(m.parentId));
      if (parent) {
        parent.children!.push(m);
      } else {
        roots.push(m);
      }
    }
  });

  const sort = (items: NavMenu[]) => {
    items.sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
    items.forEach((i) => sort(i.children ?? []));
  };
  sort(roots);

  return roots;
}

// ============================================================
// 组件
// ============================================================
const NavMenuManage: React.FC = () => {
  const [flatData, setFlatData] = useState<NavMenu[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editRecord, setEditRecord] = useState<NavMenu | null>(null);
  const [expandedRowKeys, setExpandedRowKeys] = useState<React.Key[]>([]);
  const { setMenus, upsertMenu, removeMenu: storeRemoveMenu } = useNavMenuStore();
  const [form] = Form.useForm();

  const tableData = buildTableTree(flatData);
  const treeData = buildTreeData(flatData) as unknown as Parameters<typeof TreeSelect>[0]['treeData'];

  const fetchData = useCallback(async () => {
    setLoading(true);
    const list = await navMenuApi.list();
    setFlatData(list);
    setMenus(list);
    setLoading(false);
  }, [setMenus]);

  const handleRebuildData = async () => {
    localStorage.removeItem('mock_nav_menus');
    localStorage.removeItem('navmenu-storage');
    await fetchData();
    message.success('数据已重建');
  };

  useEffect(() => { fetchData(); }, [fetchData]);

  useEffect(() => {
    const keys = tableData
      .filter((m) => (m.children ?? []).length > 0)
      .map((m) => m.id);
    setExpandedRowKeys(keys);
  }, [tableData]);

  const openCreate = (parentId: number | null = null) => {
    setEditRecord(null);
    form.resetFields();
    form.setFieldsValue({
      displayName: '',
      linkType: 'internal',
      linkUrl: '/',
      openNewTab: false,
      sortOrder: 1,
      isVisible: true,
      parentId: parentId ?? undefined,
    });
    setModalVisible(true);
  };

  const openEdit = (record: NavMenu) => {
    setEditRecord(record);
    form.setFieldsValue({
      displayName: record.displayName,
      linkType: record.linkType,
      linkUrl: record.linkUrl,
      openNewTab: record.openNewTab,
      sortOrder: record.sortOrder,
      isVisible: record.isVisible,
      parentId: record.parentId ?? undefined,
    });
    setModalVisible(true);
  };

  const handleSave = async () => {
    const values = await form.validateFields();
    if (values.parentId !== undefined && values.parentId !== null) {
      values.parentId = Number(values.parentId);
    }

    if (editRecord) {
      const updated = await navMenuApi.update(editRecord.id, values);
      upsertMenu(updated);
      message.success('更新成功');
    } else {
      const created = await navMenuApi.create(values as Omit<NavMenu, 'id'>);
      upsertMenu(created);
      message.success('新增成功');
    }
    setModalVisible(false);
    await fetchData();
  };

  const handleRemove = async (id: number) => {
    storeRemoveMenu(id);
    await navMenuApi.remove(id);
    message.success('删除成功');
    await fetchData();
  };

  const columns: ColumnsType<NavMenu> = [
    { title: '菜单名称', dataIndex: 'displayName', key: 'displayName' },
    {
      title: '链接类型',
      dataIndex: 'linkType',
      key: 'linkType',
      width: 100,
      render: (v: string) => <Tag color={v === 'external' ? 'orange' : 'blue'}>{v === 'external' ? '外链' : '内链'}</Tag>,
    },
    { title: '跳转链接', dataIndex: 'linkUrl', key: 'linkUrl', ellipsis: true },
    {
      title: '新开标签',
      dataIndex: 'openNewTab',
      key: 'openNewTab',
      width: 90,
      render: (v: boolean) => v ? <Tag color="cyan">是</Tag> : '-',
    },
    { title: '排序', dataIndex: 'sortOrder', key: 'sortOrder', width: 60, align: 'center' },
    {
      title: '显示',
      dataIndex: 'isVisible',
      key: 'isVisible',
      width: 80,
      render: (v: boolean, record) => (
        <Switch
          size="small"
          checked={v}
          onChange={async (checked) => {
            const updated = await navMenuApi.update(record.id, { isVisible: checked });
            upsertMenu(updated);
            await fetchData();
          }}
        />
      ),
    },
    {
      title: '操作',
      key: 'action',
      width: 160,
      render: (_, record) => (
        <Space>
          <Button type="text" size="small" onClick={() => openCreate(record.id)}>+ 子菜单</Button>
          <Button type="text" size="small" icon={<EditOutlined />} onClick={() => openEdit(record)} />
          <Popconfirm title="确认删除（含子菜单）？" onConfirm={() => handleRemove(record.id)}>
            <Button type="text" size="small" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div className="page-card">
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <Title level={5} style={{ margin: 0 }}>导航菜单管理</Title>
        <Space>
          <Button icon={<EditOutlined />} onClick={handleRebuildData} title="清除 localStorage 脏数据后重建">
            重建数据
          </Button>
          <Button type="primary" icon={<PlusOutlined />} onClick={() => openCreate(null)}>新增顶级菜单</Button>
        </Space>
      </div>

      <Table
        rowKey="id"
        dataSource={tableData}
        columns={columns}
        loading={loading}
        pagination={false}
        expandable={{
          expandedRowKeys,
          onExpandedRowsChange: (keys) => setExpandedRowKeys([...keys]),
        }}
        locale={{ emptyText: '暂无菜单数据' }}
      />

      <Modal
        title={editRecord ? '编辑菜单' : '新增菜单'}
        open={modalVisible}
        onOk={handleSave}
        onCancel={() => setModalVisible(false)}
        destroyOnClose
      >
        <Form form={form} layout="vertical">
          <Form.Item name="parentId" label="父菜单">
            <TreeSelect
              style={{ width: '100%' }}
              treeData={treeData}
              placeholder="选择父菜单（留空为顶级）"
              allowClear
              treeDefaultExpandAll
            />
          </Form.Item>
          <Form.Item
            name="displayName"
            label="显示名称"
            rules={[{ required: true, message: '请填写显示名称' }]}
          >
            <Input placeholder="如：首页、关于我们" />
          </Form.Item>
          <Form.Item name="linkType" label="链接类型">
            <Select
              style={{ width: '100%' }}
              options={[
                { value: 'internal', label: '内链（站内）' },
                { value: 'external', label: '外链（新开标签）' },
              ]}
            />
          </Form.Item>
          <Form.Item name="linkUrl" label="跳转链接">
            <Input placeholder="/" />
          </Form.Item>
          <Form.Item name="openNewTab" label="新开标签页" valuePropName="checked">
            <Switch checkedChildren="是" unCheckedChildren="否" />
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

export default NavMenuManage;
