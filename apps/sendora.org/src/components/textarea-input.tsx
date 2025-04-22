'use client';

import type { TextAreaProps } from '@heroui/react';

import { Textarea } from '@heroui/react';
import { cn } from '@heroui/react';
import React from 'react';

const TextareaInput = React.forwardRef<HTMLTextAreaElement, TextAreaProps>(
  ({ classNames = {}, ...props }, ref) => {
    return (
      <Textarea
        ref={ref}
        aria-label="Prompt"
        className="min-h-[40px]"
        classNames={{
          ...classNames,
          label: cn('', classNames?.label),
          input: cn('py-0', classNames?.input),
        }}
        minRows={1}
        radius="lg"
        {...props}
      />
    );
  },
);

export default TextareaInput;

TextareaInput.displayName = 'TextareaInput';
