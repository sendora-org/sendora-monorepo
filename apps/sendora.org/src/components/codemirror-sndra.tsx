'use client';

import { vscodeDark } from '@/libs/vscodeDark';
import { defaultKeymap, history, historyKeymap } from '@codemirror/commands';
import { highlightActiveLine, keymap, lineNumbers } from '@codemirror/view';
import { EditorView, basicSetup } from 'codemirror';
import React, {
  useEffect,
  forwardRef,
  useRef,
  useImperativeHandle,
} from 'react';
import { useMediaQuery } from 'usehooks-ts';

export interface SNDRACodemirrorRef {
  getValue: () => string;
}

interface UIWCodemirrorProps {
  value: string;
  onChange: (val: string) => void;
  fullscreen?: boolean;
}

const SNDRACodemirror = forwardRef(
  ({ value, onChange, fullscreen }: UIWCodemirrorProps, ref) => {
    const editorRef = useRef<HTMLDivElement | null>(null);
    const editorViewRef = useRef<EditorView | null>(null);

    useEffect(() => {
      if (!editorRef.current) return;
      const view = new EditorView({
        doc: value,
        extensions: [
          lineNumbers(),
          highlightActiveLine(),
          history(),
          keymap.of([...defaultKeymap, ...historyKeymap]),
          vscodeDark,
        ],
        parent: editorRef.current,
      });

      editorViewRef.current = view;

      return () => {
        view.destroy();
      };
    }, [value]);

    useEffect(() => {
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
    }, [value]);

    useImperativeHandle(ref, () => ({
      getValue: () => {
        if (editorViewRef.current) {
          return editorViewRef.current.state.doc.toString();
        }
        return '';
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
