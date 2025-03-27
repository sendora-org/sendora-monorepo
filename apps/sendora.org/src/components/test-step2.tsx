'use client';

import { useStep } from '@/hooks/useStep';
import StepProgress from './step-progress';

export const TestStep2 = () => {
  const stepsData = [
    { id: 1, name: 'Prepare', description: 'prepare' },
    { id: 2, name: 'Processing', description: 'Processing' },
    { id: 3, name: 'Report', description: 'Report' },
    { id: 4, name: 'Final', description: 'Final' },
  ];
  const { currentStep, steps, nextStep, prevStep, setStepData, resetSteps } =
    useStep('native-coins-final', stepsData);
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

      <pre>{JSON.stringify(steps, null, 2)}</pre>
    </>
  );
};
