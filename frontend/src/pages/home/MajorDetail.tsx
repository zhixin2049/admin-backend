import React, { useEffect, useState, useMemo } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { Flex, Typography } from 'antd';
import { HomeOutlined } from '@ant-design/icons';
import Navbar from '../../components/home/Navbar';
import ContentList from '../../components/home/ContentList';
import { loadMajorHome, loadMajorVideos, type MajorHomeData, type ContentItem } from './data';
import Footer from '../../components/home/Footer';

const { Text } = Typography;

// ---- 罗马数字映射 ----
const ROMAN = ['', 'I', 'II', 'III', 'IV', 'V', 'VI'];

// ---- 卡片图标颜色映射 ----
const ICON_STYLES: Record<number, { bg: string; color: string }> = {
  1: { bg: '#e8f0fc', color: '#1890ff' },
  2: { bg: '#e8f5e9', color: '#52c41a' },
  3: { bg: '#fff3e0', color: '#ff8400' },
  4: { bg: '#f3e5f5', color: '#722ed1' },
  5: { bg: '#e0f2f1', color: '#00695c' },
  6: { bg: '#ffebee', color: '#c62828' },
};

const BANNER_BG = 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)';

// ============================================================
// 专业主页 — 仿 main.html 布局
// ============================================================

const styles: Record<string, React.CSSProperties> = {
  page: {
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    background: '#f5f5f5',
    color: '#333333',
    lineHeight: 1.6,
    minHeight: '100vh',
  },

  // ---- Header Banner ----
  banner: {
    background: BANNER_BG,
    color: 'white',
    padding: '3rem 2rem',
    textAlign: 'center' as const,
    minHeight: 210,
    display: 'flex',
    flexDirection: 'column' as const,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bannerTitle: {
    fontSize: '2.5rem',
    fontWeight: 700,
    marginBottom: '0.5rem',
    textShadow: '2px 2px 4px rgba(0,0,0,0.5)',
  },
  bannerSub: {
    fontSize: '1.1rem',
    opacity: 0.95,
    maxWidth: 600,
    margin: '0 auto',
    textShadow: '1px 1px 3px rgba(0,0,0,0.5)',
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

  // ---- Main ----
  main: {
    maxWidth: 1200,
    margin: '0 auto',
    padding: '3rem 2rem',
  },

  // ---- 大标题 ----
  sectionTitle: {
    textAlign: 'center' as const,
    marginBottom: '2.5rem',
  },
  sectionTitleH2: {
    fontSize: '1.75rem',
    color: '#00a854',
    marginBottom: '0.5rem',
  },
  sectionTitleP: { color: '#666666' },

  // ---- 分隔大标题 ----
  sectionBanner: {
    textAlign: 'center' as const,
    margin: '2.5rem 0',
    position: 'relative' as const,
  },
  sectionBannerH2: {
    fontSize: '1.75rem',
    color: '#00a854',
    fontWeight: 600,
    display: 'inline-flex',
    alignItems: 'center',
    gap: '1rem',
  },
  sectionBannerLine: {
    flex: 'none',
    width: 200,
    height: 2,
    background: 'linear-gradient(90deg, transparent, #d1d5db, transparent)',
  },

  // ---- Top Section: 左大卡片 + 右内容列表 ----
  topSection: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '1.5rem',
    marginBottom: '1.5rem',
  },

  // ---- 左侧大卡片 ----
  featuredCard: {
    background: '#ffffff',
    borderRadius: 16,
    padding: '2rem',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.08)',
    border: '1px solid #d1d5db',
    height: 360,
    overflow: 'hidden',
    cursor: 'pointer',
  },
  featuredHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    marginBottom: '1rem',
    flexWrap: 'wrap' as const,
  },
  featuredIcon: {
    width: 42,
    height: 42,
    borderRadius: 10,
    background: '#e8f0fc',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '1.3rem',
    flexShrink: 0,
  },
  featuredTitle: {
    fontSize: '1.3rem',
    fontWeight: 600,
    color: '#00a854',
    lineHeight: 1.4,
  },
  featuredDesc: {
    color: '#333333',
    fontSize: '0.95rem',
    lineHeight: 1.7,
    whiteSpace: 'pre-line' as const,
  },
  cardIntro: {
    color: '#555555',
    fontSize: '0.95rem',
    lineHeight: 1.6,
    marginBottom: '1rem',
    whiteSpace: 'pre-line' as const,
  },
  featuredTags: {
    display: 'flex',
    flexWrap: 'wrap' as const,
    gap: '0.5rem',
    marginTop: '1rem',
  },
  tag: {
    background: 'linear-gradient(135deg, #764ba2 0%, #667eea 100%)',
    color: 'white',
    padding: '0.25rem 0.75rem',
    borderRadius: 20,
    fontSize: '0.8rem',
  },

  // ---- 右侧内容列表（高度由外层 div 控制）----

  // ---- Bottom Section: ColumnCards 3-column grid ----
  bottomSection: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '1.5rem',
    marginBottom: '1.5rem',
    alignItems: 'stretch',
  },

  // ---- 单个 ColumnCard ----
  columnCard: {
    background: '#ffffff',
    borderRadius: 16,
    padding: '1.5rem',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.08)',
    border: '1px solid #d1d5db',
    display: 'flex',
    flexDirection: 'column' as const,
    cursor: 'default' as const,
  },
  cardHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    marginBottom: '1rem',
  },
  cardIcon: {
    width: 36,
    height: 36,
    borderRadius: 8,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '0.9rem',
    fontWeight: 700,
    flexShrink: 0,
  },
  cardTitle: {
    fontSize: '0.95rem',
    fontWeight: 600,
    color: '#00a854',
    margin: 0,
  },
  cardDesc: {
    color: '#333333',
    fontSize: '0.95rem',
    lineHeight: 1.7,
    flex: 1,
    whiteSpace: 'pre-line' as const,
  },

  // ---- 空状态 / 加载中 ----
  empty: {
    textAlign: 'center' as const,
    padding: '4rem 2rem',
    color: '#999999',
    fontSize: '1.1rem',
  },
  loading: {
    textAlign: 'center' as const,
    padding: '6rem 2rem',
    color: '#999999',
    fontSize: '1rem',
  },
};

