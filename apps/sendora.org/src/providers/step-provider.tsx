import React, { createContext, useContext } from 'react';
import { type StoreApi, useStore } from 'zustand';
import {
  type IStep,
  type StepState,
  createStepStore,
} from '../stores/stepStore';

const StepContext = createContext<StoreApi<IStep> | null>(null);

export const StepProvider: React.FC<{
  children: React.ReactNode;
  initialStepState: StepState;
}> = ({ children, initialStepState }) => {
  const storeRef = React.useRef<StoreApi<IStep> | null>(null);

  if (!storeRef.current) {
    storeRef.current = createStepStore(initialStepState);
  }

  return (
    <StepContext.Provider value={storeRef.current}>
      {children}
    </StepContext.Provider>
  );
};

export const useScopedStep = <T,>(selector: (state: IStep) => T) => {
  const store = useContext(StepContext);
  if (!store) throw new Error('Store is missing Provider');
  return useStore(store, selector);
};
