import React from 'react';
import { Link, useParams } from 'react-router-dom';
import { Flex, Typography } from 'antd';
import { HomeOutlined } from '@ant-design/icons';
import Navbar from '../../components/home/Navbar';
import Footer from '../../components/home/Footer';

const { Text } = Typography;

// ============================================================
// 视频详情页 — 从 localStorage 动态加载视频数据
// ============================================================

interface VideoDataFromStore {
  title: string;
  playerTitle?: string;
  bilibiliUrl?: string;
  organizer: string;
  organizedDate: string;
  description: string;
  groupName?: string;
  majorName?: string;
}

const loadVideoById = (id: number): VideoDataFromStore | null => {
  try {
    const raw = localStorage.getItem('mock_videos');
    if (!raw) return null;
    const videos = JSON.parse(raw);
    const v = videos.find((item: Record<string, unknown>) => item.id === id);
    if (!v) return null;
    return {
      title: (v.title as string) || '',
      playerTitle: (v.playerTitle as string) || (v.title as string) || '',
      bilibiliUrl: (v.bilibiliUrl as string) || '',
      organizer: (v.organizer as string) || '',
      organizedDate: (v.organizedDate as string) || '',
      description: (v.description as string) || '',
      groupName: (v.groupName as string) || '',
      majorName: (v.majorName as string) || '',
    };
  } catch {
    return null;
  }
};

const VIDEO_BG_GRADIENT = 'linear-gradient(135deg, #764ba2 0%, #667eea 100%)';

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
    background: '#ffffff',
    borderBottom: '1px solid #d1d5db',
    padding: '0 2rem',
    position: 'sticky' as const,
    top: 70,
    zIndex: 99,
  },
  breadcrumb: {
    maxWidth: 1400,
    margin: '0 auto',
    padding: '0.6rem 0',
    fontSize: '0.85rem',
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
  container: {
    maxWidth: 1400,
    margin: '0 auto',
    padding: '2rem',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '2rem',
    alignItems: 'start',
  },
  infoCard: {
    background: '#ffffff',
    borderRadius: 16,
    padding: '2rem',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
    border: '1px solid #d1d5db',
    position: 'sticky' as const,
    top: 124,
  },
  pageTitle: {
    fontSize: '1.5rem',
    fontWeight: 700,
    color: '#00a854',
    marginBottom: '1.5rem',
    lineHeight: 1.4,
  },
  meta: {
    display: 'flex',
    gap: '1.5rem',
    color: '#666666',
    fontSize: '0.85rem',
    marginBottom: '1.5rem',
    paddingBottom: '1.5rem',
    borderBottom: '1px solid #d1d5db',
  },
  desc: {
    fontSize: '0.9rem',
    color: '#333333',
    lineHeight: 1.8,
  },
  descP: {
    marginBottom: '0.75rem',
  },
  videoColumn: {
    display: 'flex',
    flexDirection: 'column' as const,
  },
  videoPlayer: {
    borderRadius: 16,
    overflow: 'hidden',
    boxShadow: '0 4px 16px rgba(0, 0, 0, 0.12)',
    position: 'relative' as const,
    width: '100%',
    paddingBottom: '56.25%',
    height: 0,
    cursor: 'pointer',
    transition: 'opacity 0.2s',
  },
  videoPlayerTitle: {
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
  btnWrapper: {
    textAlign: 'center' as const,
    marginTop: '1rem',
  },
  btnView: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.5rem',
    background: '#ff8400',
    color: 'white',
    padding: '0.6rem 1.2rem',
    borderRadius: 20,
    textDecoration: 'none',
    fontSize: '0.9rem',
    fontWeight: 500,
    transition: 'all 0.3s',
  },
  notFound: {
    textAlign: 'center' as const,
    padding: '4rem 2rem',
    color: '#999999',
    fontSize: '1.1rem',
  },
  // 响应式
  gridMobile: {
    display: 'grid',
    gridTemplateColumns: '1fr',
    gap: '1rem',
    alignItems: 'start',
  },
  infoCardMobile: {
    background: '#ffffff',
    borderRadius: 16,
    padding: '1.5rem',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
    border: '1px solid #d1d5db',
    position: 'static' as const,
  },
  containerMobile: {
    maxWidth: 1400,
    margin: '0 auto',
    padding: '1rem',
  },
  pageTitleMobile: {
    fontSize: '1.2rem',
    fontWeight: 700,
    color: '#00a854',
    marginBottom: '1.5rem',
    lineHeight: 1.4,
  },
  metaMobile: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '0.3rem',
    color: '#666666',
    fontSize: '0.85rem',
    marginBottom: '1.5rem',
    paddingBottom: '1.5rem',
    borderBottom: '1px solid #d1d5db',
  },
};

const VideoDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [isMobile, setIsMobile] = React.useState(false);
  const [video, setVideo] = React.useState<VideoDataFromStore | null>(null);
  const [loaded, setLoaded] = React.useState(false);

  React.useEffect(() => {
    const check = () => setIsMobile(window.innerWidth <= 900);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  React.useEffect(() => {
    if (id) {
      const numId = parseInt(id, 10);
      setVideo(loadVideoById(numId));
      setLoaded(true);
    }
  }, [id]);

  const c = isMobile ? 'mobile' : 'desktop';

  if (!loaded) {
    return <div style={styles.page} />;
  }

  if (!video) {
    return (
      <div style={styles.page}>
        <Navbar />
        <div style={styles.breadcrumbWrapper}>
          <Flex align="center" gap="small" style={styles.breadcrumb}>
            <Link to="/" style={styles.breadcrumbLink}>
              <HomeOutlined style={{ marginRight: 4, color: '#ff8400' }} />
              首页
            </Link>
            <Text style={styles.breadcrumbSep}>/</Text>
            <Link to="/videos" style={styles.breadcrumbLink}>
              全部内容
            </Link>
          </Flex>
        </div>
        <div style={styles.notFound}>
          <p>视频不存在或已被下架</p>
          <Link to="/videos" style={{ color: '#ff8400', marginTop: '1rem', display: 'inline-block' }}>
            返回全部内容列表
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  const displayTitle = video.playerTitle || video.title;
  const displayUrl = video.bilibiliUrl || '';

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
          <Link to="/videos" style={styles.breadcrumbLink}>
            全部内容
          </Link>
          <Text style={styles.breadcrumbSep}>/</Text>
          <Text style={styles.breadcrumbCurrent}>{displayTitle}</Text>
        </Flex>
      </div>

      {/* 主体：双栏布局 */}
      <div style={c === 'mobile' ? styles.containerMobile : styles.container}>
        <div style={c === 'mobile' ? styles.gridMobile : styles.grid}>
          {/* 左栏：视频播放器 + 按钮 */}
          <div style={styles.videoColumn}>
            <a
              href={displayUrl || undefined}
              target={displayUrl ? '_blank' : undefined}
              rel={displayUrl ? 'noopener noreferrer' : undefined}
              style={displayUrl ? { ...styles.videoPlayer, background: VIDEO_BG_GRADIENT } : { ...styles.videoPlayer, background: VIDEO_BG_GRADIENT, cursor: 'default' }}
            >
              <div style={styles.videoPlayerTitle}>{displayTitle}</div>
            </a>
            {displayUrl && (
              <div style={styles.btnWrapper}>
                <a
                  href={displayUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={styles.btnView}
                >
                  查看原视频 ›
                </a>
              </div>
            )}
          </div>

          {/* 右栏：视频信息 */}
          <div style={c === 'mobile' ? styles.infoCardMobile : styles.infoCard}>
            <h1 style={c === 'mobile' ? styles.pageTitleMobile : styles.pageTitle}>
              【视频】升学就业方案(文字版)
            </h1>
            <div style={c === 'mobile' ? styles.metaMobile : styles.meta}>
              <span>整理人：{video.organizer}</span>
              <span>整理日期：{video.organizedDate}</span>
            </div>
            <div
              style={styles.desc}
              dangerouslySetInnerHTML={{
                __html: video.description || '<p style="color:#999999">暂无详细描述</p>',
              }}
            />
          </div>
        </div>
      </div>

      {/* 页脚 */}
      <Footer />
    </div>
  );
};

export default VideoDetail;
