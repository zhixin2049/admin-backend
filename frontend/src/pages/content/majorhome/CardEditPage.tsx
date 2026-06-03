import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import {
  Card, Form, Input, InputNumber, Switch, Button, Space, Breadcrumb, Typography,
  message, Spin, Tag,
} from 'antd';
import { HomeOutlined, PlusOutlined, DeleteOutlined, ArrowUpOutlined, ArrowDownOutlined } from '@ant-design/icons';
import RichTextEditor from '../../../components/common/RichTextEditor';
import { majorHomeApi } from '../../../api';
import type { ColumnCard } from '../../../types';

const { Text } = Typography;

const CardEditPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { cardId } = useParams<{ cardId: string }>();
  const state = location.state as { majorId: number } | null;
  const majorId = state?.majorId ?? 0;
  const cid = Number(cardId);
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [majorName, setMajorName] = useState('');
  const [collapsedCards, setCollapsedCards] = useState<Set<number>>(new Set());

  useEffect(() => {
    if (!majorId || !cid) {
      message.error('缺少必要参数，请从专业主页列表进入');
      navigate(-1);
      return;
    }
    const mid = majorId;
    const homes = majorHomeApi.loadAll();
    const home = homes[mid];
    if (!home) {
      message.error('专业主页数据不存在');
      navigate(-1);
      return;
    }
    const card = home.columnCards.find((c) => c.id === cid);
    if (!card) {
      message.error('卡片不存在');
      navigate(-1);
      return;
    }

    // 查专业名称
    try {
      const majorsRaw = localStorage.getItem('mock_majors');
      if (majorsRaw) {
        const majors = JSON.parse(majorsRaw);
        const m = majors.find((m: { id: number; name: string }) => m.id === mid);
        if (m) setMajorName(m.name);
      }
    } catch { /* ignore */ }

    // 向后兼容：旧数据 content 是单一字符串 / descriptions 是旧格式，转换为 {title,content}[]
    const rawDescriptions = (card as any).descriptions;
    let descriptionsArr: { title: string; content: string; isVisible?: boolean }[] = [];

    if (Array.isArray(rawDescriptions) && rawDescriptions.length > 0) {
      // 判断是旧格式 string[] 还是新格式 {title,content}[]
      if (typeof rawDescriptions[0] === 'string') {
        descriptionsArr = (rawDescriptions as string[]).map((d) => ({ title: '', content: d }));
      } else {
        descriptionsArr = rawDescriptions as { title: string; content: string }[];
      }
    } else if (card.content && card.content.trim()) {
      // 旧数据：仅有一个 content 字符串，转为单张描述卡片
      descriptionsArr = [{ title: '', content: card.content }];
    }

    if (descriptionsArr.length === 0) {
      descriptionsArr = [{ title: '', content: '', isVisible: true }];
    }

    form.setFieldsValue({
      title: card.title || '',
      cardIntro: card.cardIntro || '',
      sortOrder: card.sortOrder,
      isVisible: card.isVisible,
      seoKeywords: card.seoKeywords || '',
      seoDescription: card.seoDescription || '',
      descriptions: descriptionsArr,
    });

    // 除第一张外，其余描述卡片默认收起
    const collapsed = new Set<number>();
    for (let i = 1; i < descriptionsArr.length; i++) collapsed.add(i);
    setCollapsedCards(collapsed);
    setLoading(false);
  }, [majorId, cid, form, navigate]);

  const handleSave = async () => {
    if (!majorId || !cid) return;
    try {
      const values = await form.validateFields();
      setSaving(true);
      const mid = majorId;
      const homes = majorHomeApi.loadAll();
      const home = homes[mid];
      if (!home) return;

      const existingCard = home.columnCards.find((c) => c.id === cid);
      if (!existingCard) return;

      const now = new Date().toISOString();
      const oldDescs = (existingCard as any).descriptions || [];
      const descriptionsArr: { title: string; content: string; updatedAt?: string; isVisible?: boolean }[] = (values.descriptions || [])
        .map((d: { title?: string; content?: string; isVisible?: boolean }, idx: number) => ({
          title: d.title || '',
          content: d.content || '',
          isVisible: d.isVisible ?? true,
          // 内容没变则保留旧时间，变了/新增则更新
          updatedAt: (oldDescs[idx] && oldDescs[idx].content === d.content)
            ? (oldDescs[idx].updatedAt || now)
            : now,
        }));

      const updatedCard = {
        ...existingCard,
        title: values.title || '',
        cardIntro: values.cardIntro || '',
        content: descriptionsArr.length > 0 ? descriptionsArr[0].content : '', // 向后兼容
        descriptions: descriptionsArr,
        sortOrder: values.sortOrder,
        seoKeywords: values.seoKeywords || '',
        seoDescription: values.seoDescription || '',
        isVisible: values.isVisible ?? true,
      };

      const cards = home.columnCards.map((c) =>
        c.id === cid ? updatedCard : c
      );
      homes[mid] = { ...home, columnCards: cards };
      majorHomeApi.saveAll(homes);
      window.dispatchEvent(new Event('major-data-changed'));
      message.success(`专栏卡片已保存 (${descriptionsArr.length} 段描述)`);
      navigate(-1);
    } catch { /* form validation error */ }
    finally { setSaving(false); }
  };

  const handleMove = (index: number, direction: 'up' | 'down') => {
    const descriptions: any[] = form.getFieldValue('descriptions') || [];
    if (descriptions.length <= 1) return;
    const target = direction === 'up' ? index - 1 : index + 1;
    if (target < 0 || target >= descriptions.length) return;
    const next = [...descriptions];
    [next[index], next[target]] = [next[target], next[index]];
    form.setFieldsValue({ descriptions: next });
  };

  const toggleCard = (index: number) => {
    setCollapsedCards((prev) => {
      const next = new Set(prev);
      if (next.has(index)) next.delete(index); else next.add(index);
      return next;
    });
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 300 }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div style={{ padding: '0' }}>
      {/* 面包屑 */}
      <div style={{ marginBottom: 16 }}>
        <Breadcrumb
          items={[
            {
              title: (
                <a onClick={() => navigate('/admin/dashboard')} style={{ cursor: 'pointer' }}>
                  <HomeOutlined style={{ marginRight: 4 }} />
                  仪表盘
                </a>
              ),
            },
            { title: <a onClick={() => navigate('/admin/content/majorhome')} style={{ cursor: 'pointer' }}>专业主页</a> },
            {
              title: (
                <span>
                  {majorName && <Tag color="blue" style={{ marginRight: 4 }}>{majorName}</Tag>}
                  编辑专栏卡片
                </span>
              ),
            },
          ]}
        />
      </div>

      <Card
        title={
          <Space>
            <Tag color="purple">专栏卡片编辑</Tag>
            <Text type="secondary">ColumnCard #{cid}</Text>
          </Space>
        }
        bordered={false}
        style={{ borderRadius: 8 }}
      >
        <Form form={form} layout="vertical" style={{ maxWidth: 900 }}>
          <Form.Item name="title" label="卡片标题" rules={[{ required: true, message: '请输入卡片标题' }]}>
            <Input placeholder="卡片标题" />
          </Form.Item>
          <Form.Item name="cardIntro" label="卡片简介">
            <Input.TextArea rows={3} placeholder="卡片简介，简要描述卡片内容" />
          </Form.Item>
          <Form.Item name="seoKeywords" label="SEO 关键词">
            <Input placeholder="关键词1,关键词2" />
          </Form.Item>
          <Form.Item name="seoDescription" label="SEO 描述">
            <Input.TextArea rows={2} placeholder="SEO 描述" />
          </Form.Item>

          {/* ===== 多段富文本描述 ===== */}
          <Form.Item label="富文本描述卡片（支持多段，每段独立显示为一张卡片）">
            <div style={{
              background: '#fafafa',
              borderRadius: 8,
              padding: '1rem',
              border: '1px dashed #d1d5db',
            }}>
              <Form.List name="descriptions">
                {(fields, { add, remove }) => (
                  <>
                    {fields.map(({ key, name, ...restField }) => (
                      <div
                        key={key}
                        style={{
                          background: '#ffffff',
                          borderRadius: 8,
                          padding: '1rem',
                          marginBottom: 12,
                          border: '1px solid #e5e7eb',
                          position: 'relative',
                        }}
                      >
                        <div style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          marginBottom: 8,
                        }}>
                          <Tag color="green">描述卡片 {name + 1}</Tag>
                          <Space>
                            <Button
                              type="link"
                              size="small"
                              onClick={() => toggleCard(name)}
                              style={{ padding: '0 4px', fontSize: 12 }}
                            >
                              {collapsedCards.has(name) ? '展开 ▼' : '收起 ▲'}
                            </Button>
                            {fields.length > 1 && (
                              <>
                                <Button
                                  type="text"
                                  icon={<ArrowUpOutlined />}
                                  onClick={() => handleMove(name, 'up')}
                                  size="small"
                                  disabled={name === 0}
                                  title="上移"
                                />
                                <Button
                                  type="text"
                                  icon={<ArrowDownOutlined />}
                                  onClick={() => handleMove(name, 'down')}
                                  size="small"
                                  disabled={name === fields.length - 1}
                                  title="下移"
                                />
                              </>
                            )}
                            <Form.Item
                              {...restField}
                              name={[name, 'isVisible']}
                              valuePropName="checked"
                              style={{ marginBottom: 0 }}
                            >
                              <Switch
                                checkedChildren="显示"
                                unCheckedChildren="隐藏"
                                size="small"
                              />
                            </Form.Item>
                            {fields.length > 1 && (
                              <Button
                                type="text"
                                danger
                                icon={<DeleteOutlined />}
                                onClick={() => remove(name)}
                                size="small"
                              >
                                删除此卡片
                              </Button>
                            )}
                          </Space>
                        </div>
                        <Form.Item
                          {...restField}
                          name={[name, 'title']}
                          label="卡片标题"
                          style={{ marginBottom: 12 }}
                        >
                          <Input placeholder="输入卡片标题（可选，留空则默认「详细介绍 N」）" />
                        </Form.Item>
                        <Form.Item
                          {...restField}
                          name={[name, 'content']}
                          label="卡片内容"
                          style={{ marginBottom: 0, display: collapsedCards.has(name) ? 'none' : 'block' }}
                        >
                          <RichTextEditor placeholder="<p>请输入描述内容...</p>" />
                        </Form.Item>
                      </div>
                    ))}
                    <Button
                      type="dashed"
                      onClick={() => add({ title: '', content: '', isVisible: true })}
                      block
                      icon={<PlusOutlined />}
                      style={{ marginTop: fields.length > 0 ? 8 : 0 }}
                    >
                      添加描述卡片
                    </Button>
                  </>
                )}
              </Form.List>
            </div>
          </Form.Item>

          <Space size={12} style={{ width: '100%' }} align="start">
            <Form.Item name="sortOrder" label="排序序号" rules={[{ required: true }]} style={{ width: 120 }}>
              <InputNumber min={1} max={6} placeholder="1~6" style={{ width: '100%' }} />
            </Form.Item>
            <Form.Item name="isVisible" label="是否显示" valuePropName="checked">
              <Switch checkedChildren="显示" unCheckedChildren="隐藏" />
            </Form.Item>
          </Space>

          {/* 操作按钮 */}
          <div style={{ textAlign: 'right', marginTop: 24, borderTop: '1px solid #d1d5db', paddingTop: 16 }}>
            <Button onClick={() => navigate(-1)} style={{ marginRight: 12 }}>
              取消
            </Button>
            <Button type="primary" onClick={handleSave} loading={saving}>
              保存
            </Button>
          </div>
        </Form>
      </Card>
    </div>
  );
};

export default CardEditPage;
