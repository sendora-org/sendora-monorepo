import React, { createContext, useContext } from 'react';
import { type StoreApi, useStore } from 'zustand';
import {
  type CallStepState,
  createCallBuilderStore,
} from '../stores/callBuilderStore';

const CallBuilderContext = createContext<StoreApi<CallStepState> | null>(null);

export const CallBuilderProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const storeRef = React.useRef<StoreApi<CallStepState> | null>(null);

  if (!storeRef.current) {
    storeRef.current = createCallBuilderStore();
  }

  return (
    <CallBuilderContext.Provider value={storeRef.current}>
      {children}
    </CallBuilderContext.Provider>
  );
};

export const useScopedCallBuilder = <T,>(
  selector: (state: CallStepState) => T,
) => {
  const store = useContext(CallBuilderContext);
  if (!store) throw new Error('Store is missing Provider');
  return useStore(store, selector);
};
