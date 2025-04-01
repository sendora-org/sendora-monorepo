import { Pagination } from '@heroui/react';
import { Button, ButtonGroup } from '@heroui/react';
import { Icon } from '@iconify/react';
import { memo } from 'react';

// biome-ignore  lint/suspicious/noExplicitAny: reason
export const ShowTableBottomContent = memo(
  ({ page, totalPages, setPage, toggle, fullscreen }: any) => {
    return (
      <div className="py-2 px-2 flex justify-between items-center">
        <Pagination
          isCompact
          showControls
          showShadow
          color="primary"
          page={page}
          total={totalPages}
          onChange={setPage}
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
