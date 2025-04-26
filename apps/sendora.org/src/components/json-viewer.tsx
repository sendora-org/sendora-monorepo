import hljs from 'highlight.js/lib/core';
import json from 'highlight.js/lib/languages/json';
import type React from 'react';
import { useEffect, useRef } from 'react';
import '@/app/styles/github-dark.css'; // Dark mode theme
import '@/app/styles/github.css'; // Light mode theme
import { prettifyJSON } from '@/libs/common';
import { Json } from 'ox';
import { CopyText } from './copy-text';
import FloatingToolbarWithPanel from './floating-toolbar-panel';

hljs.registerLanguage('json', json);

type JsonViewerProps = {
  data: object | string;
  className?: string;
  enableCopy?: boolean;
};

const JsonViewer: React.FC<JsonViewerProps> = ({
  data,
  className = '',
  enableCopy = false,
}) => {
  const codeRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (codeRef.current) {
      hljs.highlightElement(codeRef.current);
    }
  }, []);

  const jsonString =
    typeof data === 'string' ? data : prettifyJSON(Json.stringify(data));

  const handleCopy = () => {
    navigator.clipboard.writeText(jsonString).then(() => {});
  };

  return (
    <div
      className={`hljs-github-dark relative rounded-lg overflow-auto border bg-white dark:bg-[#0d1118] border-gray-200 dark:border-gray-700 ${className}`}
    >
      {enableCopy && (
        <div
          className="absolute top-4 right-4 text-sm text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white p-1"
          title="Copy JSON"
        >
          <CopyText>{jsonString}</CopyText>
        </div>
      )}

      <pre className="m-0 p-4 text-sm font-mono text-gray-800 dark:text-gray-100">
        <code ref={codeRef} className="language-json">
          {jsonString}
        </code>
      </pre>
    </div>
  );
};

export default JsonViewer;
