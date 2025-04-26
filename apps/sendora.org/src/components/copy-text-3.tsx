import { Button, Tooltip } from '@heroui/react';
import { cn } from '@heroui/react';
import { Icon } from '@iconify/react';
import React, { forwardRef, memo, useMemo } from 'react';

export interface CopyTextProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
  textClassName?: string;
  copyText?: string;
  children: string;
  showText?: string;
  aftefCopied?: () => void;
}

export const CopyText = memo(
  forwardRef<HTMLDivElement, CopyTextProps>((props, forwardedRef) => {
    const {
      className,
      textClassName,
      children,
      copyText = 'Copy',
      showText = '',
      aftefCopied,
    } = props;
    const [copied, setCopied] = React.useState(false);
    const [copyTimeout, setCopyTimeout] = React.useState<ReturnType<
      typeof setTimeout
    > | null>(null);
    const onClearTimeout = () => {
      if (copyTimeout) {
        clearTimeout(copyTimeout);
      }
    };

    const handleClick = () => {
      onClearTimeout();
      navigator.clipboard.writeText(children);
      setCopied(true);

      setCopyTimeout(
        setTimeout(() => {
          setCopied(false);
          aftefCopied?.();
        }, 500),
      );
    };

    const content = useMemo(
      () => (copied ? 'Copied' : copyText),
      [copied, copyText],
    );

    return (
      <div
        ref={forwardedRef}
        className={cn('flex items-center  text-default-500', className)}
      >
        <Tooltip className="text-foreground" content={content}>
          <Button
            className="h-7  min-w-7 text-default-400"
            size="sm"
            variant="light"
            onPress={handleClick}
          >
            {!copied && (
              <Icon className="h-[14px] w-[14px]" icon="solar:copy-linear" />
            )}
            {copied && (
              <Icon
                className="h-[14px] w-[14px]"
                icon="solar:check-read-linear"
              />
            )}

            {showText && <span className={textClassName}>{showText}</span>}
          </Button>
        </Tooltip>
      </div>
    );
  }),
);

CopyText.displayName = 'CopyText';
