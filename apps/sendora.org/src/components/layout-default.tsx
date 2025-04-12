'use client';
import Footer from '@/components/footer';
import Navbar from '@/components/navbar';
import { Web3Provider } from '@/components/web3-provider';
import { networks } from '@/constants/config';
import { getVisitorId } from '@/libs/common';
import { getConfig } from '@/libs/wagmi';
import type { Chain } from '@rainbow-me/rainbowkit';
import clsx from 'clsx';
import type React from 'react';
import { base } from 'wagmi/chains';
import { SIWEProvider } from './siwe-provider';

export default function LayoutDefault({
  children,
  mainClasses = 'mt-[30px] sm:mt-[40px]',
  footClasess = 'mt-[150px] md:mt-[200px]',
  chain = base,
  uri,
}: {
  children: React.ReactNode;
  mainClasses?: string;
  footClasess?: string;
  chain?: Chain;
  uri?: string;
}) {
  return (
    <SIWEProvider chain={chain}>
      <div className="relative flex h-screen min-h-dvh w-full flex-col overflow bg-background">
        <Navbar uri={uri} />

        <main
          className={clsx(
            'container mx-auto flex max-w-[1024px] flex-col items-start px-2 sm:px-6',
            mainClasses,
          )}
        >
          {children}
        </main>
        <div className={clsx('', footClasess)}>
          <Footer />
        </div>
      </div>
    </SIWEProvider>
  );
}
