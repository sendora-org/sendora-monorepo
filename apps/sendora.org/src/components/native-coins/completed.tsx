type IProps<T> = {
  data: T;
  currentStep: number;
  totalSteps: number;
  nextStep: () => void;
  prevStep: () => void;
  resetSteps: () => void;
  setStepData: (stepIndex: number, newData: Record<string, T>) => void;
};

import { useEffect } from 'react';
export const Completed = ({
  data,
  currentStep,
  totalSteps,
  nextStep,
  prevStep,
  resetSteps,
  setStepData,
}: IProps<string>) => {
  useEffect(() => {
    // @ts-ignore
    window?.stonks.event('native-coins-completed-loaded');
  }, []);
  return (
    <>
      Completed
      <div className="mt-[500px]">------------</div>
      <button
        type="button"
        onClick={() => {
          prevStep();
        }}
        disabled={currentStep === 0}
      >
        ⬅ Prev
      </button>
      <button
        type="button"
        onClick={() => {
          nextStep();
        }}
        disabled={currentStep === totalSteps - 1}
      >
        ➡ Next
      </button>
      {/*  Store Current Step Data */}
      <button
        type="button"
        onClick={() => setStepData(currentStep, { input: 'Form A Data' })}
      >
        save form a data
      </button>
      <button type="button" onClick={() => resetSteps()}>
        resetSteps
      </button>
    </>
  );
};
