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
  chain = base,
}: {
  children: React.ReactNode;
  mainClasses?: string;
  chain: Chain;
}) {
  getVisitorId();
  return (
    <SIWEProvider chain={chain}>
      <div className="relative flex h-screen min-h-dvh w-full flex-col overflow bg-background">
        <Navbar />

        <main
          className={clsx(
            'container mx-auto flex max-w-[1280px] flex-col items-start px-8',
            mainClasses,
          )}
        >
          {children}
        </main>
        <div className="mt-[450px] md:mt-[650px]">
          <Footer />
        </div>
      </div>
    </SIWEProvider>
  );
}
