import { Pagination } from '@heroui/react';
import { Button, ButtonGroup } from '@heroui/react';
import { Icon } from '@iconify/react';
import { memo } from 'react';

export const ShowTableBottomContent = memo(
  // biome-ignore  lint/suspicious/noExplicitAny: reason
  ({ page, totalPages, setPage, toggle, fullscreen }: any) => {
    return (
      <div className="py-2 px-0 flex justify-between items-center ">
        <Pagination
          isCompact
          showControls
          showShadow
          color="primary"
          page={page}
          total={totalPages}
          onChange={setPage}
          classNames={{
            base: 'px-2',
            item: 'text-xs',
          }}
        />
        <ButtonGroup className="gap-1">
          <Button isIconOnly size="sm" onPress={toggle}>
            <Icon
              icon={
                fullscreen
                  ? 'qlementine-icons:fullscreen-exit-16'
                  : 'qlementine-icons:fullscreen-16'
              }
              width="16"
              height="16"
            />
          </Button>
        </ButtonGroup>
      </div>
    );
  },
);
