import { Pagination } from '@heroui/react';
import { memo } from 'react';
// biome-ignore  lint/suspicious/noExplicitAny: reason
export const bottomContent = memo(({ page, totalPages, setPage }: any) => {
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
    </div>
  );
});
