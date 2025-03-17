import useAuthStore from '@/hooks/useAuth';
import { shortAddress } from '@/libs/common';
import { Button } from '@heroui/react';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useEffect } from 'react';
import LoginProfile from './login-profile';

export const SignIn = () => {
  const { status, loginAddress, guard } = useAuthStore();
  useEffect(() => {
    const id = guard();
    return () => {
      clearInterval(id);
    };
  }, [guard]);

  // if (status === 'authenticated') {
  //   return <LoginProfile
  //     address={loginAddress}
  //     displayName={shortAddress(loginAddress)}
  //   />
  // }
  return (
    <>
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
                if (authenticationStatus === 'authenticated') {
                  return (
                    <LoginProfile
                      address={loginAddress}
                      displayName={shortAddress(loginAddress)}
                    />
                  );
                }
                if (!connected) {
                  return (
                    <Button
                      onPress={() => {
                        window?.stonks.event('Sign In Button click');
                        openConnectModal();
                      }}
                      type="button"
                    >
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
              })()}
            </div>
          );
        }}
      </ConnectButton.Custom>
    </>
  );
};
