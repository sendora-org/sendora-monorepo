import { vscodeDark } from '@/libs/vscodeDark';
import CodeMirror from '@uiw/react-codemirror';
import { useMediaQuery } from 'usehooks-ts';

export default function UIWCodemirror({
  ref,
  value,
  onChange,
  fullscreen,
}: {
  ref: (element: unknown) => void;
  value: string;
  onChange: (val: string) => void;
  fullscreen: boolean;
}) {
  const matches = useMediaQuery('(min-width: 768px)');
  return (
    <div ref={ref}>
      <CodeMirror
        basicSetup={{ history: false }}
        value={value}
        height={fullscreen ? '100vh' : matches ? '450px' : '300px'}
        onChange={onChange}
        theme={vscodeDark}
      />
    </div>
  );
}
