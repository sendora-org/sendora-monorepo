import { produce } from 'immer';
import { create } from 'zustand';

//  Define Step Type
type Step<T = unknown> = {
  id: number;
  name: string;
  description: string;
  data?: Record<string, T>;
};

// Define `useStep` States
type StepState = {
  steps: Step[];
  currentStep: number;
  initialized: boolean;
};

// Define `useStep` Actions
type StepActions<T = unknown> = {
  initializeSteps: (initialSteps: Step[]) => void;
  nextStep: () => void;
  prevStep: () => void;
  goToStep: (index: number) => void;
  setStepData: (stepIndex: number, newData: Record<string, T>) => void;
  resetSteps: () => void;
};

const createStepStore = () =>
  create<StepState & StepActions>((set) => ({
    steps: [],
    currentStep: 0,
    initialized: false,

    initializeSteps: (initialSteps) =>
      set(
        produce((state: StepState & StepActions) => {
          if (!state.initialized) {
            state.steps = initialSteps.map((step) => ({
              ...step,
              data: {},
            }));
            state.currentStep = 0;
            state.initialized = true;
          }
        }),
      ),

    nextStep: () =>
      set(
        produce((state: StepState) => {
          if (state.currentStep < state.steps.length - 1) {
            state.currentStep += 1;
          }
        }),
      ),

    prevStep: () =>
      set(
        produce((state: StepState) => {
          if (state.currentStep > 0) {
            state.currentStep -= 1;
          }
        }),
      ),

    goToStep: (index) =>
      set(
        produce((state: StepState) => {
          if (index >= 0 && index < state.steps.length) {
            state.currentStep = index;
          }
        }),
      ),

    setStepData: (stepIndex, newData) =>
      set(
        produce((state: StepState) => {
          if (stepIndex >= 0 && stepIndex < state.steps.length) {
            state.steps[stepIndex].data = {
              ...state.steps[stepIndex].data,
              ...newData,
            };
          }
        }),
      ),

    resetSteps: () =>
      set(
        produce((state: StepState) => {
          for (const step of state.steps) {
            step.data = {};
          }
          state.currentStep = 0;
        }),
      ),
  }));

const stepStores: Record<string, ReturnType<typeof createStepStore>> = {};

export const useStep = (name: string, steps: Step[]) => {
  if (!stepStores[name]) {
    stepStores[name] = createStepStore();
  }

  const store = stepStores[name]();

  if (!store.initialized) {
    store.initializeSteps(steps);
  }

  return store;
};
