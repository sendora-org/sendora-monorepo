import useAuthStore from '@/hooks/useAuth';
import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { createAuthenticationAdapter } from '@rainbow-me/rainbowkit';
// Using IndexedDB via https://github.com/jakearchibald/idb-keyval
import { del, get, set } from 'idb-keyval';
import { createSiweMessage } from 'viem/siwe';
import { createStorage } from 'wagmi';
import type { Chain } from 'wagmi/chains';

import type { Hex } from 'viem';
import { getVisitorId } from './common';

export const getConfig = (chain: Chain, key = 'CONN') => {
  const config = getDefaultConfig({
    storage: getStorage(key),
    appName: 'sendora.org',
    projectId: '82de9b28b665d7e644540021561bc212',
    chains: [chain],
    ssr: false,
    appDescription: '$SNDRA rises! 🚀 Building the best tool for Web3!',
    appUrl: 'https://sendora.org',
    appIcon: 'https://sendora.org/logo.png',
  });
  console.log('correct chain => ', chain);
  return config;
};

export const getAuthAdapter = () => {
  const authenticationAdapter = createAuthenticationAdapter({
    getNonce: async () => {
      return await getVisitorId();
    },
    createMessage: ({ nonce, address, chainId }) => {
      return createSiweMessage({
        domain: window.location.host,
        address,
        statement: 'Sign in with Ethereum to sendora.org.',
        uri: window.location.origin,
        version: '1',
        chainId,
        nonce,
      });
    },
    verify: async ({ message, signature }) => {
      console.log('verify', { message, signature });

      const { login } = useAuthStore.getState();
      login(message, signature as Hex);

      return true;
    },
    signOut: async () => {
      console.log('signOut');
      // const { logout } = useAuthStore.getState();
      // logout();
    },
  });

  return authenticationAdapter;
};

export const getStorage = (key = 'CONN') => {
  const storage = createStorage({
    key,
    storage: {
      async getItem(name) {
        return get(name);
      },
      async setItem(name, value) {
        await set(name, value);
      },
      async removeItem(name) {
        await del(name);
      },
    },
  });

  return storage;
};
