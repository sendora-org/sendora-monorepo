import { ConnectButton as RainbowConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount } from 'wagmi';

export default () => {
  const { isConnected } = useAccount();
  return <>{isConnected && <RainbowConnectButton />}</>;
};
