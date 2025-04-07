import { Button, Tooltip } from '@heroui/react';
import { cn } from '@heroui/react';
import { Icon } from '@iconify/react';
import clsx from 'clsx';
import type React from 'react';
import { forwardRef, memo, useState } from 'react';
export interface TooltipQuestionProps
  extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
  textClassName?: string;
  iconClassName?: string;
  copyText?: string;
  children: React.ReactNode;
  show?: boolean;
  aftefCopied?: () => void;
}

export const TooltipQuestion = memo(
  forwardRef<HTMLDivElement, TooltipQuestionProps>((props, forwardedRef) => {
    const { className, children, iconClassName } = props;
    const [isOpen, setIsOpen] = useState(false);
    return (
      <div
        ref={forwardedRef}
        className={cn('flex items-center gap-3 text-default-500', className)}
      >
        <Tooltip
          className="text-foreground"
          content={children}
          isOpen={isOpen}
          onOpenChange={(open) => setIsOpen(open)}
        >
          <Button
            isIconOnly
            className="h-7 w-7 min-w-7 text-default-400"
            size="sm"
            variant="light"
            onPress={() => setIsOpen((prev) => !prev)}
          >
            <Icon
              icon="ep:question-filled"
              className={clsx('h-[24px] w-[24px]', iconClassName)}
            />
          </Button>
        </Tooltip>
      </div>
    );
  }),
);
