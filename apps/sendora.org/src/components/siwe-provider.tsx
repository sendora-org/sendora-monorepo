'use client';
import '@rainbow-me/rainbowkit/styles.css';
import useAuthStore from '@/hooks/useAuth';
import { getAuthAdapter } from '@/libs/wagmi';
import { getConfig } from '@/libs/wagmi';
import {
  type Chain,
  RainbowKitAuthenticationProvider,
  RainbowKitProvider,
  darkTheme,
} from '@rainbow-me/rainbowkit';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type React from 'react';
import { useEffect } from 'react';
import type { Config } from 'wagmi';
import { WagmiProvider } from 'wagmi';
import { base } from 'wagmi/chains';

const queryClient = new QueryClient();

export const SIWEProvider = ({
  children,
  chain,
}: { children: React.ReactNode; chain: Chain }) => {
  const { status } = useAuthStore();
  return (
    <WagmiProvider config={getConfig(chain, 'SIWE')}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitAuthenticationProvider
          enabled={true}
          adapter={getAuthAdapter()}
          status={status}
        >
          <RainbowKitProvider
            theme={darkTheme({ accentColor: '#7b3fe4' })}
            modalSize="compact"
          >
            {children}
          </RainbowKitProvider>
        </RainbowKitAuthenticationProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
};
