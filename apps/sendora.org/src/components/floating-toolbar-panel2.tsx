import { useSelectionWithFloating } from '@/hooks/useSelectionWithFloating';
import type React from 'react';
import { useEffect } from 'react';

interface ActionItem {
  label: string;
  icon?: React.ReactNode;
  handler: (selectionText: string) => Promise<string> | string;
}

interface FloatingToolbarWithPanelProps {
  //   actions: ActionItem[];
  actions: ActionItem[] | ((selectionText: string) => ActionItem[]);

  children: React.ReactNode;
}

const FloatingToolbarWithPanel: React.FC<FloatingToolbarWithPanelProps> = ({
  actions,
  children,
}) => {
  const {
    scopeRef,
    toolbarFloating,
    panelFloating,
    open,
    panelOpen,
    selectionText,
    loading,
    panelContent,
    setPanelOpen,
    handleSelection,
    handleActionClick,
  } = useSelectionWithFloating();

  useEffect(() => {
    const handleUp = () => handleSelection();
    document.addEventListener('mouseup', handleUp);
    document.addEventListener('keyup', handleUp);

    const handleClickOutside = (e: MouseEvent) => {
      if (scopeRef.current && !scopeRef.current.contains(e.target as Node)) {
        // setPanelOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('mouseup', handleUp);
      document.removeEventListener('keyup', handleUp);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [handleSelection, scopeRef, setPanelOpen]);

  const activeElement = document.activeElement;
  const pointerTarget = window.getSelection()?.anchorNode?.parentElement;

  const computedActions =
    typeof actions === 'function' ? actions(selectionText) : actions;
  if (
    panelFloating.refs.floating.current &&
    pointerTarget &&
    panelFloating.refs.floating.current.contains(pointerTarget)
  ) {
    return; // 直接退出，不处理 selection
  }

  return (
    <div>
      <div
        ref={scopeRef}
        style={{
          minHeight: '250px',
          marginBottom: '48px',
          position: 'relative',
        }}
      >
        {children}

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
              zIndex: 1000,
            }}
          >
            {computedActions.map((action, idx) => (
              <button
                key={idx}
                onMouseDown={(e) => e.preventDefault()} // ⭐ Prevent blurring of selection.
                onClick={() => handleActionClick(action.handler)}
                style={{
                  background: 'none',
                  color: '#fff',
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

        {panelOpen && (
          <div
            ref={panelFloating.refs.setFloating}
            onMouseDown={(e) => e.preventDefault()}
            className="bg-[#fff] text-[#333] dark:bg-[#333] dark:text-[#fff] border border-solid border-gray-300  dark:border-0"
            style={{
              ...panelFloating.floatingStyles,
              padding: '16px',
              boxShadow: '0 2px 10px rgba(0, 0, 0, 0.2)',
              borderRadius: '8px',
              zIndex: 999,
              width: '280px',
            }}
          >
            {loading ? (
              <div style={{ textAlign: 'center', color: '#aaa' }}>
                Loading...
              </div>
            ) : (
              <>
                <h4>🎯 </h4>
                <div style={{ marginTop: '8px' }}>
                  {panelContent || 'No Content'}
                </div>

                <button onClick={() => console.log('click')}>click</button>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default FloatingToolbarWithPanel;
