'use client';
import type { Chain } from 'viem';

import ConnectedAccount from '@/components/connected-account';
import StepProgress from '@/components/step-progress';
import { useStep } from '@/hooks/useStep';
import type { Step } from '@/hooks/useStep';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { memo, useMemo } from 'react';
import { Completed } from './completed';
import { Prepare } from './prepare';
import { Processing } from './processing';

// import { SIWEProvider } from '@/components/siwe-provider';
// import { getVisitorId } from '@/libs/common';
// import InputExchangeRate from '@/components/input-exchange-rate';
import { TestStep } from '@/components/test-step';
import { TestStep2 } from '@/components/test-step2';

// import ConnectButton from '@/components/connect-button';
// import H1Title from '@/components/h1-title';
// import H2Title from '@/components/h2-title';
// import H3Title from '@/components/h3-title';

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
export const App = ({ network }: Iprops) => {
  console.log(`native-coins render ${new Date().toISOString()}`);
  const { currentStep, steps, nextStep, prevStep, setStepData, resetSteps } =
    useStep('native-coins', stepsData);

  const Comp = stepsData[currentStep].Component;

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

      <pre>{JSON.stringify(steps, null, 2)}</pre>
    </>
  );
};
