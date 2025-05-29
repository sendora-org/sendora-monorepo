import { produce } from 'immer';
import { create } from 'zustand';
import { createStore } from 'zustand';

//  Define Step Type
export type Step<T = unknown> = {
  id: number;
  name: string;
  description: string;
  data?: T | string | null;
};

// Define `useStep` States
export type StepState = {
  initialSteps: Step[];
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
  setStepData: (stepIndex: number, newData: T | string) => void;
  resetSteps: () => void;
};

export type IStep = StepState & StepActions;

export const createStepStore = (initialStepState: StepState) => {
  return createStore<StepState & StepActions>((set) => ({
    initialSteps: initialStepState.steps,
    steps: initialStepState.steps,
    currentStep: initialStepState.currentStep,
    initialized: initialStepState.initialized,

    initializeSteps: (initialSteps) =>
      set(
        produce((state: StepState & StepActions) => {
          if (!state.initialized) {
            state.steps = initialSteps.map((step) => ({
              ...step,
              data: null,
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
            if (newData instanceof Object) {
              state.steps[stepIndex].data = {
                ...state.steps[stepIndex].data,
                ...newData,
              };
            } else {
              state.steps[stepIndex].data = newData;
            }
          }
        }),
      ),

    resetSteps: () =>
      set(
        produce((state: StepState) => {
          state.steps = state.initialSteps;
          state.currentStep = 0;
        }),
      ),
  }));
};
