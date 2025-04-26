import {
  autoPlacement,
  autoUpdate,
  flip,
  offset,
  safePolygon,
  shift,
  useFloating,
} from '@floating-ui/react';
import type React from 'react';
import { useEffect, useRef, useState } from 'react';

interface ActionItem {
  label: string;
  icon?: React.ReactNode;
  handler: (selectionText: string) => Promise<string> | string;
}

interface FloatingToolbarWithPanelProps {
  actions: ActionItem[];
}

const FloatingToolbarWithPanel: React.FC<FloatingToolbarWithPanelProps> = ({
  actions,
}) => {
  const [open, setOpen] = useState(false);
  const [panelOpen, setPanelOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectionText, setSelectionText] = useState('');
  const [panelContent, setPanelContent] = useState<string>('');
  const [virtualReference, setVirtualReference] = useState<any>(null);

  const scopeRef = useRef<HTMLDivElement>(null);

  const toolbarFloating = useFloating({
    middleware: [offset(8), flip(), shift()],
    placement: 'top',
  });

  const panelFloating = useFloating({
    middleware: [offset(8), flip(), shift()],
    placement: 'bottom',
  });

  useEffect(() => {
    const handleMouseUp = () => {
      let selectedText = '';
      let virtualElement: any = null;
      const activeEl = document.activeElement as HTMLElement;

      // 判断在作用域内 node
      const isInScope = (node: Node | null) => {
        if (!scopeRef.current || !node) return false;
        if (node.nodeType === 1) {
          return scopeRef.current.contains(node as Node);
        } else {
          return scopeRef.current.contains(node.parentNode as Node);
        }
      };

      if (
        activeEl &&
        (activeEl.tagName === 'INPUT' || activeEl.tagName === 'TEXTAREA') &&
        isInScope(activeEl)
      ) {
        const input = activeEl as HTMLInputElement | HTMLTextAreaElement;
        const start = input.selectionStart;
        const end = input.selectionEnd;

        if (start !== null && end !== null && start !== end) {
          selectedText = input.value.substring(start, end);

          const rect = input.getBoundingClientRect();
          virtualElement = createVirtualElement({
            top: rect.top + rect.height / 2,
            bottom: rect.bottom,
            left: rect.left + rect.width / 2,
            right: rect.right,
            width: 0,
            height: 0,
            x: rect.left + rect.width / 2,
            y: rect.top + rect.height / 2,
            toJSON() {
              return {};
            },
          });
        }
      } else {
        const selection = window.getSelection();
        if (
          selection &&
          !selection.isCollapsed &&
          selection.rangeCount > 0 &&
          selection.toString().trim() !== ''
        ) {
          const range = selection.getRangeAt(0);

          if (!isInScope(selection.anchorNode)) {
            setOpen(false);
            setPanelOpen(false);
            return;
          }

          selectedText = selection.toString();
          virtualElement = createVirtualElement(range.getBoundingClientRect());
        }
      }

      if (selectedText && virtualElement) {
        setSelectionText(selectedText);
        setVirtualReference(virtualElement);

        toolbarFloating.refs.setPositionReference(virtualElement);
        panelFloating.refs.setPositionReference(virtualElement);

        setOpen(true);
        setPanelOpen(false);
        setPanelContent('');
      } else {
        setOpen(false);
        setPanelOpen(false);
      }
    };

    document.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('keyup', handleMouseUp);

    return () => {
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('keyup', handleMouseUp);
    };
  }, [toolbarFloating.refs, panelFloating.refs]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (scopeRef.current && !scopeRef.current.contains(e.target as Node)) {
        setOpen(false);
        setPanelOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleActionClick = async (action: ActionItem) => {
    if (!selectionText || !virtualReference) return;

    panelFloating.refs.setPositionReference(virtualReference);
    setPanelOpen(true);
    setPanelContent('');
    setLoading(true);

    const result = await Promise.resolve(action.handler(selectionText));

    setLoading(false);
    setPanelContent(result);
  };

  return (
    <div style={{ padding: '100px' }}>
      <h2>⚡ 浮动工具条面板完整版</h2>

      {/* 作用域容器 */}
      <div
        ref={scopeRef}
        style={{
          border: '2px dashed #4caf50',
          borderRadius: '8px',
          padding: '24px',
          minHeight: '250px',
          position: 'relative',
          marginBottom: '48px',
        }}
      >
        <textarea
          placeholder="在这里输入点什么并选中试试看..."
          style={{
            width: '100%',
            height: '80px',
            marginBottom: '20px',
            padding: '8px',
            fontSize: '16px',
          }}
        />
        <p>在这里选中普通文字，也可以触发工具条。</p>

        {/* 工具条 */}
        {open && (
          <div
            ref={toolbarFloating.refs.setFloating}
            style={{
              ...toolbarFloating.floatingStyles,
              background: '#333',
              color: '#fff',
              padding: '8px 12px',
              borderRadius: '6px',
              display: 'flex',
              gap: '8px',
              transition: 'opacity 0.2s ease',
              opacity: open ? 1 : 0,
              zIndex: 1000,
            }}
          >
            {actions.map((action, idx) => (
              <button
                key={idx}
                onClick={() => handleActionClick(action)}
                style={{
                  color: '#fff',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                {action.icon} {action.label}
              </button>
            ))}
          </div>
        )}

        {/* 面板 */}
        {panelOpen && (
          <div
            ref={panelFloating.refs.setFloating}
            style={{
              ...panelFloating.floatingStyles,
              background: '#fff',
              color: '#333',
              padding: '16px',
              border: '1px solid #ddd',
              borderRadius: '6px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
              width: '280px',
              transition: 'opacity 0.2s ease',
              opacity: panelOpen ? 1 : 0,
              zIndex: 999,
            }}
          >
            {loading ? (
              <div style={{ textAlign: 'center', color: '#999' }}>
                Loading...
              </div>
            ) : (
              <>
                <h4>执行结果🎯</h4>
                <div
                  style={{
                    marginTop: '8px',
                    color: '#555',
                    wordWrap: 'break-word',
                  }}
                >
                  {panelContent || '无内容'}
                </div>
              </>
            )}
          </div>
        )}
      </div>

      <div style={{ color: '#555' }}>
        <p>这里是外部区域，选中不会触发工具条哦～。</p>
      </div>
    </div>
  );
};

// 创建虚拟定位元素
function createVirtualElement(rect: DOMRect): VirtualElement {
  return {
    getBoundingClientRect: () => rect,
    contextElement: null,
  };
}

interface VirtualElement {
  getBoundingClientRect(): DOMRect;
  contextElement?: Element | null;
}

export default FloatingToolbarWithPanel;
