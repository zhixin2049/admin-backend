import React, { useMemo, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Collapse,
  Radio,
  Checkbox,
  Tag,
  Empty,
  Typography,
  Flex,
  Pagination,
} from 'antd';
import { HomeOutlined } from '@ant-design/icons';
import Navbar from '../../components/home/Navbar';
import { loadMajors, loadGroups, getGroupName, loadContentItems } from './data';
import Footer from '../../components/home/Footer';

const { Text } = Typography;

// ============================================================
// 内容列表详情页 - Collapse 折叠面板双维度筛选
// ============================================================

const Lists: React.FC = () => {
  const [allItems, setAllItems] = useState(loadContentItems());
  const [selectedGroupKey, setSelectedGroupKey] = useState<string>('all');
  const [selectedMajors, setSelectedMajors] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [groups, setGroups] = useState(loadGroups());

  useEffect(() => {
    setGroups(loadGroups());
    setAllItems(loadContentItems());
  }, []);

  // 监听视频/专业数据变更事件
  useEffect(() => {
    const handler = () => {
      setGroups(loadGroups());
      setAllItems(loadContentItems());
    };
    window.addEventListener('video-data-changed', handler);
    window.addEventListener('major-data-changed', handler);
    return () => {
      window.removeEventListener('video-data-changed', handler);
      window.removeEventListener('major-data-changed', handler);
    };
  }, []);

  // 筛选逻辑 + 时间降序
  const filtered = useMemo(() => {
    return allItems
      .filter((item) => {
        const matchGroup =
          selectedGroupKey === 'all' || item.groupKey === selectedGroupKey;
        const matchMajor =
          selectedMajors.length === 0 || selectedMajors.includes(item.major);
        return matchGroup && matchMajor;
      })
      .sort((a, b) => b.date.localeCompare(a.date));
  }, [allItems, selectedGroupKey, selectedMajors]);

  // 每个专业的匹配数（用于 Checkbox 旁显示计数）
  const majorCounts = useMemo(() => {
    const base =
      selectedGroupKey === 'all'
        ? allItems
        : allItems.filter((item) => item.groupKey === selectedGroupKey);
    const map: Record<string, number> = {};
    base.forEach((item) => {
      map[item.major] = (map[item.major] || 0) + 1;
    });
    return map;
  }, [selectedGroupKey]);

  // Checkbox 选项
  const majorOptions = loadMajors().map((m) => ({
    label: (
      <span>
        {m.name}
        <Text type="secondary" style={{ marginLeft: 4, fontSize: '0.8rem' }}>
          ({majorCounts[m.name] || 0})
        </Text>
      </span>
    ),
    value: m.name,
  }));

  // 切换筛选时回到第 1 页
  const handleGroupChange = (val: string) => {
    setSelectedGroupKey(val);
    setSelectedMajors([]);
    setCurrentPage(1);
  };

  const handleMajorsChange = (vals: string[]) => {
    setSelectedMajors(vals);
    setCurrentPage(1);
  };

  // 分页切片
  const paged = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, currentPage, pageSize]);
  const groupColor = (groupKey: string) => {
    if (groupKey === 'zhangxuefeng') return 'blue';
    if (groupKey === 'hangneiren') return 'purple';
    return 'default';
  };

  const isMobile =
    typeof window !== 'undefined' && window.innerWidth < 768;

  return (
    <div style={styles.page}>
      <Navbar />

      {/* 面包屑 */}
      <div style={styles.breadcrumbWrapper}>
        <Flex align="center" gap="small" style={styles.breadcrumb}>
          <Link to="/" style={styles.breadcrumbLink}>
            <HomeOutlined style={{ marginRight: 4, color: '#ff8400' }} />
            首页
          </Link>
          <Text style={styles.breadcrumbSep}>/</Text>
          <Text style={styles.breadcrumbCurrent}>全部内容</Text>
        </Flex>
      </div>

      {/* 主体：侧边栏 + 列表 */}
      <Flex
        style={styles.body}
        gap={24}
        vertical={isMobile}
        align="flex-start"
      >
        {/* ---- 左侧内容列表 ---- */}
        <div style={styles.content}>
          <div style={styles.resultHeader}>
            <Text style={styles.resultCount}>各专业升学就业指导视频总汇</Text>
          </div>

          {filtered.length === 0 ? (
            <Empty
              description="没有匹配的内容，请调整筛选条件"
              style={{ padding: '3rem 0' }}
            />
          ) : (
            <div style={styles.list}>
              {paged.map((item, index) => (
                <div
                  key={index}
                  style={styles.listItem}
                  onClick={() => window.open(item.url, '_blank')}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLElement).style.background = '#f5f5f5';
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLElement).style.background = '#fff';
                  }}
                >
                  <div style={styles.itemMain}>
                    <span style={styles.itemTitle}>{item.title}</span>
                    <Tag color={groupColor(item.groupKey)} style={{ flexShrink: 0 }}>
                      {getGroupName(item.groupKey).replace('【视频】', '')}
                    </Tag>
                  </div>
                  <div style={styles.itemMeta}>
                    <Tag style={{ flexShrink: 0, color: '#00a854' }}>{item.major}</Tag>
                    <Text type="secondary" style={{ fontSize: '0.8rem', whiteSpace: 'nowrap' }}>
                      {item.date}
                    </Text>
                  </div>
                </div>
              ))}
            </div>
          )}
          {filtered.length > 0 && (
            <Flex justify="center" style={{ marginTop: 24 }}>
              <Pagination
                current={currentPage}
                pageSize={pageSize}
                total={filtered.length}
                showSizeChanger
                showQuickJumper
                showTotal={(total) => `共 ${total} 条`}
                pageSizeOptions={['10', '20', '50', '100']}
                locale={{ items_per_page: '条/页' }}
                onChange={(page, size) => {
                  setCurrentPage(page);
                  setPageSize(size);
                }}
              />
            </Flex>
          )}
        </div>

        {/* ---- 右侧筛选面板 ---- */}
        <div style={styles.sidebar}>
          <Collapse
            defaultActiveKey={['group', 'major']}
            ghost
            style={{ background: 'transparent' }}
          >
            <Collapse.Panel
              key="group"
              header={<span style={styles.panelHeader}>按组别筛选</span>}
            >
              <Radio.Group
                value={selectedGroupKey}
                onChange={(e) => handleGroupChange(e.target.value)}
                style={{ width: '100%' }}
              >
                <Flex vertical gap="small">
                  <Radio value="all">全部</Radio>
                  {groups.map((g) => (
                    <Radio key={g.groupKey} value={g.groupKey}>
                      <Text
                        style={{
                          fontSize: '0.85rem',
                          maxWidth: 200,
                          display: 'inline-block',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                          verticalAlign: 'middle',
                        }}
                      >
                        {g.groupName.replace('【视频】', '')}
                      </Text>
                    </Radio>
                  ))}
                </Flex>
              </Radio.Group>
            </Collapse.Panel>
            <Collapse.Panel
              key="major"
              header={<span style={styles.panelHeader}>按专业筛选</span>}
            >
              <Checkbox.Group
                value={selectedMajors}
                onChange={(vals) => handleMajorsChange(vals as string[])}
                style={{ width: '100%' }}
              >
                <Flex vertical gap="small">
                  {majorOptions.map((opt) => (
                    <Checkbox key={opt.value} value={opt.value}>
                      {opt.label}
                    </Checkbox>
                  ))}
                </Flex>
              </Checkbox.Group>
              {selectedMajors.length > 0 && (
                <Text
                  type="secondary"
                  style={{ display: 'block', marginTop: 8, fontSize: '0.8rem', cursor: 'pointer' }}
                  onClick={() => { setSelectedMajors([]); setCurrentPage(1); }}
                >
                  清除专业筛选
                </Text>
              )}
            </Collapse.Panel>
          </Collapse>
        </div>
      </Flex>

      {/* 页脚 */}
      <Footer />
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  page: {
    fontFamily:
      '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    background: '#f5f5f5',
    color: '#333333',
    lineHeight: 1.6,
    minHeight: '100vh',
  },
  breadcrumbWrapper: {
    maxWidth: 1400,
    margin: '0 auto',
    padding: '1rem 2rem 0',
  },
  breadcrumb: {
    fontSize: '0.9rem',
  },
  breadcrumbLink: {
    color: '#333333',
    textDecoration: 'none',
  },
  breadcrumbSep: {
    color: '#333333',
    margin: '0 4px',
  },
  breadcrumbCurrent: {
    color: '#333333',
  },
  body: {
    display: 'flex',
    gap: 24,
    maxWidth: 1400,
    margin: '0 auto',
    padding: '1.5rem 2rem 3rem',
  },
  sidebar: {
    width: 280,
    flexShrink: 0,
    background: '#ffffff',
    borderRadius: 16,
    padding: '1rem 1.25rem',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
    border: '1px solid #d1d5db',
    position: 'sticky',
    top: 80,
    height: 'fit-content',
  },
  panelHeader: {
    fontSize: '1.05rem',
    fontWeight: 600,
    color: '#00a854',
  },
  content: {
    flex: 1,
    minWidth: 0,
    background: '#ffffff',
    borderRadius: 16,
    padding: '1.5rem',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
    border: '1px solid #d1d5db',
  },
  resultHeader: {
    paddingBottom: '0.75rem',
    marginBottom: '1rem',
    borderBottom: '2px solid transparent',
    borderImage: 'linear-gradient(135deg, #764ba2 0%, #667eea 100%) 1',
  },
  resultCount: {
    fontSize: '1.2rem',
    fontWeight: 600,
    color: '#00a854',
  },
  list: {
    display: 'flex',
    flexDirection: 'column',
  },
  listItem: {
    padding: '0.85rem 0.5rem',
    borderBottom: '1px solid #e8e8e8',
    cursor: 'pointer',
    transition: 'background 0.2s',
    borderRadius: 8,
  },
  itemMain: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '0.75rem',
  },
  itemTitle: {
    fontSize: '1.05rem',
    flex: 1,
    minWidth: 0,
  },
  itemMeta: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    marginTop: '0.5rem',
  },
};

export default Lists;
