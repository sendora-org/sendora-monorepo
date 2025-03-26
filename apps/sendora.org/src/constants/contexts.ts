import type { SNDRACodemirrorRef } from '@/components/codemirror-sndra';
import { createContext } from 'react';
export const EditorRefContext =
  createContext<React.RefObject<SNDRACodemirrorRef | null> | null>(null);
