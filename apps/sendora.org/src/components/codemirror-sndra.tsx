'use client';

import { vscodeDark } from '@/libs/vscodeDark';
import { vscodeLight } from '@/libs/vscodeLight';
import { defaultKeymap, history, historyKeymap } from '@codemirror/commands';
import { search, searchKeymap } from '@codemirror/search';
import { highlightActiveLine, keymap, lineNumbers } from '@codemirror/view';
import { useFullscreen } from '@mantine/hooks';
import { EditorView } from 'codemirror';
import { useTheme } from 'next-themes';
import React, {
  useEffect,
  forwardRef,
  useRef,
  useImperativeHandle,
} from 'react';
export interface SNDRACodemirrorRef {
  getValue: () => string;
  setValue: (value: string) => void;
}

interface SNDRACodemirrorProps {
  defaultValue?: string;
  onDocChange?: () => void;
}

const SNDRACodemirror = forwardRef(
  ({ defaultValue = '', onDocChange }: SNDRACodemirrorProps, ref) => {
    console.log(`SNDRACodemirror render ${new Date().toISOString()}`);
    const editorRef = useRef<HTMLDivElement | null>(null);
    const editorViewRef = useRef<EditorView | null>(null);
    const { fullscreen } = useFullscreen();
    const { theme, setTheme } = useTheme();
    useEffect(() => {
      if (fullscreen) {
        // @ts-ignore
        window?.stonks?.event('fullscreen-codemirror');
      }
    }, [fullscreen]);
    useEffect(() => {
      if (!editorRef.current) return;
      const view = new EditorView({
        doc: defaultValue,
        extensions: [
          lineNumbers(),
          highlightActiveLine(),
          history(),
          search(),
          keymap.of([...defaultKeymap, ...historyKeymap, ...searchKeymap]),
          theme === 'dark' ? vscodeDark : vscodeLight,
          EditorView.updateListener.of((update) => {
            if (update.docChanged) {
              onDocChange?.();
            }
          }),
        ],
        parent: editorRef.current,
      });

      editorViewRef.current = view;

      return () => {
        view.destroy();
      };
    }, [onDocChange, defaultValue, theme]);

    useImperativeHandle(ref, () => ({
      getValue: () => {
        if (editorViewRef.current) {
          return editorViewRef.current.state.doc.toString();
        }
        return '';
      },
      setValue: (value: string) => {
        if (
          editorViewRef.current &&
          editorViewRef.current.state.doc.toString() !== value
        ) {
          editorViewRef.current.dispatch({
            changes: {
              from: 0,
              to: editorViewRef.current.state.doc.length,
              insert: value,
            },
          });
        }
      },
    }));

    return (
      <div
        ref={editorRef}
        className={theme === 'light' ? 'border border-1 rounded-lg' : ''}
        style={{
          width: '100%',
          height: fullscreen ? '100vh' : '400px',
        }}
      />
    );
  },
);

export default SNDRACodemirror;
