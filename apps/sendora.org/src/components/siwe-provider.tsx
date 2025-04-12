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
  lightTheme,
} from '@rainbow-me/rainbowkit';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useTheme } from 'next-themes';
import type React from 'react';
import { useEffect } from 'react';
import type { Config } from 'wagmi';
import { WagmiProvider, useAccount } from 'wagmi';
import { base } from 'wagmi/chains';

const queryClient = new QueryClient();

export const SIWEProvider = ({
  children,
  chain,
}: { children: React.ReactNode; chain: Chain }) => {
  const { status, loginAddress, logout } = useAuthStore();
  const { theme } = useTheme();
  return (
    <WagmiProvider config={getConfig(chain, 'SIWE')}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitAuthenticationProvider
          enabled={true}
          adapter={getAuthAdapter()}
          status={status}
        >
          <RainbowKitProvider
            theme={
              theme === 'dark'
                ? darkTheme({ accentColor: '#7b3fe4' })
                : lightTheme()
            }
            modalSize="compact"
          >
            <Wrapper>{children}</Wrapper>
          </RainbowKitProvider>
        </RainbowKitAuthenticationProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
};

export const Wrapper = ({ children }: { children: React.ReactNode }) => {
  const { status, loginAddress, logout } = useAuthStore();

  const { address } = useAccount();

  useEffect(() => {
    if (status === 'authenticated' && address) {
      if (loginAddress.toLowerCase() !== address.toLowerCase()) {
        logout();
      }
    }
  }, [status, address, loginAddress, logout]);
  return <>{children}</>;
};
