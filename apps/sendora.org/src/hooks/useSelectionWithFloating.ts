import {
  autoUpdate,
  flip,
  offset,
  shift,
  useFloating,
} from '@floating-ui/react';
import { useCallback, useEffect, useRef, useState } from 'react';

interface VirtualElement {
  getBoundingClientRect(): DOMRect;
  contextElement?: Element | null;
}

type PanelContent = { label: string; value: string };
export interface UseSelectionFloatingReturn {
  scopeRef: React.RefObject<HTMLDivElement>;
  toolbarFloating: ReturnType<typeof useFloating>;
  panelFloating: ReturnType<typeof useFloating>;
  open: boolean;
  panelOpen: boolean;
  selectionText: string;
  loading: boolean;
  panelContent: PanelContent;
  setPanelOpen: (v: boolean) => void;
  handleSelection: () => void;
  handleActionClick: (
    handler: (text: string) => Promise<PanelContent> | PanelContent,
  ) => Promise<void>;
}

const createVirtualElement = (rect: DOMRect): VirtualElement => ({
  getBoundingClientRect: () => rect,
  contextElement: null,
});
const isInside = (parent: HTMLElement | null | undefined, target: Node) => {
  return parent ? parent.contains(target) : false;
};

export const useSelectionWithFloating = (): UseSelectionFloatingReturn => {
  const [open, setOpen] = useState(false);
  const [panelOpen, setPanelOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectionText, setSelectionText] = useState('');
  const [panelContent, setPanelContent] = useState<PanelContent>({
    label: '',
    value: '',
  });
  const [virtualReference, setVirtualReference] = useState<
    VirtualElement | undefined
  >(undefined);

  const scopeRef = useRef<HTMLDivElement>(null);

  const toolbarFloating = useFloating({
    middleware: [offset(8), flip(), shift()],
    placement: 'top',
    whileElementsMounted: autoUpdate,
  });

  const panelFloating = useFloating({
    middleware: [offset(8), flip(), shift()],
    placement: 'bottom',
    whileElementsMounted: autoUpdate,
  });

  const isInScope = useCallback((node: Node | null) => {
    if (!scopeRef.current || !node) return false;
    if (node.nodeType === 1) {
      return scopeRef.current.contains(node as Node);
    }
    return scopeRef.current.contains(node.parentNode as Node);
  }, []);

  const handleSelection = useCallback(() => {
    let selectedText = '';
    let virtualElement: VirtualElement | null = null;
    const activeEl = document.activeElement as HTMLElement;

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

      // typings todo
      // @ts-ignore
      toolbarFloating.refs.setPositionReference(virtualElement);
      // typings todo
      // @ts-ignore
      panelFloating.refs.setPositionReference(virtualElement);

      setOpen(true);
      //   setPanelOpen(false);
      //   setPanelContent('');
    } else {
      setOpen(false);
      setPanelOpen(false);
    }
  }, [isInScope, panelFloating.refs, toolbarFloating.refs]);

  const handleActionClick = useCallback(
    async (handler: (text: string) => Promise<PanelContent> | PanelContent) => {
      if (!selectionText || !virtualReference) return;

      // typings todo
      // @ts-ignore
      panelFloating.refs.setPositionReference(virtualReference);
      setPanelOpen(true);
      setLoading(true);
      setPanelContent({ label: '', value: '' });

      const result = await Promise.resolve(handler(selectionText));

      setLoading(false);
      setPanelContent(result);
    },
    [selectionText, virtualReference, panelFloating.refs],
  );

  const handlePointerDownOutside = useCallback(
    (e: PointerEvent) => {
      const target = e.target as Node;

      const inScope = isInside(scopeRef.current, target);
      const inToolbar = isInside(toolbarFloating.refs.floating.current, target);
      const inPanel = isInside(panelFloating.refs.floating.current, target);

      if (!inScope && !inToolbar && !inPanel) {
        setOpen(false);
        setPanelOpen(false);
      }
    },
    [toolbarFloating.refs.floating, panelFloating.refs.floating],
  );

  useEffect(() => {
    const listener = (e: PointerEvent) => {
      handlePointerDownOutside(e);
    };

    document.addEventListener('pointerdown', listener);

    return () => {
      document.removeEventListener('pointerdown', listener);
    };
  }, [handlePointerDownOutside]);

  return {
    // typings todo
    // @ts-ignore
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
  };
};