// ---- 响应式 ----
const mq = '@media (max-width: 900px)';
const mq2 = '@media (max-width: 600px)';

const responsiveStyles = `
  @media (max-width: 900px) {
    .major-detail .top-section { grid-template-columns: 1fr; }
    .major-detail .bottom-section { grid-template-columns: 1fr; }
    .major-detail .banner-title { font-size: 1.75rem; }
    .major-detail .banner { padding: 2rem 1.5rem; }
    .major-detail .main { padding: 2rem 1rem; }
  }
`;

const MajorDetail: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [data, setData] = useState<MajorHomeData | null>(null);
  const [videos, setVideos] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = () => {
    if (!slug) return;
    const home = loadMajorHome(slug);
    setData(home);
    if (home) {
      setVideos(loadMajorVideos(home.majorId));
    }
    setLoading(false);
  };

  useEffect(() => { loadData(); }, [slug]);

  // 监听管理后台的 major / majorhome 变更
  useEffect(() => {
    const handler = () => loadData();
    window.addEventListener('major-data-changed', handler);
    return () => window.removeEventListener('major-data-changed', handler);
  }, [slug]);

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

  // 构建 FeaturedCard 完整标题
  const featTitle = data.featuredCard.boldTitle
    ? `${data.featuredCard.boldTitle} ${data.featuredCard.normalTitle}`
    : (data.featuredCard.normalTitle || data.majorName);

  return (
    <div style={styles.page} className="major-detail">
      <style>{responsiveStyles}</style>
      <Navbar />


      {/* ========== 静态渐变占位 ========== */}
      <div style={{
        background: 'linear-gradient(135deg, #764ba2 0%, #667eea 100%)',
        height: 210,
        display: 'flex',
        flexDirection: 'column' as const,
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,
      }}>
        <div style={{
          color: '#ffffff',
          fontSize: '2rem',
          fontWeight: 700,
          textShadow: '2px 2px 4px rgba(0,0,0,0.5)',
        }}>
          {data.majorName}
        </div>
        <div style={{
          color: 'rgba(255,255,255,0.85)',
          fontSize: '1.35rem',
          textShadow: '1px 1px 3px rgba(0,0,0,0.5)',
          maxWidth: 600,
          padding: '0 2rem',
        }}>
          {data.majorDesc || ''}
        </div>
      </div>

      {/* ========== 面包屑 ========== */}
      <div style={styles.breadcrumbWrapper}>
        <Flex align="center" gap="small" style={styles.breadcrumb}>
          <Link to="/" style={styles.breadcrumbLink}>
            <HomeOutlined style={{ marginRight: 4, color: '#ff8400' }} />
            首页
          </Link>
          <Text style={styles.breadcrumbSep}>/</Text>
          <Text style={styles.breadcrumbCurrent}>{data.majorName}</Text>
        </Flex>
      </div>

      {/* ========== 主体内容 ========== */}
      <div style={styles.main} className="main">

        {/* ---- 第一行：左侧大卡片 + 右侧内容列表 ---- */}
        <div style={styles.topSection} className="top-section">
          {/* 左侧大卡片 */}
          {data.featuredCard.isVisible !== false && (
          <div style={styles.featuredCard} onClick={() => window.open(`/major/${slug}/big`, '_blank', 'noopener,noreferrer')}>
            <div style={styles.featuredHeader}>
              {data.featuredCard.icon && (
                <div style={styles.featuredIcon}>{data.featuredCard.icon}</div>
              )}
              <span style={styles.featuredTitle}>
                {data.featuredCard.boldTitle ? (
                  <>
                    <b>{data.featuredCard.boldTitle}</b> {data.featuredCard.normalTitle}
                  </>
                ) : (
                  data.featuredCard.normalTitle || data.majorName
                )}
              </span>
            </div>
            {data.featuredCard.cardIntro && (
              <div style={styles.cardIntro}>{data.featuredCard.cardIntro}</div>
            )}
            {data.featuredCard.tags && data.featuredCard.tags.length > 0 && (
              <div style={styles.featuredTags}>
                {data.featuredCard.tags.map((t, i) => (
                  <span key={i} style={styles.tag}>{t}</span>
                ))}
              </div>
            )}
          </div>
          )}

          {/* 右侧内容列表：该专业相关视频 */}
          <div style={{ height: 360, overflow: 'hidden' }}>
            <ContentList
              title="相关视频"
              moreUrl="/videos"
              items={videos.map((v) => ({ title: v.title, url: v.url, date: v.date }))}
              minItemCount={5}
            />
          </div>
        </div>

        {/* ---- 分隔大标题 ---- */}
        {data.columnCards.length > 0 && (
          <div style={styles.sectionBanner}>
            <h2 style={styles.sectionBannerH2}>
              <span style={styles.sectionBannerLine} />
              详细了解{data.majorName}
              <span style={styles.sectionBannerLine} />
            </h2>
          </div>
        )}

        {/* ---- 第二行：ColumnCards 3 列网格 ---- */}
        {data.columnCards.length > 0 && (
          <div style={styles.bottomSection} className="bottom-section">
            {data.columnCards.map((card, idx) => {
              const cs = ICON_STYLES[card.sortOrder] || ICON_STYLES[1];
              const cardNum = idx + 1;
              const cardStyle: React.CSSProperties = { ...styles.columnCard, textDecoration: 'none', color: 'inherit' };
              if (card.sortOrder === 6) {
                cardStyle.gridRow = '3';
                cardStyle.gridColumn = '1';
              }
              return (
                <a
                  key={card.id}
                  href={`/major/${data.slug}/${cardNum}`}
                  onClick={(e) => {
                    e.preventDefault();
                    window.open(`/major/${data.slug}/${cardNum}`, '_blank', 'noopener,noreferrer');
                  }}
                  style={cardStyle}
                >
                  <div style={styles.cardHeader}>
                    <div style={{ ...styles.cardIcon, background: cs.bg, color: cs.color }}>
                      {ROMAN[card.sortOrder] || 'I'}
                    </div>
                    <h3 style={styles.cardTitle}>{card.title}</h3>
                  </div>
                  {card.cardIntro && (
                    <p style={{ color: '#666', fontSize: '0.9rem', lineHeight: 1.6, marginBottom: '0.75rem' }}>
                      {card.cardIntro}
                    </p>
                  )}
                </a>
              );
            })}
          </div>
        )}

      </div>

      {/* ========== 页脚 ========== */}
      <Footer />
    </div>
  );
};

export default MajorDetail;
