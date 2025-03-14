'use client';
import '@rainbow-me/rainbowkit/styles.css';
import { RainbowKitProvider, darkTheme } from '@rainbow-me/rainbowkit';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type React from 'react';
import type { Config } from 'wagmi';
import { WagmiProvider } from 'wagmi';

// import {
//     mainnet,
//     polygon,
//     optimism,
//     arbitrum,
//     base,
// } from 'wagmi/chains';

const queryClient = new QueryClient();

export const Web3Provider = ({
  children,
  config,
}: { children: React.ReactNode; config: Config }) => {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider
          theme={darkTheme({ accentColor: '#7b3fe4' })}
          modalSize="compact"
        >
          {children}
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
};
