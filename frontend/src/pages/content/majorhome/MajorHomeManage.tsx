import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Row, Col, Card, List, Button, Space, Typography, Form, Input, Tag,
  Switch, message, Divider, Empty, Modal, InputNumber,
} from 'antd';
import {
  PlusOutlined, EditOutlined, DeleteOutlined, ExportOutlined,
} from '@ant-design/icons';
import { majorApi, majorHomeApi } from '../../../api';
import type { MajorCategory, MajorHome, ColumnCard } from '../../../types';

// ============================================================
// 专业主页管理（左侧专业列表 + 右侧编辑区）
// ============================================================

const { Title, Text } = Typography;


const MajorHomeManage: React.FC = () => {
  const navigate = useNavigate();
  const [majors, setMajors] = useState<MajorCategory[]>([]);
  const [selectedMajor, setSelectedMajor] = useState<MajorCategory | null>(null);
  const [homeData, setHomeData] = useState<MajorHome | null>(null);
  const [loading, setLoading] = useState(false);
  const [cardModalVisible, setCardModalVisible] = useState(false);
  const [cardForm] = Form.useForm();

  const loadMajors = () => {
    majorApi.list().then((list) => {
      const sorted = [...list].sort((a, b) => a.sortOrder - b.sortOrder);
      setMajors(sorted);
      if (sorted.length > 0 && !selectedMajor) selectMajor(sorted[0]);
    });
  };

  useEffect(() => {
    loadMajors();
    // 监听专业分类页面的排序/增删变更，同步刷新列表
    const handler = () => loadMajors();
    window.addEventListener('major-data-changed', handler);
    return () => window.removeEventListener('major-data-changed', handler);
  }, []);

  const selectMajor = (major: MajorCategory) => {
    setSelectedMajor(major);
    const homes = majorHomeApi.loadAll();
    if (!homes[major.id]) {
      homes[major.id] = {
        majorId: major.id,
        slug: major.slug,
        featuredCard: { icon: '', boldTitle: '', normalTitle: '', description: '', descriptions: [], tags: [] },
        columnCards: [],
      };
      majorHomeApi.saveAll(homes);
    }
    const data = homes[major.id];
    setHomeData({ ...data });
  };

  const openEditFeatured = () => {
    if (!selectedMajor) return;
    navigate(`/admin/content/majorhome/featured/edit/${selectedMajor.id}`);
  };

  const handleToggleFeaturedVisible = () => {
    if (!selectedMajor || !homeData) return;
    const homes = majorHomeApi.loadAll();
    const updated = {
      ...homeData,
      featuredCard: { ...homeData.featuredCard, isVisible: !homeData.featuredCard.isVisible },
    };
    homes[selectedMajor.id] = updated;
    majorHomeApi.saveAll(homes);
    setHomeData(updated);
    window.dispatchEvent(new Event('major-data-changed'));
    message.success(updated.featuredCard.isVisible ? '大卡片已显示' : '大卡片已隐藏');
  };

  const handleDeleteFeatured = () => {
    if (!selectedMajor || !homeData) return;
    const homes = majorHomeApi.loadAll();
    const updated = {
      ...homeData,
      featuredCard: { icon: '', boldTitle: '', normalTitle: '', description: '', descriptions: [], tags: [] },
    };
    homes[selectedMajor.id] = updated;
    majorHomeApi.saveAll(homes);
    setHomeData(updated);
    message.success('大卡片已重置');
  };

  const openAddCard = () => {
    cardForm.resetFields();
    cardForm.setFieldsValue({ sortOrder: (homeData?.columnCards.length || 0) + 1, isVisible: true });
    setCardModalVisible(true);
  };

  const openEditCard = (card: ColumnCard) => {
    if (!selectedMajor) return;
    navigate(`/admin/content/majorhome/card/edit/${card.id}`, {
      state: { majorId: selectedMajor.id },
    });
  };

  const handleSaveCard = async () => {
    if (!selectedMajor || !homeData) return;
    const values = await cardForm.validateFields();
    const cards = [...homeData.columnCards];
    if (cards.length >= 6) {
      message.warning('专栏卡片最多 6 张');
      return;
    }
    cards.push({ ...values, id: Date.now() });
    const homes = majorHomeApi.loadAll();
    const updated = { ...homeData, columnCards: cards };
    homes[selectedMajor.id] = updated;
    majorHomeApi.saveAll(homes);
    setHomeData(updated);
    setCardModalVisible(false);
    // 触发前台页面刷新
    window.dispatchEvent(new Event('major-data-changed'));
    message.success('卡片已保存');
  };

  const handleToggleCardVisible = (id: number) => {
    if (!selectedMajor || !homeData) return;
    const cards = homeData.columnCards.map((c) =>
      c.id === id ? { ...c, isVisible: !c.isVisible } : c
    );
    const homes = majorHomeApi.loadAll();
    const updated = { ...homeData, columnCards: cards };
    homes[selectedMajor.id] = updated;
    majorHomeApi.saveAll(homes);
    setHomeData(updated);
    window.dispatchEvent(new Event('major-data-changed'));
    const toggled = cards.find((c) => c.id === id);
    message.success(toggled?.isVisible ? '卡片已显示' : '卡片已隐藏');
  };

  const handleDeleteCard = (id: number) => {
    if (!selectedMajor || !homeData) return;
    const cards = homeData.columnCards.filter((c) => c.id !== id);
    const homes = majorHomeApi.loadAll();
    const updated = { ...homeData, columnCards: cards };
    homes[selectedMajor.id] = updated;
    majorHomeApi.saveAll(homes);
    setHomeData(updated);
    message.success('已删除');
  };

  return (
    <Row gutter={16} style={{ height: '100%' }}>
      {/* 左侧专业列表 */}
      <Col xs={24} md={7} lg={6}>
        <Card title="专业列表" bordered={false} style={{ borderRadius: 8 }}>
          {majors.length === 0 ? (
            <Empty description="请先在【专业分类】中添加专业" image={Empty.PRESENTED_IMAGE_SIMPLE} />
          ) : (
            <List
              dataSource={majors}
              renderItem={(major) => (
                <List.Item
                  onClick={() => selectMajor(major)}
                  style={{
                    cursor: 'pointer',
                    padding: '8px 12px',
                    borderRadius: 6,
                    background: selectedMajor?.id === major.id ? '#e6f4ff' : 'transparent',
                    marginBottom: 4,
                  }}
                >
                  <Space>
                    <div style={{
                      width: 28, height: 28, borderRadius: 6,
                      background: major.iconBgColor || '#1677ff',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: '#fff', fontSize: 12, fontWeight: 700,
                    }}>
                      {major.iconText || '?'}
                    </div>
                    <Text strong={selectedMajor?.id === major.id}>{major.name}</Text>
                  </Space>
                </List.Item>
              )}
            />
          )}
        </Card>
      </Col>

      {/* 右侧编辑区 */}
      <Col xs={24} md={17} lg={18}>
        {!selectedMajor ? (
          <Card bordered={false} style={{ borderRadius: 8 }}>
            <Empty description="请选择左侧专业进行编辑" />
          </Card>
        ) : (
          <Space direction="vertical" style={{ width: '100%' }} size={16}>
            {/* 大卡片区域 */}
            <Card
              title={<><Tag color="blue">大卡片区域</Tag> featured_card <Text type="secondary" style={{ fontSize: 12, marginLeft: 8 }}>slug: /{selectedMajor.slug}/big</Text></>}
              bordered={false}
              style={{ borderRadius: 8 }}
              extra={
                <Space>
                  <Button
                    icon={<ExportOutlined />}
                    href={`/major/${selectedMajor.slug}`}
                    target="_blank"
                    size="small"
                  >
                    预览
                  </Button>
                  <Button type="primary" icon={<EditOutlined />} size="small" onClick={openEditFeatured}>
                    编辑
                  </Button>
                </Space>
              }
            >
              {!homeData?.featuredCard || (!homeData.featuredCard.boldTitle && !homeData.featuredCard.normalTitle) ? (
                <Empty description="大卡片尚未编辑" image={Empty.PRESENTED_IMAGE_SIMPLE}>
                  <Button type="primary" icon={<EditOutlined />} onClick={openEditFeatured}>
                    立即编辑
                  </Button>
                </Empty>
              ) : (
                <List
                  dataSource={[homeData.featuredCard]}
                  renderItem={(card) => (
                    <List.Item
                      actions={[
                        <Switch
                          key="visible"
                          size="small"
                          checked={card.isVisible !== false}
                          onChange={handleToggleFeaturedVisible}
                          checkedChildren="显示"
                          unCheckedChildren="隐藏"
                        />,
                        <Button type="text" icon={<EditOutlined />} onClick={openEditFeatured}>编辑</Button>,
                        <Button type="text" danger icon={<DeleteOutlined />} onClick={handleDeleteFeatured}>删除</Button>,
                      ]}
                    >
                      <List.Item.Meta
                        title={
                          <Space>
                            <Tag color="blue">序号 1</Tag>
                            {card.icon && <span>{card.icon}</span>}
                            {card.boldTitle || card.normalTitle || '未命名'}
                            {card.isVisible === false && <Tag color="red">隐藏</Tag>}
                          </Space>
                        }
                      />
                    </List.Item>
                  )}
                />
              )}
            </Card>

            {/* 专栏卡片区域 */}
            <Card
              title={<><Tag color="purple">专栏卡片区域</Tag> column_cards（最多 6 张）</>}
              bordered={false}
              style={{ borderRadius: 8 }}
              extra={
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  size="small"
                  onClick={openAddCard}
                  disabled={(homeData?.columnCards.length || 0) >= 6}
                >
                  新增卡片
                </Button>
              }
            >
              {homeData?.columnCards.length === 0 ? (
                <Empty description="暂无专栏卡片" image={Empty.PRESENTED_IMAGE_SIMPLE} />
              ) : (
                <List
                  dataSource={homeData?.columnCards}
                  renderItem={(card) => (
                    <List.Item
                      actions={[
                        <Switch
                          key="visible"
                          size="small"
                          checked={card.isVisible !== false}
                          onChange={() => handleToggleCardVisible(card.id)}
                          checkedChildren="显示"
                          unCheckedChildren="隐藏"
                        />,
                        <Button type="text" icon={<EditOutlined />} onClick={() => openEditCard(card)}>编辑</Button>,
                        <Button type="text" danger icon={<DeleteOutlined />} onClick={() => handleDeleteCard(card.id)}>删除</Button>,
                      ]}
                    >
                      <List.Item.Meta
                        title={
                          <Space>
                            <Tag color="geekblue">序号 {card.sortOrder}</Tag>
                            {card.title}
                            {!card.isVisible && <Tag color="red">隐藏</Tag>}
                          </Space>
                        }
                        description={<Text type="secondary" style={{ fontSize: 12 }}>slug: /{selectedMajor.slug}/{card.sortOrder}</Text>}
                      />
                    </List.Item>
                  )}
                />
              )}
            </Card>
          </Space>
        )}
      </Col>

      {/* 新增卡片 Modal */}
      <Modal
        title="新增专栏卡片"
        open={cardModalVisible}
        onOk={handleSaveCard}
        onCancel={() => setCardModalVisible(false)}
        destroyOnClose
        width={500}
      >
        <Form form={cardForm} layout="vertical">
          <Form.Item name="title" label="卡片标题" rules={[{ required: true }]}>
            <Input placeholder="卡片标题" />
          </Form.Item>
          <Form.Item name="sortOrder" label="排序序号（即 URL 中的序号）" rules={[{ required: true }]}>
            <InputNumber min={1} max={6} style={{ width: '100%' }} placeholder="1~6" />
          </Form.Item>
          <Form.Item name="isVisible" label="是否显示" valuePropName="checked">
            <Switch checkedChildren="显示" unCheckedChildren="隐藏" />
          </Form.Item>
        </Form>
      </Modal>
    </Row>
  );
};

export default MajorHomeManage;
