import {
  Button,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
  Input,
} from '@heroui/react';
import { memo } from 'react';
import { ChevronDownIcon } from './chevron-down-icon';
import { SearchIcon } from './search-icon';

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

export const ShowTableTopContent = memo(
  ({
    searchKey,
    onClear,
    onSearchChange,
    statusFilter,
    setStatusFilter,
    selectedKeys,
    totalRecords,
    // biome-ignore  lint/suspicious/noExplicitAny: reason
  }: any) => {
    console.log({ statusFilter });
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
            value={searchKey}
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
                selectionMode="single"
                onSelectionChange={setStatusFilter}
              >
                <DropdownItem key={'all'} className="capitalize">
                  {capitalize('ALL')}
                </DropdownItem>

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
              ? `${totalRecords} of ${totalRecords} selected`
              : `${selectedKeys.size} of ${totalRecords} selected`}
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
                //   console.log(
                //     11111,
                //     selectedKeys,
                //   );
                //   deleteLine(Array.from(selectedKeys).map((id) => Number(id)));
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
  },
);
