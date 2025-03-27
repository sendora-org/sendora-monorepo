import H3Title from './h3-title';

import type { WorkerService } from '@/libs/worker-service';

import { numberFormats } from '@/constants/common';
import { useLocale } from '@/hooks/useLocale';
import {
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
} from '@heroui/react';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { useCallback, useState } from 'react';
import { firstValueFrom } from 'rxjs';
import { ShowTableCell } from './show-table-cell';
type Key = string | number;
type Selection = 'all' | Set<Key>;
type SortDirection = 'ascending' | 'descending';
type IProps = {
  //   deleteLine: (line: number[]) => void;
  workerService: WorkerService | null;
};
type IColumnkeys =
  | 'id'
  | 'name'
  | 'status'
  | 'ensName'
  | 'address'
  | 'addressType'
  | 'amount'
  | 'actions';

export default function ShowTable({ workerService }: IProps) {
  const { setLocale, locale } = useLocale();
  const { decimalSeparator, thousandSeparator } = numberFormats[locale];

  const headerColumns = [
    { name: 'No.', uid: 'id', sortable: true },
    { name: 'Receipient', uid: 'name', sortable: true },
    { name: 'Amount', uid: 'amount', sortable: true },
    { name: 'STATUS', uid: 'status', sortable: true },
    { name: 'ACTIONS', uid: 'actions' },
  ];

  // Table Select
  const [selectedKeys, setSelectedKeys] = useState<Selection>(new Set([]));

  // Table Status Select
  const [statusFilter, setStatusFilter] = useState<Selection>('all');

  // Page
  const pageSize = 100;
  const [page, setPage] = useState(1);

  // Search
  const [searchKey, setSearchKey] = useState('');
  const onSearchChange = useCallback((value: string) => {
    if (value) {
      console.log('onsearchchange', value);
      setSearchKey(value);
      setPage(1);
    } else {
      setSearchKey('');
    }
  }, []);

  const onClear = useCallback(() => {
    setSearchKey('');
    setPage(1);
  }, []);

  // Sort
  const [sortDescriptor, setSortDescriptor] = useState({
    column: 'id' as Key,
    direction: 'ascending' as SortDirection,
  });

  const filterField = 'status';
  const filterKey = 'all';
  const { status, data, error, isFetching, isPlaceholderData } = useQuery({
    queryKey: [
      'user-input-map',
      sortDescriptor,
      filterField,
      filterKey,
      searchKey,
      page,
      pageSize,
    ],
    // cacheTime: 0,
    staleTime: 0,
    queryFn: () =>
      firstValueFrom(
        // biome-ignore lint/style/noNonNullAssertion: reason
        workerService?.request('query', {
          sortField: sortDescriptor.column,
          sortOrder: sortDescriptor.direction === 'ascending' ? 'asc' : 'desc',
          filterField,
          filterKey,
          searchKey,
          searchFields: ['name', 'address'],
          page,
          pageSize,
        })!,
      ),

    placeholderData: keepPreviousData,
  });
  console.log({ data });

  // console.log({selectedKeys})
  console.log({ selectedKeys }, selectedKeys.size);
  return (
    <>
      <div className="flex w-full items-center justify-between mb-2">
        <H3Title>Confirm</H3Title>
      </div>
      <Table
        isKeyboardNavigationDisabled
        isHeaderSticky
        aria-label="$SNDRA"
        // topContent={topContent}
        // bottomContent={bottomContent}
        bottomContentPlacement="outside"
        topContentPlacement="outside"
        classNames={{
          base: 'relative ',
          wrapper: 'max-h-[382px] relative',
          // ${isFetching ? ' overflow-hidden' : ''}
          loadingWrapper:
            'absolute inset-0 bg-background/50 backdrop-blur-sm flex items-center justify-center z-50',
        }}
        selectedKeys={selectedKeys}
        selectionMode="multiple"
        sortDescriptor={sortDescriptor}
        onSelectionChange={setSelectedKeys}
        onSortChange={setSortDescriptor}
      >
        <TableHeader columns={headerColumns}>
          {(column: { uid: string; sortable?: boolean; name: string }) => (
            <TableColumn
              key={column.uid}
              align={column.uid === 'actions' ? 'start' : 'start'}
              allowsSorting={column.sortable}
            >
              {column.name}
            </TableColumn>
          )}
        </TableHeader>
        <TableBody
          emptyContent={'No data found'}
          // isLoading={isFetching}
          // loadingContent={<Spinner label="Loading..." />}
          // biome-ignore  lint/suspicious/noExplicitAny: reason
          items={(data as any)?.items ?? []}
        >
          {
            // biome-ignore  lint/suspicious/noExplicitAny: reason
            (item: any) => (
              <TableRow key={item.id}>
                {(columnKey) => (
                  <TableCell>
                    <ShowTableCell
                      thousandSeparator={thousandSeparator}
                      decimalSeparator={decimalSeparator}
                      receipient={item}
                      columnKey={columnKey as IColumnkeys}
                    />
                  </TableCell>
                )}
              </TableRow>
            )
          }
        </TableBody>
      </Table>
    </>
  );
}
