import { formatWei } from '@/libs/common';
import { getGasPrice } from '@/libs/common';
import { Slider } from '@heroui/react';
import { Button } from '@heroui/react';
import { Icon } from '@iconify/react';
import { useEffect, useState } from 'react';
import type { Chain } from 'viem';

type Iprops = {
  chain: Chain;
  onValueChange: (value: bigint) => void;
};

export const SetGasPrice = ({ chain, onValueChange }: Iprops) => {
  const [value, setValue] = useState(0.5);
  const [basePrice, setBasePrice] = useState(10000000n);

  const updateBasePrice = async (chainId: number) => {
    const gasPrice = await getGasPrice(chainId, '');

    console.log({ gasPrice, chain });
    setBasePrice(gasPrice);
  };

  useEffect(() => {
    getGasPrice(chain.id).then((gasPrice) => {
      setBasePrice(gasPrice);
    });
  }, [chain.id]);

  useEffect(() => {
    onValueChange((basePrice * 2n * BigInt(Math.ceil(value * 100))) / 100n);
  }, [value, basePrice, onValueChange]);

  return (
    <Slider
      color="foreground"
      className="max-w-md"
      getValue={(value) =>
        `${formatWei((basePrice * 2n * BigInt(Math.ceil(100 * (value as number)))) / 100n)}`
      }
      label="Gas Price"
      classNames={{
        label: 'relative text-base md:text-lg text-foreground-500',
      }}
      marks={[
        {
          value: 0.2,
          label: '🐢Low',
        },
        {
          value: 0.5,
          label: '🚗Avg',
        },
        {
          value: 0.8,
          label: '🚀High',
        },
      ]}
      maxValue={1}
      minValue={0}
      step={0.1}
      value={value}
      onChange={setValue}
      endContent={
        <Button
          onPress={() => updateBasePrice(chain.id)}
          isIconOnly
          aria-label="Refresh"
          size="sm"
        >
          <Icon
            icon="fluent:arrow-counterclockwise-12-regular"
            width="16"
            height="16"
          />
        </Button>
      }
    />
  );
};
