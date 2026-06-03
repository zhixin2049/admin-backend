import React from 'react';
import { Tabs } from 'antd';
import { useNavigate } from 'react-router-dom';
import { useTabStore } from '../../store';

// ============================================================
// 多 Tab 标签页导航栏
// ============================================================

const TabsBar: React.FC = () => {
  const { tabs, activeKey, removeTab, setActiveKey } = useTabStore();
  const navigate = useNavigate();

  const handleEdit = (targetKey: React.MouseEvent | React.KeyboardEvent | string, action: 'add' | 'remove') => {
    if (action === 'remove' && typeof targetKey === 'string') {
      const prevActive = activeKey;
      removeTab(targetKey);
      // 如果关闭的是当前 Tab，需要跳转到新激活的 Tab
      const { tabs: newTabs, activeKey: newActive } = useTabStore.getState();
      if (prevActive === targetKey) {
        navigate(newActive);
      }
    }
  };

  const handleChange = (key: string) => {
    setActiveKey(key);
    navigate(key);
  };

  return (
    <div style={{ padding: '4px 16px 0', borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
      <Tabs
        type="editable-card"
        hideAdd
        activeKey={activeKey}
        onChange={handleChange}
        onEdit={handleEdit}
        size="small"
        items={tabs.map((tab) => ({
          key: tab.key,
          label: tab.label,
          closable: tab.closable,
        }))}
        style={{ marginBottom: 0 }}
      />
    </div>
  );
};

export default TabsBar;
