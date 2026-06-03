import React, { useEffect, useState, useMemo } from 'react';
import { Row, Col, Card, Statistic, Table, Typography, Spin, Collapse, Empty } from 'antd';
import {
  UserOutlined,
  AppstoreOutlined,
  RiseOutlined,
  TeamOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { dashboardApi } from '../../api';
import type { DashboardStats, GroupVideoStats, MajorVideoStats } from '../../types';

// ============================================================
// 仪表盘首页
// ============================================================

const { Title, Text } = Typography;

const statCards = [
  { key: 'totalMembers', title: '注册用户总数', icon: <UserOutlined />, color: '#1677ff' },
  { key: 'totalMajors', title: '专业数量', icon: <AppstoreOutlined />, color: '#52c41a' },
  { key: 'todayNewMembers', title: '今日新增', icon: <RiseOutlined />, color: '#faad14' },
  { key: 'activeAdmins', title: '活跃管理员', icon: <TeamOutlined />, color: '#722ed1' },
];

const groupColumns: ColumnsType<GroupVideoStats> = [
  { title: '视频分组', dataIndex: 'groupName', key: 'groupName' },
  { title: '视频数量', dataIndex: 'count', key: 'count', align: 'right' },
];

// 按视频数量分档的颜色
const TAG_COLORS = [
  { min: 1, bg: '#f0f5ff', text: '#2f54eb', border: '#adc6ff' },
  { min: 3, bg: '#e6f7ff', text: '#08979c', border: '#87e8de' },
  { min: 6, bg: '#f6ffed', text: '#389e0d', border: '#b7eb8f' },
  { min: 10, bg: '#fffbe6', text: '#d48806', border: '#ffe58f' },
  { min: 15, bg: '#fff2e8', text: '#d4380d', border: '#ffbb96' },
];

function getTagColor(count: number) {
  for (let i = TAG_COLORS.length - 1; i >= 0; i--) {
    if (count >= TAG_COLORS[i].min) return TAG_COLORS[i];
  }
  return { bg: '#fafafa', text: '#8c8c8c', border: '#d9d9d9' };
}

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [groupStats, setGroupStats] = useState<GroupVideoStats[]>([]);
  const [majorStats, setMajorStats] = useState<MajorVideoStats[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      dashboardApi.getStats(),
      dashboardApi.getGroupVideoStats(),
      dashboardApi.getMajorVideoStats(),
    ]).then(([s, g, m]) => {
      setStats(s);
      setGroupStats(g);
      setMajorStats(m);
    }).finally(() => setLoading(false));
  }, []);

  // 拆分有数据和无数据的专业，有数据的按 count 降序排列
  const { activeMajors, emptyMajors } = useMemo(() => {
    const sorted = [...majorStats].sort((a, b) => b.count - a.count);
    return {
      activeMajors: sorted.filter((m) => m.count > 0),
      emptyMajors: sorted.filter((m) => m.count === 0),
    };
  }, [majorStats]);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div>
      <Title level={4} style={{ marginBottom: 20 }}>数据概览</Title>

      {/* 统计卡片 */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        {statCards.map((card) => (
          <Col xs={24} sm={12} xl={6} key={card.key}>
            <Card className="stat-card" bordered={false}>
              <Statistic
                title={card.title}
                value={stats?.[card.key as keyof DashboardStats] ?? 0}
                prefix={
                  <span
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: 36,
                      height: 36,
                      borderRadius: 8,
                      background: card.color + '18',
                      color: card.color,
                      marginRight: 8,
                    }}
                  >
                    {card.icon}
                  </span>
                }
                valueStyle={{ color: card.color, fontSize: 28, fontWeight: 700 }}
              />
            </Card>
          </Col>
        ))}
      </Row>

      {/* 统计面板 */}
      <Row gutter={16}>
        {/* 左侧：各分组视频数量（保留表格） */}
        <Col xs={24} lg={12}>
          <Card title="各分组视频数量" bordered={false} style={{ borderRadius: 8 }}>
            <Table
              dataSource={groupStats}
              columns={groupColumns}
              pagination={false}
              size="small"
              rowKey="groupName"
              locale={{ emptyText: '暂无数据，等待录入' }}
            />
          </Card>
        </Col>

        {/* 右侧：各专业视频数量（标签云） */}
        <Col xs={24} lg={12}>
          <Card
            title="各专业视频数量"
            bordered={false}
            style={{ borderRadius: 8 }}
            extra={
              <Text type="secondary" style={{ fontSize: 12 }}>
                {activeMajors.length} 个有视频 / {majorStats.length} 个专业
              </Text>
            }
          >
            {activeMajors.length === 0 ? (
              <Empty description="暂无专业关联视频" />
            ) : (
              <div
                style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: 8,
                  maxHeight: 400,
                  overflowY: 'auto',
                  paddingRight: 4,
                }}
              >
                {activeMajors.map((m) => {
                  const c = getTagColor(m.count);
                  return (
                    <span
                      key={m.majorName}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 6,
                        padding: '4px 12px',
                        borderRadius: 20,
                        background: c.bg,
                        border: `1px solid ${c.border}`,
                        fontSize: 13,
                        color: '#595959',
                        fontWeight: 500,
                        cursor: 'default',
                        transition: 'all 0.2s',
                      }}
                      onMouseEnter={(e) => {
                        const el = e.currentTarget as HTMLSpanElement;
                        el.style.transform = 'scale(1.06)';
                        el.style.boxShadow = `0 2px 8px ${c.border}80`;
                      }}
                      onMouseLeave={(e) => {
                        const el = e.currentTarget as HTMLSpanElement;
                        el.style.transform = 'scale(1)';
                        el.style.boxShadow = 'none';
                      }}
                    >
                      {m.majorName}
                      <span
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          minWidth: 20,
                          height: 20,
                          padding: '0 5px',
                          borderRadius: 10,
                          background: '#fff',
                          color: '#595959',
                          border: `1px solid ${c.border}`,
                          fontSize: 11,
                          fontWeight: 700,
                          lineHeight: '20px',
                        }}
                      >
                        {m.count}
                      </span>
                    </span>
                  );
                })}
              </div>
            )}

            {/* 无视频的专业折叠展示 */}
            {emptyMajors.length > 0 && activeMajors.length > 0 && (
              <Collapse
                ghost
                size="small"
                items={[{
                  key: 'empty-majors',
                  label: `+ 还有 ${emptyMajors.length} 个暂无视频的专业`,
                  children: (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                      {emptyMajors.map((m) => (
                        <span
                          key={m.majorName}
                          style={{
                            padding: '2px 10px',
                            borderRadius: 12,
                            background: '#fafafa',
                            border: '1px solid #e8e8e8',
                            fontSize: 12,
                            color: '#bfbfbf',
                          }}
                        >
                          {m.majorName}
                        </span>
                      ))}
                    </div>
                  ),
                }]}
              />
            )}
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Dashboard;
