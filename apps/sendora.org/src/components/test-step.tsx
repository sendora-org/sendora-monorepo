'use client';

import { useStep } from '@/hooks/useStep';
import StepProgress from './step-progress';

export const TestStep = () => {
  const stepsData = [
    { id: 1, name: 'Prepare', description: 'prepare' },
    { id: 2, name: 'Processing', description: 'Processing' },
    { id: 3, name: 'Report', description: 'Report' },
  ];
  const { currentStep, steps, nextStep, prevStep, setStepData, resetSteps } =
    useStep('native-coins', stepsData);
  return (
    <>
      <StepProgress
        currentStep={currentStep + 1}
        totalSteps={steps.length}
        name={steps[currentStep]?.name}
      />

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
        disabled={currentStep === steps.length - 1}
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

      <pre>{JSON.stringify(steps, null, 2)}</pre>
    </>
  );
};
