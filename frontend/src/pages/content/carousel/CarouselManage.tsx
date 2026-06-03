import React, { useEffect, useState } from 'react';
import {
  Table, Button, Space, Switch, Modal, Form, Input, Select,
  InputNumber, Image, Typography, Tooltip, Popconfirm, message, Tag, Upload,
} from 'antd';
import {
  PlusOutlined, EditOutlined, DeleteOutlined,
  ArrowUpOutlined, ArrowDownOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import type { UploadFile, RcFile } from 'antd/es/upload';
import { carouselApi, majorApi } from '../../../api';
import type { Carousel, MajorCategory } from '../../../types';

// ============================================================
// 轮播图管理
// ============================================================

const { Title } = Typography;

const CarouselManage: React.FC = () => {
  const [data, setData] = useState<Carousel[]>([]);
  const [majors, setMajors] = useState<MajorCategory[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editRecord, setEditRecord] = useState<Carousel | null>(null);
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [form] = Form.useForm();
  const watchCategory = Form.useWatch('category', form);

  // File → base64
  const fileToBase64 = (file: RcFile): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

  const beforeUpload = (file: RcFile) => {
    const isImage = ['image/jpeg', 'image/png', 'image/jpg'].includes(file.type);
    if (!isImage) {
      message.error('仅支持 JPG / PNG / JPEG 格式');
      return Upload.LIST_IGNORE;
    }
    const isLt2M = file.size / 1024 / 1024 < 2;
    if (!isLt2M) {
      message.error('图片大小不能超过 2MB');
      return Upload.LIST_IGNORE;
    }
    return false; // 阻止自动上传
  };

  const handleUploadChange = async (info: { fileList: UploadFile[] }) => {
    setFileList(info.fileList);
    if (info.fileList.length > 0 && info.fileList[0].originFileObj) {
      const base64 = await fileToBase64(info.fileList[0].originFileObj as RcFile);
      form.setFieldsValue({ imageUrl: base64 });
    } else {
      form.setFieldsValue({ imageUrl: undefined });
    }
  };

  const fetchData = async () => {
    setLoading(true);
    const [list, majorList] = await Promise.all([carouselApi.list(), majorApi.list()]);
    setData(list.sort((a, b) => a.sortOrder - b.sortOrder));
    setMajors(majorList);
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  // 根据 majorId 获取专业名称
  const getMajorName = (majorId?: number) => {
    if (!majorId) return '-';
    const m = majors.find((item) => item.id === majorId);
    return m ? m.name : '-';
  };

  const openCreate = () => {
    setEditRecord(null);
    form.resetFields();
    setFileList([]);
    form.setFieldsValue({ sortOrder: data.length + 1, isVisible: true });
    setModalVisible(true);
  };

  const openEdit = (record: Carousel) => {
    setEditRecord(record);
    form.setFieldsValue(record);
    // 编辑时回显已有图片
    if (record.imageUrl) {
      setFileList([
        {
          uid: '-1',
          name: 'current-image',
          status: 'done',
          url: record.imageUrl,
        },
      ]);
    } else {
      setFileList([]);
    }
    setModalVisible(true);
  };

  const handleDelete = async (id: number) => {
    await carouselApi.remove(id);
    message.success('已删除');
    setData((prev) => prev.filter((item) => item.id !== id));
  };

  const handleSave = async () => {
    const values = await form.validateFields();
    if (editRecord) {
      await carouselApi.update(editRecord.id, values);
      message.success('更新成功');
    } else {
      await carouselApi.create(values);
      message.success('新增成功');
    }
    setModalVisible(false);
    fetchData();
  };

  const handleMove = async (index: number, direction: 'up' | 'down') => {
    const newData = [...data];
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= newData.length) return;
    [newData[index], newData[targetIdx]] = [newData[targetIdx], newData[index]];
    const reordered = newData.map((item, idx) => ({ ...item, sortOrder: idx + 1 }));
    setData(reordered);
    await carouselApi.reorder(reordered.map((i) => i.id));
    message.success('排序已更新');
  };

  const columns: ColumnsType<Carousel> = [
    {
      title: '图片',
      dataIndex: 'imageUrl',
      key: 'imageUrl',
      width: 100,
      render: (v: string) =>
        v ? (
          <Image src={v} width={80} height={50} style={{ objectFit: 'cover', borderRadius: 4 }} />
        ) : (
          <div style={{ width: 80, height: 50, background: '#f0f0f0', borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#999', fontSize: 12 }}>
            无图片
          </div>
        ),
    },
    {
      title: '分类',
      dataIndex: 'category',
      key: 'category',
      width: 80,
      render: (v: string) => <Tag color={v === 'index' ? 'blue' : 'purple'}>{v === 'index' ? '首页' : '专业主页'}</Tag>,
    },
    {
      title: '所属专业',
      dataIndex: 'majorId',
      key: 'majorId',
      width: 120,
      render: (_: unknown, record: Carousel) => (
        record.category === 'major' ? <span>{getMajorName(record.majorId)}</span> : <span style={{ color: '#ccc' }}>-</span>
      ),
    },
    { title: '跳转链接', dataIndex: 'linkUrl', key: 'linkUrl', ellipsis: true },
    { title: '排序', dataIndex: 'sortOrder', key: 'sortOrder', width: 70, align: 'center' },
    {
      title: '显示',
      dataIndex: 'isVisible',
      key: 'isVisible',
      width: 80,
      render: (v: boolean, record) => (
        <Switch size="small" checked={v} onChange={async (checked) => {
          await carouselApi.update(record.id, { isVisible: checked });
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
          <Tooltip title="上移">
            <Button type="text" size="small" icon={<ArrowUpOutlined />} onClick={() => handleMove(index, 'up')} disabled={index === 0} />
          </Tooltip>
          <Tooltip title="下移">
            <Button type="text" size="small" icon={<ArrowDownOutlined />} onClick={() => handleMove(index, 'down')} disabled={index === data.length - 1} />
          </Tooltip>
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
        <Title level={5} style={{ margin: 0 }}>轮播图管理</Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>新增轮播图</Button>
      </div>

      <Table
        rowKey="id"
        dataSource={data}
        columns={columns}
        loading={loading}
        pagination={false}
        locale={{ emptyText: '暂无轮播图数据' }}
      />

      <Modal
        title={editRecord ? '编辑轮播图' : '新增轮播图'}
        open={modalVisible}
        onOk={handleSave}
        onCancel={() => setModalVisible(false)}
        destroyOnClose
        width={520}
      >
        <Form form={form} layout="vertical">
          <Form.Item name="imageUrl" label="轮播图片" rules={[{ required: true, message: '请上传轮播图片' }]} style={{ display: 'none' }}>
            <Input />
          </Form.Item>
          <Form.Item label="上传图片" required>
            <Upload
              listType="picture-card"
              fileList={fileList}
              beforeUpload={beforeUpload}
              onChange={handleUploadChange}
              maxCount={1}
              accept=".jpg,.jpeg,.png"
            >
              {fileList.length === 0 && (
                <div>
                  <PlusOutlined />
                  <div style={{ marginTop: 8 }}>上传图片</div>
                </div>
              )}
            </Upload>
            <div style={{ color: '#999', fontSize: 12, marginTop: 4 }}>支持 JPG / PNG / JPEG，大小不超过 2MB</div>
          </Form.Item>
          <Form.Item name="category" label="所属分类" rules={[{ required: true, message: '请选择分类' }]}>
            <Select
              options={[{ value: 'index', label: '首页' }, { value: 'major', label: '专业主页' }]}
              onChange={() => form.setFieldValue('majorId', undefined)}
            />
          </Form.Item>
          {watchCategory === 'major' && (
            <Form.Item name="majorId" label="所属专业" rules={[{ required: true, message: '请选择专业' }]}>
              <Select
                placeholder="选择轮播图归属的专业"
                options={majors.filter((m) => m.isVisible).map((m) => ({ value: m.id, label: m.name }))}
                showSearch
                filterOption={(input, option) => (option?.label as string).includes(input)}
              />
            </Form.Item>
          )}
          <Form.Item name="linkUrl" label="跳转链接">
            <Input placeholder="https://..." />
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

export default CarouselManage;
