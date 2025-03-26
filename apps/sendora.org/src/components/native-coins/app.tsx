'use client';
import type { Chain } from 'viem';

import ConnectedAccount from '@/components/connected-account';
import StepProgress from '@/components/step-progress';
import { useStep } from '@/hooks/useStep';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useMemo } from 'react';
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

const stepsData = [
  { id: 1, name: '⏱️ Prepare', description: 'prepare', Component: Prepare },
  {
    id: 2,
    name: '🔄 Processing',
    description: 'Processing',
    Component: Processing,
  },
  { id: 3, name: '🎉 Report', description: 'Report', Component: Completed },
];

type Iprops = {
  network: Chain;
};
export const App = ({ network }: Iprops) => {
  console.log(`native-coins render ${new Date().toISOString()}`);
  const { currentStep, steps, nextStep, prevStep, setStepData, resetSteps } =
    useStep('native-coins', stepsData);

  const Comp = useMemo(() => {
    return stepsData[currentStep].Component;
  }, [currentStep]);

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
      <Comp />

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
