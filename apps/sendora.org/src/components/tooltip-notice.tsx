import { Button, Tooltip } from '@heroui/react';
import { cn } from '@heroui/react';
import { Icon } from '@iconify/react';
import type React from 'react';
import { forwardRef, memo } from 'react';

export interface TooltipProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
  textClassName?: string;
  copyText?: string;
  children: string;
  show?: boolean;
  aftefCopied?: () => void;
}

export const TooltipNotice = memo(
  forwardRef<HTMLDivElement, TooltipProps>((props, forwardedRef) => {
    const { className, children } = props;
    return (
      <div
        ref={forwardedRef}
        className={cn('flex items-center gap-3 text-default-500', className)}
      >
        <Tooltip className="text-foreground" content={children}>
          <Button
            isIconOnly
            className="h-7 w-7 min-w-7 text-default-400"
            size="md"
            variant="light"
          >
            <Icon icon="ep:info-filled" className="h-[14px] w-[14px]" />
          </Button>
        </Tooltip>
      </div>
    );
  }),
);
