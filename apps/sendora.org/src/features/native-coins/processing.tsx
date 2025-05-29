import { useEffect } from 'react';
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
export const Processing = ({
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
    window?.stonks?.event('native-coins-processing-loaded');
  }, []);

  const currentStep = useScopedStep((s) => s.currentStep);
  const steps = useScopedStep((s) => s.steps);
  const nextStep = useScopedStep((s) => s.nextStep);
  const prevStep = useScopedStep((s) => s.prevStep);
  const setStepData = useScopedStep((s) => s.setStepData);
  const resetSteps = useScopedStep((s) => s.resetSteps);

  return <>Processing</>;
};
