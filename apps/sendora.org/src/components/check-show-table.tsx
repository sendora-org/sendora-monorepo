import { Button } from '@heroui/react';
import { useContext, useEffect, useMemo } from 'react';

import H3Title from './h3-title';

import MyTimer from '@/components/my-timer';
import { numberFormats } from '@/constants/common';
import { EditorRefContext } from '@/constants/contexts';
import { useLocale } from '@/hooks/useLocale';
import { delay } from '@/libs/common';
import type { WorkerService } from '@/libs/worker-service';
import { useScopedStep } from '@/providers/step-provider';
import {
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
} from '@heroui/react';
import { useFullscreen } from '@mantine/hooks';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { useQueryClient } from '@tanstack/react-query';
import { useCallback, useState } from 'react';
import { firstValueFrom } from 'rxjs';
import { CheckReceipt } from './check-receipt';
import { ShowTableBottomContent } from './show-table-bottom';
import { ShowTableCell } from './show-table-cell';
import { ShowTableTopContent } from './show-table-top';
type Key = string | number;
type Selection = 'all' | Set<Key>;
type SortDirection = 'ascending' | 'descending';
type IProps = {
  //   deleteLine: (line: number[]) => void;
  workerService: WorkerService | null;
  tokenSymbol: string;
  isToggle: boolean;
  currency: string;
  rate: bigint;
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

export const CheckShowTable = ({
  workerService,
  tokenSymbol,
  isToggle,
  currency,
  rate,
}: IProps) => {
  const [isLoading, setLoading] = useState(false);
  const [editorRows, setEditorRows] = useState(0);
  const { setLocale, locale } = useLocale();
  const queryClient = useQueryClient();
  const seconds = useMemo(() => {
    return Math.ceil(editorRows / 10000);
  }, [editorRows]);

  const { decimalSeparator, thousandSeparator } = numberFormats[locale];
  const editorRef = useContext(EditorRefContext);
  const headerColumns = [
    { name: 'No.', uid: 'id', sortable: true },
    { name: 'Receipient', uid: 'name', sortable: true },
    { name: 'Amount', uid: 'amount', sortable: true },
    { name: 'STATUS', uid: 'status', sortable: true },
    { name: 'ACTIONS', uid: 'actions' },
  ];

  const { toggle, fullscreen } = useFullscreen();

  // Table Select
  const [selectedKeys, setSelectedKeys] = useState<Selection>(new Set([]));

  // Table Status Select
  const [statusFilter, setStatusFilter] = useState<Selection>(new Set(['all']));

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
  const { status, data, error, isFetching, isPlaceholderData, refetch } =
    useQuery({
      queryKey: [
        'user-input-map',
        sortDescriptor,
        filterField,
        statusFilter,
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
            sortOrder:
              sortDescriptor.direction === 'ascending' ? 'asc' : 'desc',
            filterField,
            filterKey: Array.from(statusFilter).join(''),
            searchKey,
            searchFields: ['name', 'address'],
            page,
            pageSize,
          })!,
        ),

      placeholderData: keepPreviousData,
    });

  const deleteLines = async (ids: number[]) => {
    if (ids.length >= 1) {
      const results = await firstValueFrom(
        // biome-ignore lint/style/noNonNullAssertion: reason
        workerService?.request('deleteBatchByIds', ids)!,
      );
    } else {
      const results = await firstValueFrom(
        // biome-ignore lint/style/noNonNullAssertion: reason
        workerService?.request('deleteBatchByOptions', {
          filterField,
          filterKey: Array.from(statusFilter).join(''),
          searchKey,
          searchFields: ['name', 'address'],
        })!,
      );
    }
    refetch();
  };

  const clearCache = () => {
    const prefix = 'user-input-map';

    const allQueries = queryClient.getQueryCache().findAll();

    for (const query of allQueries) {
      const queryKey = query.queryKey;
      if (Array.isArray(queryKey) && queryKey[0]?.startsWith(prefix)) {
        queryClient.removeQueries({ queryKey });
      }
    }
  };
  useEffect(() => {
    console.log('CheckInputTable onmount');

    return () => {
      console.log('CheckInputTable clean up');
      if (workerService) {
        firstValueFrom(workerService.request('reset'));
        clearCache();
      }
    };
  }, []);

  const setStepData = useScopedStep((s) => s.setStepData);
  const currentStep = useScopedStep((s) => s.currentStep);
  useEffect(() => {
    if (data && data?.all > 0) {
      setStepData(currentStep, {
        validating: true,
      });
    } else {
      setStepData(currentStep, {
        validating: false,
      });
    }
  }, [data, currentStep, setStepData]);

  return (
    <>
      {(typeof data == 'undefined' || data?.all == 0) && (
        <Button
          className="my-2"
          isLoading={isLoading}
          fullWidth
          color="secondary"
          onPress={async () => {
            try {
              setLoading(true);
              setEditorRows(
                editorRef?.current?.getValue()?.split('\n')?.length ?? 0,
              );
              await delay(1000);
              if (workerService) {
                await firstValueFrom(
                  workerService.request('validate', {
                    ...numberFormats[locale],
                    value: editorRef?.current?.getValue(),
                  }),
                );
              }

              setLoading(false);
              // @ts-ignore
              window?.stonks?.event('/native-coins validate-success');
            } catch (e) {
              setLoading(false);
              console.log(e);
              // @ts-ignore
              window?.stonks?.event('/native-coins validate-failed', { e });
            }
            clearCache();
          }}
        >
          {isLoading && (
            <p className="flex gap-2">
              <MyTimer />
              (~{seconds}s) Validating...
            </p>
          )}
          {!isLoading && 'Continue'}
        </Button>
      )}

      {data && (data as any)?.all > 0 && (
        <>
          <div className="flex w-full items-center justify-between my-2">
            <H3Title>Confirm</H3Title>
          </div>
          <Table
            isKeyboardNavigationDisabled
            isHeaderSticky
            aria-label="$SNDRA"
            topContent={
              <ShowTableTopContent
                searchKeys={searchKey}
                onClear={onClear}
                onSearchChange={onSearchChange}
                statusFilter={statusFilter}
                setStatusFilter={setStatusFilter}
                selectedKeys={selectedKeys}
                // biome-ignore  lint/suspicious/noExplicitAny: reason
                totalRecords={(data as any)?.total ?? 0}
                thousandSeparator={thousandSeparator}
                decimalSeparator={decimalSeparator}
                deleteLines={deleteLines}
              />
            }
            // page, totalPages, setPage
            bottomContent={
              <ShowTableBottomContent
                page={page}
                // biome-ignore  lint/suspicious/noExplicitAny: reason
                totalPages={(data as any)?.totalPages ?? 1}
                setPage={setPage}
                toggle={toggle}
                fullscreen={fullscreen}
              />
            }
            bottomContentPlacement="outside"
            topContentPlacement="outside"
            classNames={{
              base: 'relative ',
              wrapper: fullscreen
                ? '100vh   relative'
                : 'max-h-[382px] relative',
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
                          deleteLines={deleteLines}
                          isToggle={isToggle}
                          rate={rate}
                          tokenSymbol={tokenSymbol}
                          currency={currency}
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
      )}
    </>
  );
};
