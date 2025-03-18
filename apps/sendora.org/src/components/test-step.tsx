'use client';

import { useStep } from '@/hooks/useStep';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import ConnectedAccount from './connected-account';
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
    <div className="mb-2 flex items-center justify-between w-full">
      <StepProgress
        currentStep={currentStep + 1}
        totalSteps={steps.length}
        name={steps[currentStep]?.name}
      />
      <ConnectedAccount />
    </div>
  );
};
