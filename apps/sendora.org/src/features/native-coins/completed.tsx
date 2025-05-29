type IProps<T> = {
  data: T;
  currentStep: number;
  totalSteps: number;
  nextStep: () => void;
  prevStep: () => void;
  resetSteps: () => void;
  setStepData: (stepIndex: number, newData: Record<string, T>) => void;
};
import { useScopedStep } from '@/providers/step-provider';
import { useEffect } from 'react';
export const Completed = ({
  data,
  // currentStep,
  totalSteps,
  // nextStep,
  // prevStep,
  // resetSteps,
  // setStepData,
}: IProps<string>) => {
  useEffect(() => {
    // @ts-ignore
    window?.stonks?.event('native-coins-completed-loaded');
  }, []);

  const currentStep = useScopedStep((s) => s.currentStep);
  const steps = useScopedStep((s) => s.steps);
  const nextStep = useScopedStep((s) => s.nextStep);
  const prevStep = useScopedStep((s) => s.prevStep);
  const setStepData = useScopedStep((s) => s.setStepData);
  const resetSteps = useScopedStep((s) => s.resetSteps);

  return <>Completed</>;
};
