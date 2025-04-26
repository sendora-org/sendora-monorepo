'use client';
import useAuthStore from '@/hooks/useAuth';
import { Button, Input } from '@heroui/react';
import { ConnectButton } from '@rainbow-me/rainbowkit';
export default ({
  showAddr,
  register,
}: {
  showAddr?: boolean;
  // biome-ignore  lint/suspicious/noExplicitAny: reason
  register?: (name: string) => any;
}) => {
  const { loginAddress, logout } = useAuthStore();
  return (
    <ConnectButton.Custom>
      {({
        account,
        chain,
        openAccountModal,
        openChainModal,
        openConnectModal,
        authenticationStatus,
        mounted,
      }) => {
        // Note: If your app doesn't use authentication, you
        // can remove all 'authenticationStatus' checks
        const ready = mounted && authenticationStatus !== 'loading';
        const connected =
          ready &&
          account &&
          chain &&
          (!authenticationStatus || authenticationStatus === 'authenticated');

        return (
          <div
            className="w-full"
            {...(!ready && {
              'aria-hidden': true,
              style: {
                opacity: 0,
                pointerEvents: 'none',
                userSelect: 'none',
              },
            })}
          >
            {(() => {
              if (!connected) {
                return (
                  <Button
                    fullWidth
                    onPress={() => {
                      // @ts-ignore
                      window?.stonks?.event('Connect Button click');
                      openConnectModal();
                    }}
                    type="button"
                    color="secondary"
                  >
                    Connect Wallet
                  </Button>
                );
              }

              if (chain.unsupported) {
                return (
                  <Button
                    fullWidth
                    onPress={openChainModal}
                    type="button"
                    color="danger"
                  >
                    Wrong network
                  </Button>
                );
              }

              if (showAddr) {
                return (
                  <Input
                    isReadOnly
                    value={account?.address}
                    {...register?.('from')}
                  />
                );
              }
              return <></>;
            })()}
          </div>
        );
      }}
    </ConnectButton.Custom>
  );
};
