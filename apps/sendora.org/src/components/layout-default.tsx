'use client';
import Footer from '@/components/footer';
import Navbar from '@/components/navbar';
import { Web3Provider } from '@/components/web3-provider';
import { getVisitorId } from '@/libs/common';
import { getConfig } from '@/libs/wagmi';
import clsx from 'clsx';
import type React from 'react';
import { base } from 'wagmi/chains';
import { SIWEProvider } from './siwe-provider';

export default function LayoutDefault({
  children,
  mainClasses = 'mt-[40px]',
}: {
  children: React.ReactNode;
  mainClasses?: string;
}) {
  getVisitorId();
  return (
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
  );
}
