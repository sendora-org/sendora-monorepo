'use client';
import ConnectedAccount from '@/components/connected-account';
import StepProgress from '@/components/step-progress';
import { useStep } from '@/hooks/useStep';
import type { Step } from '@/hooks/useStep';
import React, { useRef } from 'react';
import type { Chain } from 'viem';
import { Completed } from './completed';
import { Prepare } from './prepare';
import { Processing } from './processing';

// biome-ignore  lint/suspicious/noExplicitAny: reason
type IStep = Step & { Component: React.ComponentType<any> };

const stepsData: IStep[] = [
  { id: 0, name: '⏱️ Prepare', description: 'prepare', Component: Prepare },
  {
    id: 1,
    name: '🔄 Processing',
    description: 'Processing',
    Component: Processing,
  },
  { id: 2, name: '🎉 Report', description: 'Report', Component: Completed },
];

type Iprops = {
  network: Chain;
};

const MemoizedComponents = stepsData.map((step) => React.memo(step.Component));

export const App = ({ network }: Iprops) => {
  console.log(`native-coins render ${new Date().toISOString()}`);
  const { currentStep, steps, nextStep, prevStep, setStepData, resetSteps } =
    useStep('native-coins', stepsData);

  const Comp = MemoizedComponents[currentStep];

  console.log({
    currentStep,
    steps,
    nextStep,
    prevStep,
    setStepData,
    resetSteps,
  });
  return (
    <>
      <div className="mb-2 flex items-center justify-between w-full">
        <StepProgress
          currentStep={currentStep + 1}
          totalSteps={steps.length}
          name={steps[currentStep]?.name}
        />
        <ConnectedAccount />
      </div>
      <Comp
        data={steps[currentStep]?.data}
        totalSteps={steps.length}
        currentStep={currentStep}
        nextStep={nextStep}
        prevStep={prevStep}
        setStepData={setStepData}
        resetSteps={resetSteps}
      />
    </>
  );
};
