import { Button } from '@heroui/react';
import { useCall } from 'wagmi';

export const CallButton = ({ account, to, data, value, gasPrice }: any) => {
  const result = useCall({
    account: '0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266',
    data: data,
    to: to,
    value,
    // gasPrice
  });

  console.log('call result', { result });

  return <Button>Read</Button>;
};
