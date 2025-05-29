'use client';

import { DemoOps } from '@/components/demo-ops';
import StepProgress from '@/components/step-progress';
import { StepProvider } from '@/providers/step-provider';
import { useScopedStep } from '@/providers/step-provider';
import type { Step } from '@/stores/stepStore';
import React from 'react';
import type { Chain } from 'viem';

import { Completed } from './completed';
import { Prepare } from './prepare';
import { Processing } from './processing';

// biome-ignore  lint/suspicious/noExplicitAny: reason
type IStep = Step & { Component: React.ComponentType<any> };

const stepsData: IStep[] = [
  {
    id: 0,
    name: '⏱️ Prepare',
    description: 'prepare',
    Component: Prepare,
    data: {
      isToggle: false,
      rate: BigInt(10 ** 18),
      editorData: '',
    },
  },
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
  console.log('aaaaaa app');
  return (
    <StepProvider
      initialStepState={{
        initialSteps: stepsData,
        steps: stepsData,
        currentStep: 0,
        initialized: true,
      }}
    >
      <Logic network={network} />
    </StepProvider>
  );
};

const Logic = ({ network }: Iprops) => {
  const currentStep = useScopedStep((s) => s.currentStep);
  const steps = useScopedStep((s) => s.steps);
  // const nextStep = useScopedStep((s) => s.nextStep);
  // const prevStep = useScopedStep((s) => s.prevStep);
  // const setStepData = useScopedStep((s) => s.setStepData);
  // const resetSteps = useScopedStep((s) => s.resetSteps);

  const Comp = MemoizedComponents[currentStep];

  const nextStep = useScopedStep((s) => s.nextStep);
  const prevStep = useScopedStep((s) => s.prevStep);
  const setStepData = useScopedStep((s) => s.setStepData);
  const resetSteps = useScopedStep((s) => s.resetSteps);

  return (
    <>
      <div className="mb-2 flex items-center justify-between w-full">
        <StepProgress
          currentStep={currentStep + 1}
          totalSteps={steps.length}
          name={steps[currentStep]?.name}
        />
      </div>
      <Comp network={network} />

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
          // setStepData(currentStep, editorRef?.current?.getValue() ?? '');
        }}
        disabled={currentStep === steps.length - 1}
      >
        ➡ Next
      </button>
      <DemoOps />
    </>
  );
};
