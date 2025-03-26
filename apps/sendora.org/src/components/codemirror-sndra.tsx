'use client';

import { vscodeDark } from '@/libs/vscodeDark';
import { defaultKeymap, history, historyKeymap } from '@codemirror/commands';
import { search, searchKeymap } from '@codemirror/search';
import { highlightActiveLine, keymap, lineNumbers } from '@codemirror/view';
import { EditorView } from 'codemirror';
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
  fullscreen?: boolean;
  onDocChange: () => void;
}

const SNDRACodemirror = forwardRef(
  (
    {
      defaultValue = '',
      fullscreen = false,
      onDocChange,
    }: SNDRACodemirrorProps,
    ref,
  ) => {
    const editorRef = useRef<HTMLDivElement | null>(null);
    const editorViewRef = useRef<EditorView | null>(null);

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
          vscodeDark,
          EditorView.updateListener.of((update) => {
            if (update.docChanged) {
              onDocChange();
            }
          }),
        ],
        parent: editorRef.current,
      });

      editorViewRef.current = view;

      return () => {
        view.destroy();
      };
    }, [defaultValue, onDocChange]);

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
        style={{
          width: '100%',
          height: fullscreen ? '100vh' : '400px',
        }}
      />
    );
  },
);

export default SNDRACodemirror;
