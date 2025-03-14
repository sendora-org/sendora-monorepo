import { Button } from '@heroui/react';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import LoginProfile from './login-profile';
export const SignIn = () => {
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
                  <Button onPress={openConnectModal} type="button">
                    Sign In
                  </Button>
                );
              }
              if (chain.unsupported) {
                return (
                  <Button onPress={openChainModal} type="button">
                    Wrong network
                  </Button>
                );
              }
              return (
                <LoginProfile
                  address={account.address}
                  displayName={account.displayName}
                  displayBalance={account.displayBalance}
                />
              );
            })()}
          </div>
        );
      }}
    </ConnectButton.Custom>
  );
};
