import React, { useState, useEffect } from 'react';
import '@wangeditor/editor/dist/css/style.css';
import { Editor, Toolbar } from '@wangeditor/editor-for-react';
import type { IDomEditor, IEditorConfig, IToolbarConfig } from '@wangeditor/editor';

// ============================================================
// WangEditor 富文本编辑器，兼容 antd Form.Item 的 value/onChange
// ============================================================

interface RichTextEditorProps {
  value?: string;
  onChange?: (html: string) => void;
  placeholder?: string;
  style?: React.CSSProperties;
}

const RichTextEditor: React.FC<RichTextEditorProps> = ({ value, onChange, placeholder, style }) => {
  const [editor, setEditor] = useState<IDomEditor | null>(null);

  const toolbarConfig: Partial<IToolbarConfig> = {};
  const editorConfig: Partial<IEditorConfig> = {
    placeholder: placeholder || '请输入内容...',
    autoFocus: false,
  };

  // 编辑器销毁时清理
  useEffect(() => {
    return () => {
      if (editor) editor.destroy();
    };
  }, [editor]);

  // 当外部 value 变化时（如 form.setFieldsValue），同步到编辑器
  useEffect(() => {
    if (editor && value !== undefined) {
      const currentHtml = editor.getHtml();
      if (currentHtml !== value) {
        editor.setHtml(value);
      }
    }
  }, [value, editor]);

  return (
    <div style={{ border: '1px solid #d9d9d9', borderRadius: 6, ...style }}>
      <Toolbar
        editor={editor}
        defaultConfig={toolbarConfig}
        mode="default"
        style={{ borderBottom: '1px solid #d9d9d9' }}
      />
      <Editor
        defaultConfig={editorConfig}
        value={value || ''}
        onCreated={(ed) => {
          setEditor(ed);
          // 初始化时把已有内容同步回 Form，防止 validateFields 丢失 description
          if (value) onChange?.(value);
        }}
        onChange={(e) => onChange?.(e.getHtml())}
        mode="default"
        style={{ height: 360, overflowY: 'hidden' }}
      />
    </div>
  );
};

export default RichTextEditor;
