import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import type { Chain } from 'wagmi/chains';

export const getConfig = (chain: Chain) => {
  const config = getDefaultConfig({
    appName: 'sendora.org',
    projectId: '82de9b28b665d7e644540021561bc212',
    chains: [chain],
    ssr: false,
  });
  console.log('correct chain => ', chain);
  return config;
};
