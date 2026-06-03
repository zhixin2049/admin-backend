import React from 'react';
import { Tooltip } from 'antd';
import { DoubleRightOutlined } from '@ant-design/icons';

interface ContentItem {
  title: string;
  url: string;
  date: string;
}

interface ContentListProps {
  title: string;
  moreUrl?: string;
  items: ContentItem[];
  /** 列表区最小行数：不足时空行补齐；默认不限制 */
  minItemCount?: number;
}

const ContentList: React.FC<ContentListProps> = ({ title, moreUrl, items, minItemCount }) => {
  const displayItems = minItemCount && items.length < minItemCount
    ? [...items, ...Array(minItemCount - items.length).fill(null)]
    : items;

  return (
    <div style={styles.container}>
      <h3 style={styles.header}>
        <span style={styles.title}>{title}</span>
        {moreUrl && (
          <a href={moreUrl} target="_blank" rel="noopener noreferrer" style={styles.moreLink}>
            更多
            <DoubleRightOutlined style={{ fontSize: '1.1rem', marginLeft: 4 }} />
          </a>
        )}
      </h3>
      <ul style={styles.list}>
        {displayItems.map((item, index) =>
          item ? (
            <li key={index} style={styles.listItem}>
              <Tooltip title={item.title} mouseEnterDelay={0.3}>
                <a href={item.url} target="_blank" rel="noopener noreferrer" style={styles.itemLink}>
                  {item.title}
                </a>
              </Tooltip>
              <span style={styles.date}>{item.date}</span>
            </li>
          ) : (
            <li key={`_pad_${index}`} style={styles.listItem}>
              <span style={{ ...styles.itemLink, opacity: 0, pointerEvents: 'none' as const }}>&nbsp;</span>
            </li>
          )
        )}
      </ul>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: {
    background: '#ffffff',
    borderRadius: 16,
    padding: '1.5rem',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
    border: '1px solid #d1d5db',
  },
  header: {
    color: '#00a854',
    fontSize: '1.3rem',
    marginBottom: '1rem',
    paddingBottom: '0.75rem',
    borderBottom: '2px solid transparent',
    borderImage: 'linear-gradient(135deg, #764ba2 0%, #667eea 100%) 1',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    flex: 1,
  },
  moreLink: {
    fontSize: '0.85rem',
    color: '#00a854',
    textDecoration: 'none',
    fontWeight: 'normal',
  },
  list: {
    listStyle: 'none',
    padding: 0,
    margin: 0,
  },
  listItem: {
    padding: '0.75rem 0',
    borderBottom: '1px solid #d1d5db',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  itemLink: {
    color: '#333333',
    textDecoration: 'none',
    flex: 1,
    fontSize: '0.95rem',
    lineHeight: '1.6',
    transition: 'color 0.3s',
    display: '-webkit-box',
    WebkitLineClamp: 1,
    WebkitBoxOrient: 'vertical',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    wordBreak: 'break-all',
  } as React.CSSProperties,
  date: {
    fontSize: '0.8rem',
    color: '#666666',
    marginLeft: '1rem',
    whiteSpace: 'nowrap',
    lineHeight: '1.6',
  },
};

export default ContentList;
