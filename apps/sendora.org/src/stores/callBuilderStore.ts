import { nanoid } from 'nanoid';
import type { Hex } from 'viem';
import { createStore } from 'zustand';

export type CallStep = {
  id: string;
  to: string;
  value: bigint;
  abi: string;
  contractMethod: string; // human-readable abi item
  // biome-ignore  lint/suspicious/noExplicitAny: reason
  args?: any[];
  functionType: string;
};

export const mockStep = (): CallStep => {
  return {
    id: nanoid(),
    to: '',
    value: 0n,
    abi: '',
    contractMethod: '',
    args: [],
    functionType: 'readable',
  };
};

export type CallStepState = {
  currentStep: string;
  steps: CallStep[];
  addStep: () => void;
  removeStep: (id?: string) => void;
  updateStep: (id?: string, data?: Partial<CallStep>) => void;
  setCurrentStep: (id: string) => void;
  setSteps: (newSteps: CallStep[]) => void;
};

export const createCallBuilderStore = () => {
  const mock = mockStep();
  return createStore<CallStepState>((set) => ({
    currentStep: mock.id,
    steps: [mock],
    addStep: () =>
      set((state) => {
        const mock = mockStep();

        return { currentStep: mock.id, steps: [...state.steps, mock] };
      }),
    removeStep: (id) => {
      set((state) => {
        if (id === state.currentStep) {
          let idx = state.steps.findIndex((s) => s.id === id);
          if (idx > 0) {
            idx = idx - 1;
          }

          return {
            currentStep: state.steps[idx].id,
            steps:
              state.steps.length > 1
                ? state.steps.filter((s) => s.id !== id)
                : state.steps,
          };
        }
        return {
          steps:
            state.steps.length > 1
              ? state.steps.filter((s) => s.id !== id)
              : state.steps,
        };
      });
    },
    updateStep: (id, data) => {
      set((state) => ({
        steps: state.steps.map((s) => (s.id === id ? { ...s, ...data } : s)),
      }));
    },
    setCurrentStep: (id: string) => set(() => ({ currentStep: id })),
    setSteps: (newSteps) => set({ steps: newSteps }),
  }));
};
