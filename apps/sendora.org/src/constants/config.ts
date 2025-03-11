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
    name: 'ERC20s',
    uri: 'erc20s',
    url: '/erc20s/1',
  },
  // {
  //   name: "NFTs",
  //   uri: "nfts",
  //   url: "/nfts/1",
  // },
  // {
  //   name: "Fiats",
  //   uri: "fiats",
  //   url: "/fiats/1",
  // },

  // {
  //   name: "Airdrops",
  //   uri: "airdrops",
  //   url: "/airdrops/1",
  // },
  // {
  //   name: "Callthis",
  //   uri: "callthis",
  //   url: "/callthis/1",
  // },
  // {
  //   name: "4ever",
  //   uri: "4ever",
  //   url: "/4ever",
  // },
  // {
  //   name: "Portfolio",
  //   uri: "portfolio",
  //   url: "/portfolio/1",
  // },
];
