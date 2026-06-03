import React, { useEffect, useState } from 'react';
import {
  Form, Input, Select, Switch, Button,
  Divider, Row, Col, Typography, message, Spin,
} from 'antd';
import { useParams, useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import { videoApi, videoGroupApi, majorApi } from '../../../api';
import type { VideoGroup, MajorCategory } from '../../../types';
import RichTextEditor from '../../../components/common/RichTextEditor';

// ============================================================
// 视频表单页（新增 / 编辑）
// 作为内部标签页打开，保存后返回列表
// ============================================================

const { Title } = Typography;
const { TextArea } = Input;

const VideoForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [form] = Form.useForm();
  const [groups, setGroups] = useState<VideoGroup[]>([]);
  const [majors, setMajors] = useState<MajorCategory[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    Promise.all([videoGroupApi.list(), majorApi.list()]).then(([g, m]) => {
      setGroups(g);
      setMajors(m);
    });

    if (isEdit && id) {
      setLoading(true);
      // 从 localStorage 加载编辑数据
      try {
        const raw = localStorage.getItem('mock_videos');
        if (raw) {
          const videos = JSON.parse(raw);
          const record = videos.find((v: { id: number }) => v.id === Number(id));
          if (record) {
            form.setFieldsValue({
              ...record,
              // 兼容旧数据：majorId (number) → majorIds (number[])
              majorIds: record.majorIds || (record.majorId ? [record.majorId] : undefined),
            });
          } else {
            message.error('视频不存在');
            navigate('/admin/content/video', { replace: true });
          }
        }
      } finally {
        setLoading(false);
      }
    } else {
      form.setFieldsValue({ isVisible: false });
    }
  }, [id, isEdit, form, navigate]);

  const handleSave = async () => {
    const values = await form.validateFields();
    // 整理日期默认为当天
    values.organizedDate = dayjs().format('YYYY-MM-DD');
    // 播放器标题默认等于视频标题
    values.playerTitle = values.title;
    setSaving(true);
    try {
      if (isEdit && id) {
        await videoApi.update(Number(id), values);
      } else {
        await videoApi.create(values);
      }
      // 保存后返回列表
      message.success(isEdit ? '更新成功' : '新增成功');
      // 通知官网页面重新加载数据
      window.dispatchEvent(new CustomEvent('video-data-changed'));
      navigate('/admin/content/video');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 300 }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div style={{ padding: 24, maxWidth: 960, margin: '0 auto' }}>
      <Title level={3} style={{ marginBottom: 24 }}>
        {isEdit ? '编辑视频' : '新增视频'}
      </Title>

      <Form form={form} layout="vertical">
        {/* 基本信息 */}
        <Divider plain>基本信息</Divider>
        <Row gutter={16}>
          <Col span={24}>
            <Form.Item name="title" label="视频标题" rules={[{ required: true }]}>
              <Input placeholder="视频标题" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="bilibiliUrl" label="B站视频URL" rules={[{ required: true }]}>
              <Input placeholder="https://www.bilibili.com/video/BVxxxxxxxx" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="organizer" label="整理人">
              <Input placeholder="整理人姓名" />
            </Form.Item>
          </Col>
        </Row>

        {/* 分类 */}
        <Divider plain>分类归属</Divider>
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item name="groupId" label="所属分组" rules={[{ required: true }]}>
              <Select
                options={groups.map((g) => ({ value: g.id, label: g.groupName }))}
                placeholder="选择视频分组"
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="majorIds" label="所属专业">
              <Select
                mode="multiple"
                options={majors.map((m) => ({ value: m.id, label: m.name }))}
                placeholder="选择专业（可选，可多选）"
                allowClear
                dropdownRender={(menu) => {
                  const allValues = majors.map((m) => m.id);
                  const currentValues: number[] = form.getFieldValue('majorIds') || [];
                  const allSelected = allValues.length > 0 && allValues.every((v) => currentValues.includes(v));
                  return (
                    <div>
                      <div
                        style={{
                          padding: '4px 12px',
                          borderBottom: '1px solid #f0f0f0',
                          cursor: 'pointer',
                          color: '#1677ff',
                          fontWeight: 500,
                          fontSize: 13,
                        }}
                        onMouseDown={(e) => {
                          e.preventDefault();
                          form.setFieldValue(
                            'majorIds',
                            allSelected ? [] : allValues,
                          );
                        }}
                      >
                        {allSelected ? '取消全选' : '全选'}
                      </div>
                      {menu}
                    </div>
                  );
                }}
              />
            </Form.Item>
          </Col>
        </Row>

        {/* SEO 设置 */}
        <Divider plain>SEO 设置</Divider>
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item name="seoKeywords" label="SEO 关键词">
              <Input placeholder="关键词1,关键词2" />
            </Form.Item>
          </Col>
          <Col span={24}>
            <Form.Item name="seoDescription" label="SEO 描述">
              <TextArea rows={2} />
            </Form.Item>
          </Col>
        </Row>

        {/* 视频描述 */}
        <Divider plain>视频描述</Divider>
        <Form.Item name="description" label="视频描述（支持 HTML）">
          <RichTextEditor placeholder="<p>视频简介</p>" />
        </Form.Item>

        <Form.Item name="isVisible" label="是否显示" valuePropName="checked">
          <Switch checkedChildren="显示" unCheckedChildren="隐藏" />
        </Form.Item>

        {/* 操作按钮 */}
        <div style={{ textAlign: 'right', marginTop: 24, borderTop: '1px solid #d1d5db', paddingTop: 16 }}>
          <Button onClick={() => navigate('/admin/content/video')} style={{ marginRight: 12 }}>
            取消
          </Button>
          <Button type="primary" onClick={handleSave} loading={saving}>
            {isEdit ? '保存修改' : '新增视频'}
          </Button>
        </div>
      </Form>
    </div>
  );
};

export default VideoForm;
