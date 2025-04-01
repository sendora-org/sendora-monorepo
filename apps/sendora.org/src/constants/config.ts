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
    rpcURL: 'https://1rpc.io/eth',
    explorerURL: 'https://etherscan.io',
  },
  {
    name: 'Base',
    symbol: 'ETH',
    avatar: '/chain-logo/evm_8453.png',
    chainId: '8453',
    rpcURL: 'https://mainnet.base.org',
    explorerURL: 'https://basescan.org',
  },
  {
    name: 'Arbitrum',
    symbol: 'ETH',
    avatar: '/chain-logo/evm_42161.png',
    chainId: '42161',
    rpcURL: 'https://arb1.arbitrum.io/rpc',
    explorerURL: 'https://arbiscan.io',
  },

  {
    name: 'Abstract',
    symbol: 'ETH',
    avatar: '/chain-logo/evm_2741.png',
    chainId: '2741',
    rpcURL: 'https://api.mainnet.abs.xyz',
    explorerURL: 'https://abscan.org',
  },

  {
    name: 'OP Mainnet',
    symbol: 'ETH',
    avatar: '/chain-logo/evm_10.png',
    chainId: '10',
    rpcURL: 'https://optimism.llamarpc.com',
    explorerURL: 'https://optimistic.etherscan.io',
  },
  {
    name: 'BNB Chain',
    symbol: 'BNB',
    avatar: '/chain-logo/evm_56.png',
    chainId: '56',
    rpcURL: 'https://bsc-dataseed4.bnbchain.org',
    explorerURL: 'https://bscscan.com',
  },
  {
    name: 'Kaia Mainnet',
    symbol: 'KAIA',
    avatar: '/chain-logo/evm_8217.png',
    chainId: '8217',
    rpcURL: 'https://public-en.node.kaia.io',
    explorerURL: 'https://kaiascan.io',
  },
  {
    name: 'Berachain',
    symbol: 'BERA',
    avatar: '/chain-logo/evm_80094.png',
    chainId: '80094',
    rpcURL: 'https://rpc.berachain.com',
    explorerURL: 'https://berascan.com',
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
    name: 'Callthat',
    uri: 'callthat',
    url: '/callthat/1',
  },
  {
    name: 'Portfolio',
    uri: 'portfolio',
    url: '/portfolio',
  },
];

export function findNetwork<T extends keyof NetworkInfo>(
  key: T,
  value: NetworkInfo[T],
): NetworkInfo | undefined {
  return networks.find((network) => network[key] === value);
}
