import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Table, Button, Space, Switch, Form, Input, Select,
  Typography, Popconfirm, message, Tooltip,
} from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, SearchOutlined, EyeOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { videoApi, videoGroupApi, majorApi } from '../../../api';
import type { Video, VideoGroup, MajorCategory } from '../../../types';

// ============================================================
// 视频列表管理
// ============================================================

const { Title } = Typography;

const VideoList: React.FC = () => {
  const navigate = useNavigate();
  const [data, setData] = useState<Video[]>([]);
  const [groups, setGroups] = useState<VideoGroup[]>([]);
  const [majors, setMajors] = useState<MajorCategory[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState<{
    title?: string;
    groupId?: number;
    majorId?: number;
    isVisible?: boolean;
  }>({});
  const [searchForm] = Form.useForm();

  const fetchData = useCallback(async (p = page, f = filters) => {
    setLoading(true);
    try {
      const result = await videoApi.list({ page: p, pageSize: 10, ...f });
      setData(result.list);
      setTotal(result.total);
    } finally {
      setLoading(false);
    }
  }, [page, filters]);

  useEffect(() => {
    Promise.all([videoGroupApi.list(), majorApi.list()]).then(([g, m]) => {
      setGroups(g);
      setMajors(m);
    });
    fetchData();
  }, []);

  const handleSearch = () => {
    const vals = searchForm.getFieldsValue();
    const f = {
      title: vals.title || undefined,
      groupId: vals.groupId || undefined,
      majorId: vals.majorId || undefined,
      isVisible: vals.isVisible !== undefined && vals.isVisible !== '' ? Boolean(vals.isVisible) : undefined,
    };
    setFilters(f);
    setPage(1);
    fetchData(1, f);
  };

  const openCreate = () => {
    navigate('/admin/content/video/create');
  };

  const openEdit = (record: Video) => {
    navigate(`/admin/content/video/edit/${record.id}`);
  };

  const columns: ColumnsType<Video> = [
    { title: '标题', dataIndex: 'title', key: 'title', ellipsis: true, width: 200 },
    {
      title: '分组',
      dataIndex: 'groupId',
      key: 'groupName',
      width: 100,
      render: (id: number) => groups.find(g => g.id === id)?.groupName || '-',
    },
    {
      title: '专业',
      dataIndex: 'majorIds',
      key: 'majorNames',
      width: 140,
      render: (ids: number[]) => {
        if (!ids || ids.length === 0) return '-';
        const names = ids.map((id) => majors.find(m => m.id === id)?.name || String(id));
        if (names.length <= 3) return names.join('、');
        const fullText = names.join('、');
        return (
          <Tooltip title={fullText}>
            <span>{names.slice(0, 3).join('、')}... 等{names.length}个</span>
          </Tooltip>
        );
      },
    },
    {
      title: '发布时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 110,
      render: (v: string) => v ? v.slice(0, 10) : '-',
    },
    { title: '整理人', dataIndex: 'organizer', key: 'organizer', width: 90 },
    {
      title: '显示',
      dataIndex: 'isVisible',
      key: 'isVisible',
      width: 80,
      render: (v: boolean, record) => (
        <Switch size="small" checked={v} onChange={async (checked) => {
          await videoApi.update(record.id, { isVisible: checked });
          window.dispatchEvent(new CustomEvent('video-data-changed'));
          fetchData();
        }} />
      ),
    },
    {
      title: '操作',
      key: 'action',
      fixed: 'right',
      width: 140,
      render: (_, record) => (
        <Space>
          <Button type="text" icon={<EyeOutlined />} title="预览" onClick={() => window.open(`/videos/detail/${record.id}`, '_blank')} />
          <Button type="text" icon={<EditOutlined />} title="编辑" onClick={() => openEdit(record)} />
          <Popconfirm title="确认删除？" onConfirm={async () => { await videoApi.remove(record.id); window.dispatchEvent(new CustomEvent('video-data-changed')); fetchData(); }}>
            <Button type="text" danger icon={<DeleteOutlined />} title="删除" />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div className="page-card">
      {/* 高级搜索栏 */}
      <Form form={searchForm} layout="inline" style={{ marginBottom: 16, flexWrap: 'wrap', gap: 8 }}>
        <Form.Item name="title">
          <Input prefix={<SearchOutlined />} placeholder="标题搜索" style={{ width: 180 }} allowClear />
        </Form.Item>
        <Form.Item name="groupId">
          <Select
            placeholder="视频分组"
            allowClear
            style={{ width: 140 }}
            options={groups.map((g) => ({ value: g.id, label: g.groupName }))}
          />
        </Form.Item>
        <Form.Item name="majorId">
          <Select
            placeholder="专业分类"
            allowClear
            style={{ width: 140 }}
            options={majors.map((m) => ({ value: m.id, label: m.name }))}
          />
        </Form.Item>
        <Form.Item name="isVisible">
          <Select
            placeholder="状态筛选"
            allowClear
            style={{ width: 110 }}
            options={[{ value: 1, label: '显示' }, { value: 0, label: '隐藏' }]}
          />
        </Form.Item>
        <Form.Item>
          <Button type="primary" onClick={handleSearch}>搜索</Button>
        </Form.Item>
        <Button type="primary" icon={<PlusOutlined />} onClick={openCreate} style={{ marginLeft: 'auto' }}>
          新增视频
        </Button>
      </Form>

      <Table
        rowKey="id"
        dataSource={data}
        columns={columns}
        loading={loading}
        scroll={{ x: 900 }}
        pagination={{ current: page, total, pageSize: 10, showTotal: (t) => `共 ${t} 条`, onChange: (p) => { setPage(p); fetchData(p); } }}
        locale={{ emptyText: '暂无视频数据' }}
      />
    </div>
  );
};

export default VideoList;
