import React, { useEffect, useState } from 'react';
import { Carousel as AntCarousel } from 'antd';
import { carouselApi } from '../../api';
import { mockCarousels } from '../../mock';
import type { Carousel as CarouselType } from '../../types';

// ============================================================
// 官网轮播图 — antd Carousel (arrows 样式)
// 同步预读 localStorage，首帧即显示图片，无占位闪烁
// ============================================================

// 同步预读 localStorage + mockCarousels 兜底，首帧即显示图片，无占位
function loadFromStorage(): CarouselType[] {
  try {
    const stored = localStorage.getItem('mock_carousels');
    if (stored) return JSON.parse(stored) as CarouselType[];
  } catch { /* ignore */ }
  return mockCarousels;
}

function getVisible(list: CarouselType[], majorId?: number): CarouselType[] {
  return list
    .filter((item) => {
      if (majorId !== undefined) {
        // 专业页轮播：category === 'major' 且 majorId 匹配
        return item.category === 'major' && item.majorId === majorId && item.isVisible;
      }
      // 首页轮播：category === 'index'
      return item.category === 'index' && item.isVisible;
    })
    .sort((a, b) => a.sortOrder - b.sortOrder);
}

interface CarouselProps {
  height?: number;
  /** 专业 ID：传入则只显示该专业的轮播图（category === 'major'） */
  majorId?: number;
}

const contentStyle: React.CSSProperties = {
  margin: 0,
  color: '#fff',
  textAlign: 'center',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
};

const titleStyle: React.CSSProperties = {
  fontSize: '2rem',
  fontWeight: 700,
  marginBottom: '0.75rem',
  letterSpacing: '2px',
  textShadow: '0 2px 8px rgba(0,0,0,0.3)',
};

const descStyle: React.CSSProperties = {
  fontSize: '1.1rem',
  fontWeight: 300,
  opacity: 0.9,
  textShadow: '0 1px 4px rgba(0,0,0,0.2)',
};

const FALLBACK_SLIDES = [
  { id: 0, bg: '#364d79', title: '高考志愿填报指南', desc: '从就业看专业，科学规划未来', linkUrl: '/' },
  { id: 1, bg: '#1a3a5c', title: '31种热门专业拆解', desc: '深入了解每个专业的就业前景与发展方向', linkUrl: '/major' },
  { id: 2, bg: '#2d5a4b', title: '院校全景查询', desc: '覆盖全国高校，一键查询院校实力与特色', linkUrl: '/college' },
  { id: 3, bg: '#5a3d6b', title: '历年分数线参考', desc: '精准数据支撑，科学填报志愿', linkUrl: '/volunteer' },
];

const Carousel: React.FC<CarouselProps> = ({ height = 400, majorId }) => {
  // 同步预读 localStorage，首帧即渲染真实数据
  const [slides, setSlides] = useState<CarouselType[]>(() => getVisible(loadFromStorage(), majorId));

  useEffect(() => {
    carouselApi.list().then((list) => setSlides(getVisible(list, majorId)));
  }, [majorId]);

  // 有数据 → 显示轮播图片
  if (slides.length > 0) {
    return (
      <AntCarousel arrows autoplay>
        {slides.map((slide) => (
          <div key={slide.id}>
            <a
              href={slide.linkUrl || '#'}
              target={slide.linkUrl && slide.linkUrl !== '/' ? '_blank' : undefined}
              rel={slide.linkUrl && slide.linkUrl !== '/' ? 'noopener noreferrer' : undefined}
              style={{ display: 'block' }}
            >
              <div
                style={{
                  height,
                  backgroundImage: `url(${slide.imageUrl})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                }}
              />
            </a>
          </div>
        ))}
      </AntCarousel>
    );
  }

  // 无数据 → 默认占位（首次使用或数据被清空时）
  return (
    <AntCarousel arrows autoplay>
      {FALLBACK_SLIDES.map((slide) => (
        <div key={slide.id}>
          <div
            style={{
              ...contentStyle,
              height,
              background: `linear-gradient(135deg, ${slide.bg}, ${slide.bg}dd)`,
            }}
          >
            <h3 style={titleStyle}>{slide.title}</h3>
            <p style={descStyle}>{slide.desc}</p>
          </div>
        </div>
      ))}
    </AntCarousel>
  );
};

export default Carousel;
