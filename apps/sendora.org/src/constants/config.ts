// Ethereum Base Arbitrum BNBChain Polygon Avax
import { type Static, Type } from '@sinclair/typebox';

export const NetworkInfoType = Type.Object({
  name: Type.String(),
  symbol: Type.String(),
  avatar: Type.Optional(Type.String()),
  chainId: Type.String(),
  rpcURL: Type.String(),
  explorerURL: Type.String(),
});

export type NetworkInfo = Static<typeof NetworkInfoType>;

export const networks: NetworkInfo[] = [
  {
    name: 'Ethereum',
    symbol: 'ETH',
    avatar: '/chain-logo/evm_1.png',
    chainId: '1',
    rpcURL: 'https://eth.llamarpc.com',
    explorerURL: 'https://etherscan.io',
  },
  {
    name: 'Base',
    symbol: 'ETH',
    avatar: '/chain-logo/evm_8453.png',
    chainId: '8453',
    rpcURL: 'https://base.llamarpc.com',
    explorerURL: 'https://basescan.org',
  },
  {
    name: 'Arbitrum',
    symbol: 'ETH',
    avatar: '/chain-logo/evm_42161.png',
    chainId: '42161',
    rpcURL: 'https://arbitrum.llamarpc.com',
    explorerURL: 'https://arbiscan.io',
  },
  {
    name: 'BNB Chain',
    symbol: 'BNB',
    avatar: '/chain-logo/evm_56.png',
    chainId: '56',
    rpcURL: 'https://binance.llamarpc.com',
    explorerURL: 'https://bscscan.com',
  },
  {
    name: 'Polygon',
    symbol: 'POL',
    avatar: '/chain-logo/evm_137.png',
    chainId: '137',
    rpcURL: 'https://polygon.llamarpc.com',
    explorerURL: 'https://polygonscan.com',
  },
  {
    name: 'Avalanche',
    symbol: 'AVAX',
    avatar: '/chain-logo/evm_43114.png',
    chainId: '43114',
    rpcURL: 'https://avalanche.drpc.org',
    explorerURL: 'https://snowtrace.io',
  },
];

export const menuItems = [
  {
    name: 'Home',
    uri: 'home',
    url: '/',
  },

  {
    name: 'Native Coins',
    uri: 'native-coins',
    url: '/native-coins/1',
  },
  {
    name: 'ERC-20 Tokens',
    uri: 'erc20-tokens',
    url: '/erc20-tokens/1',
  },
  {
    name: 'Stablecoins',
    uri: 'stablecoins',
    url: '/stablecoins/1',
  },
  {
    name: 'NFT Transfers',
    uri: 'nft-transfers',
    url: '/nft-transfers/1',
  },
  {
    name: 'Portfolio',
    uri: 'portfolio',
    url: '/portfolio',
  },

  {
    name: 'CallThat',
    uri: 'callthat',
    url: '/callthat/1',
  },
];

export function findNetwork<T extends keyof NetworkInfo>(
  key: T,
  value: NetworkInfo[T],
): NetworkInfo | undefined {
  return networks.find((network) => network[key] === value);
}
