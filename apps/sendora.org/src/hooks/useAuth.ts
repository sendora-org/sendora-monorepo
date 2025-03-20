import { findNetwork, networks } from '@/constants/config';
import { getVisitorId } from '@/libs/common';
import { composeViemChain } from '@/libs/wagmi';
import { Siwe } from 'ox';
import type { Hex } from 'viem';
import { http, createPublicClient, createWalletClient, custom } from 'viem';
import { base, mainnet } from 'viem/chains';
import { create } from 'zustand';

type AuthStatus = 'unauthenticated' | 'loading' | 'authenticated';

interface AuthState {
  status: AuthStatus;
  loginAddress: Hex;

  login: (message: string, signature: Hex) => Promise<void>;
  logout: () => void;
  guard: () => NodeJS.Timeout | number;
}

const getInitialAuthState = (): AuthStatus => {
  if (typeof localStorage !== 'undefined') {
    try {
      const result = localStorage.getItem('authStatus');
      const { address, message, signature } = JSON.parse(result ?? '');
      const { nonce } = Siwe.parseMessage(message);
      if (nonce && address && message && signature) {
        return 'authenticated';
      }
    } catch (e) {
      // console.log('getInitialAuthState =>', e);
    }
  }

  return 'unauthenticated';
};

const getInitialAuthAddress = (): Hex => {
  if (typeof localStorage !== 'undefined') {
    try {
      const result = localStorage.getItem('authStatus');
      const { address, message, signature } = JSON.parse(result ?? '');
      const { nonce } = Siwe.parseMessage(message);
      if (nonce && address && message && signature) {
        return address as Hex;
      }
    } catch (e) {
      // console.log('getInitialAuthAddress =>', e);
    }
  }

  return '0x';
};

const useAuthStore = create<AuthState>((set) => ({
  status: getInitialAuthState(),
  loginAddress: getInitialAuthAddress(),
  login: async (message: string, signature: Hex) => {
    try {
      const { address } = Siwe.parseMessage(message);
      localStorage.setItem(
        'authStatus',
        JSON.stringify({
          address: address,
          message: message,
          signature: signature,
        }),
      );
      set({ status: 'authenticated', loginAddress: address });
    } catch (e) {
      console.log('login error=>', e);
      set({ status: 'unauthenticated' });
    }
  },

  logout: () => {
    set({ status: 'unauthenticated' });
    localStorage.setItem('authStatus', '');
  },

  guard: () => {
    return setInterval(
      async () => {
        try {
          const result = localStorage.getItem('authStatus');
          const { address, message, signature } = JSON.parse(result ?? '');
          const { nonce, chainId } = Siwe.parseMessage(message);

          const visitId = await getVisitorId();
          console.log('meta', { nonce, visitId });

          const network =
            findNetwork('chainId', String(chainId)) ?? networks[0];
          const publicClient = createPublicClient({
            chain: composeViemChain(network),
            transport: http(),
          });

          const valid = await publicClient.verifyMessage({
            address: address,
            message: message,
            signature,
          });

          if (nonce === visitId && valid) {
            console.log('ooookk');
            // set({ status: 'authenticated', loginAddress: address });
          } else {
            console.log('failedddddd', { nonce, visitId, valid });
            set({ status: 'unauthenticated' });
          }
        } catch (error) {
          console.error('❌ guard error:', error);
          set({ status: 'unauthenticated' });
        }
      },
      10 * 60 * 1000,
    );
  },
}));

export default useAuthStore;
