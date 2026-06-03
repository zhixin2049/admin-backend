import React, { useEffect, useState } from 'react';
import { loadFooterText } from '../../pages/home/data';

// ============================================================
// 官网共享 Footer 组件（从 localStorage 动态读取页脚数据）
// ============================================================

const styles: Record<string, React.CSSProperties> = {
  footer: {
    background: '#1a1a2e',
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'center',
    padding: '2.5rem 2rem',
    marginTop: '3rem',
    fontSize: '0.875rem',
  },
  text: {
    margin: 0,
  },
};

const Footer: React.FC = () => {
  const [footerText, setFooterText] = useState(loadFooterText());

  const refresh = () => setFooterText(loadFooterText());

  useEffect(() => {
    window.addEventListener('footer-data-changed', refresh);
    return () => window.removeEventListener('footer-data-changed', refresh);
  }, []);

  return (
    <footer style={styles.footer}>
      <p style={styles.text}>{footerText || '联系站长：18521031173 | ©2026复现本 | 沪ICP备19026706号-6'}</p>
    </footer>
  );
};

export default Footer;
