// Ethereum Base Arbitrum BNBChain Polygon Avax
import { type Static, Type } from '@sinclair/typebox';

export const NetworkInfoType = Type.Object({
  name: Type.String(),
  symbol: Type.String(),
  avatar: Type.Optional(Type.String()),
  chainId: Type.String(),
  rpcURL: Type.String(),
  explorerURL: Type.String(),
  toolFeePerUse: Type.Number(),
  blockGasLimit: Type.BigInt(),
  blockTime: Type.BigInt(),
  gasUsedForEthTransfer: Type.BigInt(),
  gasUsedForERC20Transfer: Type.BigInt(),
  isTestnet: Type.Boolean(),
  isPopular: Type.Boolean(),
  isEIP1559Supported: Type.Boolean(),
});

export type NetworkInfo = Static<typeof NetworkInfoType>;

export const networks: NetworkInfo[] = [
  {
    name: 'Ethereum',
    symbol: 'ETH',
    avatar: '/chain-logo/evm_1.png',
    chainId: '1',
    isTestnet: false,
    isPopular: true,
    isEIP1559Supported: true,
    rpcURL: 'https://1rpc.io/eth',
    explorerURL: 'https://etherscan.io',
    toolFeePerUse: 0.02,
    blockTime: 12_000n,
    blockGasLimit: 30_000_000n,
    gasUsedForEthTransfer: 21_000n,
    gasUsedForERC20Transfer: 84_000n,
  },
  {
    name: 'Base',
    symbol: 'ETH',
    avatar: '/chain-logo/evm_8453.png',
    chainId: '8453',
    isTestnet: false,
    isPopular: true,
    isEIP1559Supported: true,
    rpcURL: 'https://mainnet.base.org',
    explorerURL: 'https://basescan.org',
    toolFeePerUse: 0.02,
    blockTime: 2_000n,
    blockGasLimit: 120_000_000n,
    gasUsedForEthTransfer: 21_000n,
    gasUsedForERC20Transfer: 84_000n,
  },
  {
    name: 'Arbitrum',
    symbol: 'ETH',
    avatar: '/chain-logo/evm_42161.png',
    chainId: '42161',
    isTestnet: false,
    isPopular: true,
    isEIP1559Supported: true,
    rpcURL: 'https://arb1.arbitrum.io/rpc',
    explorerURL: 'https://arbiscan.io',
    toolFeePerUse: 0.02,
    blockTime: 250n,
    blockGasLimit: 1_125_899_906_842_624n,
    gasUsedForEthTransfer: 21_000n,
    gasUsedForERC20Transfer: 84_000n,
  },

  // {
  //   name: 'Abstract',
  //   symbol: 'ETH',
  //   avatar: '/chain-logo/evm_2741.png',
  //   chainId: '2741',
  //   rpcURL: 'https://api.mainnet.abs.xyz',
  //   explorerURL: 'https://abscan.org',
  //   toolFeePerUse: 0.02,
  //   blockGasLimit: 1_125_899_906_842_624,
  //   gasUsedForEthTransfer
  // },

  {
    name: 'OP Mainnet',
    symbol: 'ETH',
    avatar: '/chain-logo/evm_10.png',
    chainId: '10',
    isTestnet: false,
    isPopular: false,
    isEIP1559Supported: true,
    rpcURL: 'https://optimism.llamarpc.com',
    explorerURL: 'https://optimistic.etherscan.io',
    toolFeePerUse: 0.02,
    blockTime: 2_000n,
    blockGasLimit: 60_000_000n,
    gasUsedForEthTransfer: 21_000n,
    gasUsedForERC20Transfer: 84_000n,
  },
  {
    name: 'BNB Chain',
    symbol: 'BNB',
    avatar: '/chain-logo/evm_56.png',
    chainId: '56',
    isTestnet: false,
    isPopular: true,
    isEIP1559Supported: false,
    rpcURL: 'https://bsc-dataseed4.bnbchain.org',
    explorerURL: 'https://bscscan.com',
    toolFeePerUse: 0.05,
    blockTime: 3_000n,
    blockGasLimit: 140_000_000n,
    gasUsedForEthTransfer: 21_000n,
    gasUsedForERC20Transfer: 84_000n,
  },
  {
    name: 'Polygon',
    symbol: 'POL',
    avatar: '/chain-logo/evm_137.png',
    chainId: '137',
    isTestnet: false,
    isPopular: true,
    isEIP1559Supported: true,
    rpcURL: 'https://polygon.llamarpc.com',
    explorerURL: 'https://polygonscan.com',
    toolFeePerUse: 150,
    blockTime: 2_200n,
    blockGasLimit: 30_000_000n,
    gasUsedForEthTransfer: 21_000n,
    gasUsedForERC20Transfer: 84_000n,
  },
  {
    name: 'Berachain',
    symbol: 'BERA',
    avatar: '/chain-logo/evm_80094.png',
    chainId: '80094',
    isTestnet: false,
    isPopular: true,
    isEIP1559Supported: false,
    rpcURL: 'https://rpc.berachain.com',
    explorerURL: 'https://berascan.com',
    toolFeePerUse: 5,
    blockTime: 2_000n,
    blockGasLimit: 2_700_000_000n,
    gasUsedForEthTransfer: 21_000n,
    gasUsedForERC20Transfer: 84_000n,
  },
  {
    name: 'Kaia Mainnet',
    symbol: 'KAIA',
    avatar: '/chain-logo/evm_8217.png',
    chainId: '8217',
    isTestnet: false,
    isPopular: true,
    isEIP1559Supported: true,
    rpcURL: 'https://public-en.node.kaia.io',
    explorerURL: 'https://kaiascan.io',
    toolFeePerUse: 300,
    blockTime: 1_000n,
    blockGasLimit: 60_000_000n,
    gasUsedForEthTransfer: 21_000n,
    gasUsedForERC20Transfer: 84_000n,
  },

  {
    name: 'Avalanche',
    symbol: 'AVAX',
    avatar: '/chain-logo/evm_43114.png',
    chainId: '43114',
    isTestnet: false,
    isPopular: false,
    isEIP1559Supported: true,
    rpcURL: 'https://avalanche.drpc.org',
    explorerURL: 'https://43114.snowtrace.io',
    toolFeePerUse: 2,
    blockTime: 1_000n,
    blockGasLimit: 30_000_000n,
    gasUsedForEthTransfer: 21_000n,
    gasUsedForERC20Transfer: 84_000n,
  },

  {
    name: 'Sepolia',
    symbol: 'tETH',
    avatar: '/chain-logo/evm_11155111.png',
    chainId: '11155111',
    isTestnet: true,
    isPopular: false,
    isEIP1559Supported: true,
    rpcURL: 'https://sepolia.drpc.org',
    explorerURL: 'https://sepolia.etherscan.io',
    toolFeePerUse: 0.02,
    blockTime: 12_000n,
    blockGasLimit: 30_000_000n,
    gasUsedForEthTransfer: 21_000n,
    gasUsedForERC20Transfer: 84_000n,
  },

  {
    name: 'Base Sepolia',
    symbol: 'tETH',
    avatar: '/chain-logo/evm_84532.png',
    chainId: '84532',
    isTestnet: true,
    isPopular: false,
    isEIP1559Supported: true,
    rpcURL: 'https://sepolia.base.org',
    explorerURL: 'https://sepolia.basescan.org',
    toolFeePerUse: 0.02,
    blockTime: 2_000n,
    blockGasLimit: 60_000_000n,
    gasUsedForEthTransfer: 21_000n,
    gasUsedForERC20Transfer: 84_000n,
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
