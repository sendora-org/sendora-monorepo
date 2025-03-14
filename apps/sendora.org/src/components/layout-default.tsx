'use client';
import Footer from '@/components/footer';
import Navbar from '@/components/navbar';
import { Web3Provider } from '@/components/web3-provider';
import { getVisitorId } from '@/libs/common';
import { getConfig } from '@/libs/wagmi';
import type React from 'react';
import { base } from 'wagmi/chains';
import { SIWEProvider } from './siwe-provider';

export default function LayoutDefault({
  children,
}: {
  children: React.ReactNode;
}) {
  getVisitorId();
  return (
    <div className="relative flex h-screen min-h-dvh w-full flex-col overflow bg-background">
      <Navbar />

      <main className="container mx-auto mt-[80px] flex max-w-[1024px] flex-col items-start px-8">
        {children}
      </main>
      <div className="mt-[450px] md:mt-[650px]">
        <Footer />
      </div>
    </div>
  );
}
