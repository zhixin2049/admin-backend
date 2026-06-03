import React, { useState, useEffect } from 'react';
import { Button } from 'antd';
import Navbar from '../../components/home/Navbar';
import Carousel from '../../components/home/Carousel';
import MajorCard from '../../components/home/MajorCard';
import ContentList from '../../components/home/ContentList';
import { loadMajors, getHomeLists } from './data';
import Footer from '../../components/home/Footer';
import { DownOutlined, UpOutlined } from '@ant-design/icons';

// ============================================================
// 网站首页 - 高考志愿填报指南
// ============================================================

const COLLAPSE_FROM = 18; // 默认显示前 18 个

const Home: React.FC = () => {
  const [expanded, setExpanded] = useState(false);
  const [homeLists, setHomeLists] = useState(getHomeLists());
  const [majors, setMajors] = useState(loadMajors());

  const refreshData = () => {
    setHomeLists(getHomeLists());
    setMajors(loadMajors());
  };

  useEffect(() => { refreshData(); }, []);

  // 监听视频 / 专业数据变更事件
  useEffect(() => {
    window.addEventListener('video-data-changed', refreshData);
    window.addEventListener('major-data-changed', refreshData);
    return () => {
      window.removeEventListener('video-data-changed', refreshData);
      window.removeEventListener('major-data-changed', refreshData);
    };
  }, []);

  const visibleMajors = expanded
    ? majors
    : majors.slice(0, COLLAPSE_FROM);

  return (
    <div style={styles.page}>
      {/* 导航栏 */}
      <Navbar />

      {/* 轮播图 */}
      <Carousel height={400} />

      {/* 专业大类区域 */}
      <section style={styles.majorsSection}>
        <div style={styles.sectionHeader}>
          <h2 style={styles.sectionTitle}>
            31种热门专业大类拆解
          </h2>
        </div>

        {/* 专业卡片网格 */}
        <div style={styles.majorsGrid}>
          {visibleMajors.map((major) => (
            <MajorCard
              key={major.id}
              major={major}
              onClick={() => window.open(`/major/${major.slug}`, '_blank')}
            />
          ))}
        </div>

        {/* 展开/收起按钮 */}
        <div style={styles.toggleWrapper}>
          <Button
            style={styles.toggleBtn}
            onClick={() => setExpanded(!expanded)}
          >
            {expanded ? '收起' : '查看全部'}
            {expanded ? (
              <UpOutlined style={{ marginLeft: 8 }} />
            ) : (
              <DownOutlined style={{ marginLeft: 8 }} />
            )}
          </Button>
        </div>
      </section>

      {/* 内容列表区域 */}
      <section style={styles.contentSection}>
        <div style={styles.contentGrid}>
          {homeLists.map((list, idx) => (
            <ContentList
              key={idx}
              title={list.title}
              moreUrl={list.moreUrl}
              items={list.items}
            />
          ))}
        </div>
      </section>

      {/* 页脚 */}
      <Footer />
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  page: {
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    background: '#f5f5f5',
    color: '#333333',
    lineHeight: 1.6,
    minHeight: '100vh',
  },
  majorsSection: {
    maxWidth: 1400,
    margin: '0 auto',
    padding: '4rem 2rem',
  },
  sectionHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '2rem',
  },
  sectionTitle: {
    fontSize: '1.75rem',
    fontWeight: 600,
    color: '#00a854',
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    position: 'relative',
    paddingBottom: '0.75rem',
    margin: 0,
  },
  majorsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(6, 1fr)',
    gap: '0.75rem',
  },
  toggleWrapper: {
    display: 'flex',
    justifyContent: 'center',
    marginTop: '1.5rem',
  },
  toggleBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    padding: '0.75rem 1.5rem',
    border: 'none',
    background: 'linear-gradient(135deg, #764ba2 0%, #667eea 100%)',
    color: '#ffffff',
    borderRadius: 25,
    fontSize: '0.95rem',
    fontWeight: 500,
    cursor: 'pointer',
    height: 'auto',
  },
  contentSection: {
    maxWidth: 1400,
    margin: '0 auto',
    padding: '0 2rem 3rem',
  },
  contentGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '1.5rem',
  },
};

export default Home;
