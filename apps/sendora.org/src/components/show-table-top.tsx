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
  { name: 'ALL', uid: 'all' },
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
        <div className="flex flex-row fnlex-col justify-between gap-3 sm:items-end items-end">
          <Input
            isClearable
            className="w-full sm:max-w-[40%]"
            placeholder="Search by receipient ..."
            startContent={<SearchIcon />}
            value={searchKey}
            onClear={() => onClear()}
            onValueChange={onSearchChange}
          />

          <div className="flex gap-3   ">
            <Dropdown placement="bottom-end">
              <DropdownTrigger className="flex">
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
                items={statusOptions}
              >
                {(status) => {
                  return (
                    <DropdownItem key={status.uid} className="capitalize">
                      {capitalize(status.name)}
                    </DropdownItem>
                  );
                }}
              </DropdownMenu>
            </Dropdown>
          </div>
        </div>
        <div className="flex justify-between items-center">
          <span className="w-[60%] text-sm text-default-400">
            {selectedKeys === 'all'
              ? `${totalRecords} of ${totalRecords} selected`
              : `${selectedKeys.size} of ${totalRecords} selected`}
          </span>
          {selectedKeys === 'all' ? (
            <Button
              size="sm"
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
              Delete selected
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
              Delete selected
            </Button>
          ) : (
            <></>
          )}
        </div>
      </div>
    );
  },
);
