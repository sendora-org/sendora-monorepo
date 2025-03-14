import { getVisitorId } from '@/libs/common';
import { Secp256k1 } from 'ox';
import { Signature, Siwe } from 'ox';
import { recoverAddress } from 'viem';
import { hashMessage } from 'viem';
import type { Hex } from 'viem';
import { http, createPublicClient, createWalletClient, custom } from 'viem';
import { base } from 'viem/chains';
import { create } from 'zustand';

type AuthStatus = 'unauthenticated' | 'loading' | 'authenticated';

interface AuthState {
    status: AuthStatus;
    login: (message: string, signature: Hex) => Promise<void>;
    logout: () => void;
    guard: () => NodeJS.Timeout | number;
}

const getInitialAuthState = (): AuthStatus => {

    if (typeof localStorage != 'undefined') {
        try {
            const result = localStorage.getItem('authStatus');
            const { address, message, signature } = JSON.parse(result ?? '');
            const { nonce } = Siwe.parseMessage(message);
            if (nonce && address && message && signature) {
                return 'authenticated';
            }

            // if (Secp256k1.recoverAddress({
            //     payload: hashMessage(message),
            //     signature: Signature.fromHex(signature),
            // }).toLocaleLowerCase() == (address as string).toLocaleLowerCase()) {
            //     return "authenticated"
            // }
        } catch (e) {
            localStorage.setItem('authStatus', '');
            console.log('getInitialAuthState =>', e);
        }
    }

    return 'unauthenticated';
};

const useAuthStore = create<AuthState>((set) => ({
    status: getInitialAuthState(),

    login: async (message: string, signature: Hex) => {
        try {
            const { address } = Siwe.parseMessage(message);
            localStorage.setItem(
                'authStatus',
                JSON.stringify({
                    address: address,
                    message: message,
                    signature: signature,
                }),
            );
            set({ status: 'authenticated' });
        } catch (e) {
            console.log('login error=>', e);
            set({ status: 'unauthenticated' });
        }
    },

    logout: () => {
        set({ status: 'unauthenticated' });
        localStorage.setItem('authStatus', '');
    },

    guard: () => {
        const publicClient = createPublicClient({
            chain: base,
            transport: http(),
        });
        return setInterval(async () => {
            try {
                console.log('guard');
                const result = localStorage.getItem('authStatus');
                const { address, message, signature } = JSON.parse(result ?? '');
                const { nonce } = Siwe.parseMessage(message);
                const visitId = await getVisitorId();

                const valid = await publicClient.verifyMessage({
                    address: address,
                    message: message,
                    signature,
                });

                console.log({ valid });

                if (nonce === visitId && valid) {
                    set({ status: 'authenticated' });
                } else {
                    set({ status: 'unauthenticated' });
                }
            } catch (error) {
                console.error('❌ guard error:', error);
                set({ status: 'unauthenticated' });
            }
        }, 3 * 1000);
    },
}));

export default useAuthStore;
