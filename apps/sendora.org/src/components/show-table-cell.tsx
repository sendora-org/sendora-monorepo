import { formatBigIntNumber } from '@/libs/number';
import { Button, Chip, Tooltip, User } from '@heroui/react';
import { CopyText } from './copy-text';
import { DeleteIcon } from './delete-icon';
import { UserIcon } from './user-icon';

type IReceipent = {
  id: number;
  name: string;
  status: IStatus;
  ensName: string;
  address: string;
  addressType: string;
  amount: bigint;
  amountRaw: string;
};

type IStatus =
  | 'valid'
  | 'wrongAddress'
  | 'emptyAmount'
  | 'wrongAmount'
  | 'zeroAmount'
  | 'duplicateAddress';

type IColumnkeys =
  | 'id'
  | 'name'
  | 'status'
  | 'ensName'
  | 'address'
  | 'addressType'
  | 'amount'
  | 'actions';

type IColor = 'success' | 'danger' | 'warning';
const statusColorMap: Record<IStatus, IColor> = {
  valid: 'success',
  wrongAddress: 'danger',
  emptyAmount: 'danger',
  wrongAmount: 'danger',
  zeroAmount: 'warning',
  duplicateAddress: 'warning',
};

type IProps = {
  receipient: IReceipent;
  columnKey: IColumnkeys;
  thousandSeparator: string;
  decimalSeparator: string;
};

export const ShowTableCell = ({
  receipient,
  columnKey,
  thousandSeparator,
  decimalSeparator,
}: IProps) => {
  let cellValue = null;
  if (columnKey !== 'actions') {
    cellValue = receipient[columnKey];
  }

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
                // deleteLine([receipient.id]);
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
