import { create } from 'zustand';
import { persist } from 'zustand/middleware';
interface RpcStoreState {
  customRpcs: Record<number, string[]>;
  activeRpc: Record<number, string>;

  setRpcs: (chainId: number, rpcUrls: string[]) => void;
  addRpc: (chainId: number, rpcUrl: string) => void;
  removeRpc: (chainId: number, rpcUrl: string) => void;

  setActiveRpc: (chainId: number, rpcUrl: string) => void;
  getActiveRpc: (chainId: number) => string | undefined;

  clearChain: (chainId: number) => void;
  clearAll: () => void;
}

export const useRpcStore = create<RpcStoreState>()(
  persist(
    (set, get) => ({
      customRpcs: {},
      activeRpc: {},

      setRpcs: (chainId, rpcUrls) => {
        const uniqueUrls = [...new Set(rpcUrls)];
        const newActive = get().activeRpc[chainId];
        const validActive = uniqueUrls.includes(newActive ?? '')
          ? newActive
          : uniqueUrls[0];

        set((state) => ({
          customRpcs: {
            ...state.customRpcs,
            [chainId]: uniqueUrls,
          },
          activeRpc: {
            ...state.activeRpc,
            [chainId]: validActive,
          },
        }));
      },

      addRpc: (chainId, rpcUrl) => {
        const current = get().customRpcs[chainId] || [];
        const updated = [...new Set([...current, rpcUrl])];

        set((state) => {
          const currentActive = state.activeRpc[chainId];
          const active = currentActive || rpcUrl;

          return {
            customRpcs: {
              ...state.customRpcs,
              [chainId]: updated,
            },
            activeRpc: {
              ...state.activeRpc,
              [chainId]: active,
            },
          };
        });
      },

      removeRpc: (chainId, rpcUrl) => {
        const current = get().customRpcs[chainId] || [];
        const filtered = current.filter((url) => url !== rpcUrl);

        set((state) => {
          const newCustomRpcs = { ...state.customRpcs };
          const newActiveRpc = { ...state.activeRpc };

          if (filtered.length > 0) {
            newCustomRpcs[chainId] = filtered;
            if (state.activeRpc[chainId] === rpcUrl) {
              newActiveRpc[chainId] = filtered[0];
            }
          } else {
            delete newCustomRpcs[chainId];
            delete newActiveRpc[chainId];
          }

          return {
            customRpcs: newCustomRpcs,
            activeRpc: newActiveRpc,
          };
        });
      },

      setActiveRpc: (chainId, rpcUrl) => {
        // const current = get().customRpcs[chainId] || [];

        // console.log(222, { chainId, rpcUrl, setActiveRpc: "setActiveRpc", current },)
        // if (!current.includes(rpcUrl)) {
        //     return;
        // }

        console.log({ chainId, rpcUrl, setActiveRpc: 'setActiveRpc' });

        set((state) => ({
          activeRpc: {
            ...state.activeRpc,
            [chainId]: rpcUrl,
          },
        }));
      },

      getActiveRpc: (chainId) => get().activeRpc[chainId],

      clearChain: (chainId) =>
        set((state) => {
          const newRpcs = { ...state.customRpcs };
          const newActive = { ...state.activeRpc };
          delete newRpcs[chainId];
          delete newActive[chainId];
          return {
            customRpcs: newRpcs,
            activeRpc: newActive,
          };
        }),

      clearAll: () => set({ customRpcs: {}, activeRpc: {} }),
    }),
    {
      name: 'useRpcStore',
    },
  ),
);
