import { getGasPrice } from '@/libs/common';
import { useCallback, useEffect, useState } from 'react';

interface UseGasPriceParams {
  chainId: number | null | undefined;
}

interface UseGasPriceResult {
  gasPrice: bigint;
  loading: boolean;
  error: Error | null;
  refresh: () => void;
}

export function useGasPrice({ chainId }: UseGasPriceParams): UseGasPriceResult {
  const [gasPrice, setGasPrice] = useState<bigint>(0n);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchGasPrice = useCallback(async () => {
    if (!chainId) return;

    setLoading(true);
    setError(null);

    try {
      const price = await getGasPrice(chainId);

      setGasPrice(price);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, [chainId, getGasPrice]);

  useEffect(() => {
    fetchGasPrice();
  }, [fetchGasPrice]);

  return {
    gasPrice,
    loading,
    error,
    refresh: fetchGasPrice,
  };
}
