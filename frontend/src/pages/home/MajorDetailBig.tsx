import React, { useEffect, useState, useCallback } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Flex, Typography } from 'antd';
import { HomeOutlined } from '@ant-design/icons';
import Navbar from '../../components/home/Navbar';
import { loadMajorHome, type MajorHomeData } from './data';
import Footer from '../../components/home/Footer';

const { Text } = Typography;

// ============================================================
// 专业详情页（全屏展开版）— /major/:slug/big
// ============================================================

const styles: Record<string, React.CSSProperties> = {
  page: {
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    background: '#f5f5f5',
    color: '#333333',
    lineHeight: 1.6,
    minHeight: '100vh',
  },

  // ---- 面包屑 ----
  breadcrumbWrapper: {
    background: '#ffffff',
    borderBottom: '1px solid #d1d5db',
    padding: '0 2rem',
  },
  breadcrumb: {
    maxWidth: 1200,
    margin: '0 auto',
    padding: '0.6rem 0',
    fontSize: '0.85rem',
  },
  breadcrumbLink: { color: '#333333', textDecoration: 'none' },
  breadcrumbSep: { color: '#333333', margin: '0 4px' },
  breadcrumbCurrent: { color: '#333333' },

  // ---- Main 主体 ----
  main: {
    maxWidth: 1200,
    margin: '0 auto',
    padding: '2rem',
    display: 'flex',
    gap: '2rem',
    alignItems: 'flex-start',
  },

  // ---- 左侧主内容 ----
  contentArea: {
    flex: 1,
    minWidth: 0,
  },

  // ---- 视频占位风格标题 ----
  introCardTitle: {
    position: 'absolute' as const,
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    color: '#ffffff',
    fontSize: '1.5rem',
    fontWeight: 700,
    textAlign: 'center' as const,
    padding: '2rem',
    width: '100%',
    lineHeight: 1.4,
  },
  detailCardTitle: {
    display: 'flex',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    fontSize: '1.2rem',
    fontWeight: 600,
    color: '#ff8400',
    marginBottom: '1rem',
    paddingBottom: '0.5rem',
    borderBottom: '2px solid #d1d5db',
  },
  detailCardTime: {
    fontSize: '0.78rem',
    fontWeight: 400,
    color: '#999999',
    marginLeft: '1rem',
    whiteSpace: 'nowrap' as const,
  },

  // ---- 视频占位卡片 ----
  introCard: {
    borderRadius: 16,
    overflow: 'hidden',
    boxShadow: '0 4px 16px rgba(0, 0, 0, 0.12)',
    position: 'relative' as const,
    width: '100%',
    height: 80,
    marginBottom: '1.5rem',
    background: 'linear-gradient(135deg, #764ba2 0%, #667eea 100%)',
  },
  // ---- 富文本描述（career.html column-card 风格）----
  detailCard: {
    background: '#ffffff',
    borderRadius: 8,
    padding: '1.5rem',
    marginBottom: '1.5rem',
    boxShadow: '0 2px 4px rgba(0,0,0,0.08)',
    borderTop: '4px solid #00a854',
  },
  detailContent: {
    fontSize: '0.95rem',
    lineHeight: 1.8,
    color: '#333333',
  },

  // ---- 右侧目录导航 ----
  sidebar: {
    width: 240,
    flexShrink: 0,
    position: 'sticky' as const,
    top: 24,
    background: '#ffffff',
    borderRadius: 12,
    border: '1px solid #e5e7eb',
    padding: '1.25rem',
    boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
  },
  sidebarTitle: {
    fontSize: '0.95rem',
    fontWeight: 600,
    color: '#333333',
    marginBottom: '0.75rem',
    paddingBottom: '0.5rem',
    backgroundImage: 'linear-gradient(135deg, #764ba2 0%, #667eea 100%)',
    backgroundSize: '100% 2px',
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'bottom',
  },
  tocList: {
    listStyle: 'none',
    padding: 0,
    margin: 0,
  },
  tocItem: {
    padding: '0.4rem 0',
    fontSize: '0.9rem',
    color: '#555555',
    cursor: 'pointer',
    borderLeft: '2px solid transparent',
    paddingLeft: '0.75rem',
    transition: 'all 0.2s',
  },
  tocItemHover: {
    color: '#00a854',
    borderLeftColor: '#00a854',
  },

  // ---- 空状态 ----
  empty: {
    textAlign: 'center' as const,
    padding: '3rem 2rem',
    color: '#999999',
    fontSize: '1rem',
  },
  loading: {
    textAlign: 'center' as const,
    padding: '6rem 2rem',
    color: '#999999',
    fontSize: '1rem',
  },

};

