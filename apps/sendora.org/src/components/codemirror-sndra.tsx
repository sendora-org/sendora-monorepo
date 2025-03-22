'use client';

import { vscodeDark } from '@/libs/vscodeDark';
import { defaultKeymap } from '@codemirror/commands';
import { javascript } from '@codemirror/lang-javascript';
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
  // ref: (element: unknown) => void;
  value: string;
  onChange: (val: string) => void;
  fullscreen?: boolean;
}

// 定义一个子组件，并使用 forwardRef
const SNDRACodemirror = forwardRef(
  ({ value, onChange, fullscreen }: UIWCodemirrorProps, ref) => {
    const matches = useMediaQuery('(min-width: 768px)');
    const editorRef = useRef<HTMLDivElement | null>(null);
    const editorViewRef = useRef<EditorView | null>(null);

    useEffect(() => {
      if (!editorRef.current) return;
      const view = new EditorView({
        doc: value,

        extensions: [
          lineNumbers(),
          highlightActiveLine(),
          keymap.of(defaultKeymap),
          javascript({ typescript: true }),
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
      <div>
        <div
          ref={editorRef}
          style={{
            width: '100%',
            height: fullscreen ? '100vh' : matches ? '450px' : '300px',
          }}
        />
      </div>
    );
  },
);

export default SNDRACodemirror;

// export default function SNDRACodemirror({
//     value,
//     onChange,
//     fullscreen,
// }: UIWCodemirrorProps,) {
//     const matches = useMediaQuery('(min-width: 768px)');
//     const editorRef = useRef<HTMLDivElement | null>(null);
//     const editorViewRef = useRef<EditorView | null>(null);

//     useEffect(() => {
//         if (!editorRef.current) return;
//         const view = new EditorView({
//             doc: value,

//             extensions: [
//                 basicSetup,
//                 javascript({ typescript: true }),
//                 vscodeDark,
//                 // EditorView.updateListener.of((update) => {
//                 //     if (update.docChanged) {
//                 //         onChange(update.state.doc.toString());
//                 //     }
//                 // }),
//             ],
//             parent: editorRef.current,
//         });

//         editorViewRef.current = view;

//         return () => {
//             view.destroy();
//         };
//     }, []);

//     useEffect(() => {
//         if (editorViewRef.current && editorViewRef.current.state.doc.toString() !== value) {
//             editorViewRef.current.dispatch({
//                 changes: { from: 0, to: editorViewRef.current.state.doc.length, insert: value },
//             });
//         }
//     }, [value]);

//     useImperativeHandle(ref, () => ({
//         getValue: () => {
//             if (editorViewRef.current) {
//                 return editorViewRef.current.state.doc.toString();
//             }
//             return "";
//         },
//     }));

//     return (
//         <div  >
//             {/* <CodeMirror
//         basicSetup={{ history: false }}
//         value={value}
//         height={fullscreen ? '100vh' : matches ? '450px' : '300px'}
//         onChange={onChange}
//         theme={vscodeDark}
//       /> */}

//             <div
//                 ref={editorRef}
//                 style={{
//                     width: "100%",
//                     height: fullscreen ? '100vh' : matches ? '450px' : '300px'
//                 }}

//             />
//         </div>
//     );
// }
