import { CopyText } from '@/components/copy-text';
import { local2NumberFormat, numberFormats } from '@/constants/common';
import { useLocale } from '@/hooks/useLocale';
import { runWorker2 } from '@/libs/common';
import { emojiAvatarForAddress } from '@/libs/emojiAvatarFOrAddress';
import { formatBigIntNumber } from '@/libs/number';
import {
  Button,
  Chip,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
  Input,
  Pagination,
  type SortDescriptor,
  Spinner,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
  Tooltip,
  User,
} from '@heroui/react';
import { useAsyncList } from '@react-stately/data';
import {
  QueryClient,
  QueryClientProvider,
  keepPreviousData,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import { useEffect, useRef } from 'react';
import React, { useMemo } from 'react';
import useSWR from 'swr';
import { ChevronDownIcon } from './chevron-down-icon';
import { DeleteIcon } from './delete-icon';
import { SearchIcon } from './search-icon';

import { queryItems } from '@/libs/taffydb';

export const columns = [
  { name: 'No.', uid: 'id', sortable: true },
  { name: 'Receipient', uid: 'name', sortable: true },
  { name: 'Amount', uid: 'amount', sortable: true },
  { name: 'Address', uid: 'address' },
  { name: 'STATUS', uid: 'status', sortable: true },
  { name: 'ACTIONS', uid: 'actions' },
];

export const statusOptions = [
  { name: 'Valid', uid: 'valid' },
  { name: 'Wrong Address', uid: 'wrongAddress' },
  { name: 'Duplicate Address', uid: 'duplicateAddress' },
  { name: 'Zero Amount', uid: 'zeroAmount' },
  { name: 'Empty Amount', uid: 'emptyAmount' },
  { name: 'Wrong Amount', uid: 'wrongAmount' },
];

export function capitalize(s: string) {
  return s ? s.charAt(0).toUpperCase() + s.slice(1).toLowerCase() : '';
}

type Key = string | number;
type Selection = 'all' | Set<Key>;
type SortDirection = 'ascending' | 'descending';
type IColor = 'success' | 'danger' | 'warning';
type IStatus =
  | 'valid'
  | 'wrongAddress'
  | 'emptyAmount'
  | 'wrongAmount'
  | 'zeroAmount'
  | 'duplicateAddress';
const statusColorMap: Record<IStatus, IColor> = {
  valid: 'success',
  wrongAddress: 'danger',
  emptyAmount: 'danger',
  wrongAmount: 'danger',
  zeroAmount: 'warning',
  duplicateAddress: 'warning',
};

const INITIAL_VISIBLE_COLUMNS = ['id', 'name', 'amount', 'status', 'actions'];

export type IReceipent = {
  id: number;
  name: string;
  status: IStatus;
  ensName: string;
  address: string;
  addressType: string;
  amount: bigint;
  amountRaw: string;
};
type IColumnkeys =
  | 'id'
  | 'name'
  | 'status'
  | 'ensName'
  | 'address'
  | 'addressType'
  | 'amount';

type Iprops = {
  deleteLine: (line: number[]) => void;
  worker: Worker | null;
  count: number;
};

export default function App({ deleteLine, worker, count }: Iprops) {
  const [selectedKeys, setSelectedKeys] = React.useState<Selection>(
    new Set([]),
  );
  const [visibleColumns] = React.useState(new Set(INITIAL_VISIBLE_COLUMNS));
  const [statusFilter, setStatusFilter] = React.useState<Selection>('all');

  // Page
  const pageSize = 100;
  const [page, setPage] = React.useState(1);

  // Search
  const [searchKeys, setSearchKeys] = React.useState('');

  // Sort
  const [sortDescriptor, setSortDescriptor] = React.useState({
    column: 'id' as Key,
    direction: 'ascending' as SortDirection,
  });

  // Filter

  console.log({sortDescriptor})

  const headerColumns = React.useMemo(() => {
    return columns.filter((column) =>
      Array.from(visibleColumns).includes(column.uid),
    );
  }, [visibleColumns]);

  const queryClient = useQueryClient();

  const {
    status,
    data: queryData,
    error,
    isFetching,
    isPlaceholderData,
  } = useQuery({
    queryKey: [
      'projects',
      worker,
      count,
      page,
      pageSize,
      sortDescriptor,
      searchKeys,
    ],
    queryFn: () =>
      queryItems(worker, page, pageSize, sortDescriptor, searchKeys),
    placeholderData: keepPreviousData,
    // staleTime: 5000,
  });

  const UserIcon = ({ address }: { address: string }) => {
    const { color: backgroundColor, emoji } = useMemo(
      () => emojiAvatarForAddress(address),
      [address],
    );
    return (
      <div
        className="w-[40px] h-[40px]   flex justify-center items-center "
        style={{ backgroundColor, fontSize: '24px' }}
      >
        {emoji}
      </div>
    );
  };

  const { setLocale, locale } = useLocale();
  const { decimalSeparator, thousandSeparator } =
    numberFormats[local2NumberFormat[locale]];
  const renderCell = (receipient: IReceipent, columnKey: string) => {
    const cellValue = receipient[columnKey as IColumnkeys];

    switch (columnKey) {
      case 'name':
        return (
          <User
            avatarProps={{
              showFallback: true,
              radius: 'lg',
              src: `https://euc.li/${receipient.ensName}`,

              fallback: <UserIcon address={receipient.address ?? ''} />,
            }}
            description={
              receipient.addressType === 'address'
                ? (receipient.ensName ?? receipient.address)
                : receipient.address
            }
            name={
              <div className="flex items-center gap-2">
                {cellValue}
                <CopyText>{receipient.address}</CopyText>
              </div>
            }
          />
        );
      case 'amount':
        return (
          <div className="flex flex-col">
            <p className="text-bold text-small capitalize">
              {receipient.status === 'valid' &&
                formatBigIntNumber(
                  cellValue as bigint,
                  thousandSeparator,
                  decimalSeparator,
                )}

              {receipient.status !== 'valid' && receipient.amountRaw}
            </p>
            <p className="text-bold text-tiny capitalize text-default-400">
              {receipient.status === 'valid' &&
                formatBigIntNumber(
                  receipient.amount as bigint,
                  thousandSeparator,
                  decimalSeparator,
                )}

              {receipient.status !== 'valid' && receipient.amountRaw}
            </p>
          </div>
        );
      case 'status':
        return (
          <Chip
            className="capitalize"
            color={statusColorMap[receipient.status]}
            size="sm"
            variant="flat"
          >
            {cellValue}
          </Chip>
        );
      case 'actions':
        return (
          <div className="relative flex items-center gap-4">
            {/* <Tooltip content="Edit receipient">
                <Button
                  isIconOnly
                  className="text-lg text-primary-400 cursor-pointer valid:opacity-50"
                >
                  <EditIcon />
                </Button>
              </Tooltip> */}
            <Tooltip color="danger" content="Delete receipient">
              <Button
                isIconOnly
                size="sm"
                className="text-md text-danger cursor-pointer valid:opacity-50"
                onClick={() => {
                  console.log('delete');
                  deleteLine([receipient.id]);
                }}
              >
                <DeleteIcon />
              </Button>
            </Tooltip>
          </div>
        );
      default:
        return cellValue;
    }
  };

  const onSearchChange = React.useCallback((value: string) => {
    if (value) {
      console.log('onsearchchange', value);
      setSearchKeys(value);
      setPage(1);
    } else {
      setSearchKeys('');
    }
  }, []);

  const onClear = React.useCallback(() => {
    setSearchKeys('');
    setPage(1);
  }, []);

  const topContent = React.useMemo(() => {
    return (
      <div className="flex flex-col gap-4">
        <header className="mb-6 flex w-full items-center justify-between ">
          <div className="flex flex-col ">
            <h1 className="text-xl font-bold text-default-500 lg:text-2xl">
              Confirm
            </h1>
          </div>
        </header>
        <div className="flex justify-between gap-3 items-end">
          <Input
            isClearable
            className="w-full sm:max-w-[44%]"
            placeholder="Search by receipient ..."
            startContent={<SearchIcon />}
            value={searchKeys}
            onClear={() => onClear()}
            onValueChange={onSearchChange}
          />

          <div className="flex gap-3">
            <Dropdown>
              <DropdownTrigger className="hidden sm:flex">
                <Button
                  endContent={<ChevronDownIcon className="text-small" />}
                  variant="flat"
                >
                  Status
                </Button>
              </DropdownTrigger>
              <DropdownMenu
                disallowEmptySelection
                aria-label="Table Columns"
                closeOnSelect={false}
                selectedKeys={statusFilter}
                selectionMode="multiple"
                onSelectionChange={setStatusFilter}
              >
                {statusOptions.map((status) => (
                  <DropdownItem key={status.uid} className="capitalize">
                    {capitalize(status.name)}
                  </DropdownItem>
                ))}
              </DropdownMenu>
            </Dropdown>
          </div>
        </div>
        <div className="flex justify-between items-center">
          <span className="w-[30%] text-small text-default-400">
            {selectedKeys === 'all'
              ? `${queryData?.pagination?.totalRecords} of ${queryData?.pagination?.totalRecords} selected`
              : `${selectedKeys.size} of ${queryData?.pagination?.totalRecords} selected`}
          </span>
          {selectedKeys === 'all' ? (
            <Button
              color="danger"
              onPress={() => {
                console.log(
                  11111,
                  'all',
                  selectedKeys,
                  // filteredItems.map(({ id }) => id),
                );
                // deleteLine(filteredItems.map(({ id }) => Number(id)));
              }}
            >
              {' '}
              Delete selected items.
            </Button>
          ) : selectedKeys?.size >= 1 ? (
            <Button
              onPress={() => {
                console.log(
                  11111,

                  selectedKeys,
                );
                deleteLine(Array.from(selectedKeys).map((id) => Number(id)));
              }}
              color="danger"
            >
              Delete selected items.
            </Button>
          ) : (
            <></>
          )}
        </div>
      </div>
    );
  }, [
    onSearchChange,
    selectedKeys,
    deleteLine,
    searchKeys,
    onClear,
    statusFilter,
    queryData,
  ]);

  const bottomContent = React.useMemo(() => {
    return (
      <div className="py-2 px-2 flex justify-between items-center">
        <Pagination
          isCompact
          showControls
          showShadow
          color="primary"
          page={page}
          total={queryData?.pagination.totalPages ?? 1}
          onChange={setPage}
        />
      </div>
    );
  }, [page, queryData]);

  return (
    <Table
      isHeaderSticky
      aria-label="Example table with custom cells, pagination and sorting"
      bottomContent={bottomContent}
      bottomContentPlacement="outside"
      topContent={topContent}
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
        items={queryData?.data ?? []}
        // loadingContent={<Spinner label="Loading..." />}
      >
        {
          // biome-ignore  lint/suspicious/noExplicitAny: reason
          (item: any) => (
            <TableRow key={item.id}>
              {(columnKey) => (
                <TableCell>
                  {renderCell(item, columnKey as IColumnkeys)}
                </TableCell>
              )}
            </TableRow>
          )
        }
      </TableBody>
    </Table>
  );
}