const MajorDetailBig: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [data, setData] = useState<MajorHomeData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState('intro');

  const loadData = useCallback(() => {
    if (!slug) return;
    const home = loadMajorHome(slug);
    setData(home);
    setLoading(false);
  }, [slug]);

  useEffect(() => { loadData(); }, [loadData]);

  useEffect(() => {
    const handler = () => loadData();
    window.addEventListener('major-data-changed', handler);
    return () => window.removeEventListener('major-data-changed', handler);
  }, [loadData]);

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      // 微调偏移，避免 sticky navbar 遮挡
      const y = el.getBoundingClientRect().top + window.pageYOffset - 80;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  };

  if (loading) {
    return (
      <div style={styles.page}>
        <Navbar />
        <div style={styles.loading}>加载中...</div>
      </div>
    );
  }

  if (!data) {
    return (
      <div style={styles.page}>
        <Navbar />
        <div style={styles.breadcrumbWrapper}>
          <Flex align="center" gap="small" style={styles.breadcrumb}>
            <Link to="/" style={styles.breadcrumbLink}>
              <HomeOutlined style={{ marginRight: 4, color: '#ff8400' }} />
              首页
            </Link>
          </Flex>
        </div>
        <div style={styles.empty}>
          <p>该专业页面不存在</p>
          <Link to="/" style={{ color: '#ff8400', marginTop: '1rem', display: 'inline-block' }}>
            返回首页
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  // 向后兼容：优先用 descriptions 数组，fallback 到 description 单字符串
  const allDescriptions: { title: string; content: string; updatedAt?: string; isVisible?: boolean }[] = ((data as any).featuredCard.descriptions && (data as any).featuredCard.descriptions.length > 0)
    ? (data as any).featuredCard.descriptions
    : (data.featuredCard.description ? [{ title: '', content: data.featuredCard.description }] : []);
  // 仅显示 isVisible !== false 的卡片（null/undefined 视为 true）
  const descriptions = allDescriptions.filter((d: any) => d.isVisible !== false);
  const hasDetail = descriptions.length > 0;

  const formatTime = (iso?: string) => {
    if (!iso) return '';
    const d = new Date(iso);
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  };

  return (
    <div style={styles.page}>
      <style>{`
        html { scroll-behavior: smooth; }
      `}</style>
      <Navbar />

      {/* ---- 面包屑 ---- */}
      <div style={styles.breadcrumbWrapper}>
        <Flex align="center" gap="small" style={styles.breadcrumb}>
          <Link to="/" style={styles.breadcrumbLink}>
            <HomeOutlined style={{ marginRight: 4, color: '#ff8400' }} />
            首页
          </Link>
          <Text style={styles.breadcrumbSep}>/</Text>
          <Link to={`/major/${slug}`} style={styles.breadcrumbLink}>
            {data.majorName}
          </Link>
          <Text style={styles.breadcrumbSep}>/</Text>
          <Text style={styles.breadcrumbCurrent}>{data.featuredCard.boldTitle}</Text>
        </Flex>
      </div>

      {/* ---- 主体：左侧内容 + 右侧目录 ---- */}
      <div style={styles.main}>
        {/* ---- 左侧主内容 ---- */}
        <div style={styles.contentArea}>

          {/* 视频占位风格卡片 */}
          <div id="intro" style={styles.introCard}>
            <h2 style={styles.introCardTitle}>{data.featuredCard.boldTitle}</h2>
          </div>

          {/* 视频占位风格卡片 */}
          {hasDetail ? (
            descriptions.map((desc, idx) => (
              <div key={idx} id={`detail-${idx}`} style={styles.detailCard}>
                <h2 style={styles.detailCardTitle}>
                  <span>{desc.title || `详细介绍 ${idx + 1}`}</span>
                  {desc.updatedAt && (
                    <span style={styles.detailCardTime}>{formatTime(desc.updatedAt)}</span>
                  )}
                </h2>
                <div
                  style={styles.detailContent}
                  dangerouslySetInnerHTML={{ __html: desc.content }}
                />
              </div>
            ))
          ) : (
            <div id="detail-0" style={styles.detailCard}>
              <h2 style={styles.detailCardTitle}>详细介绍</h2>
              <div style={{ ...styles.detailContent, color: '#999999' }}>
                暂无详细介绍
              </div>
            </div>
          )}
        </div>

        {/* ---- 右侧目录导航 ---- */}
        <div style={styles.sidebar}>
          <div style={styles.sidebarTitle}>目录导航</div>
          <ul style={styles.tocList}>
            {/* 描述卡片 */}
            {descriptions.map((desc, idx) => {
              const sectionId = `detail-${idx}`;
              const isActive = activeSection === sectionId;
              const label = desc.title || `详细介绍 ${idx + 1}`;
              return (
                <li
                  key={sectionId}
                  style={{
                    ...styles.tocItem,
                    ...(isActive ? styles.tocItemHover : {}),
                  }}
                  onClick={() => { setActiveSection(sectionId); scrollTo(sectionId); }}
                  onMouseEnter={(e) => {
                    if (!isActive) {
                      (e.currentTarget as HTMLElement).style.color = '#00a854';
                      (e.currentTarget as HTMLElement).style.borderLeftColor = '#00a854';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) {
                      (e.currentTarget as HTMLElement).style.color = '#555555';
                      (e.currentTarget as HTMLElement).style.borderLeftColor = 'transparent';
                    }
                  }}
                >
                  {label}
                </li>
              );
            })}
          </ul>
        </div>
      </div>

      {/* ---- 页脚 ---- */}
      <footer style={styles.footer}>
        <p>高考志愿填报指南 - 从就业看专业，科学规划未来</p>
        <p style={{ marginTop: '0.5rem', opacity: 0.9 }}>
          本页面仅供志愿填报参考
        </p>
      </footer>
    </div>
  );
};

export default MajorDetailBig;
