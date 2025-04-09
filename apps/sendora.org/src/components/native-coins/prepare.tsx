import UserInput from '@/components/user-input';
import { native_coin_input_example } from '@/constants/common';
import { EditorRefContext } from '@/constants/contexts';
import { useEffect, useRef } from 'react';
import type { Chain } from 'viem';
import type { SNDRACodemirrorRef } from '../codemirror-sndra';
type IProps<T> = {
  data: T;
  currentStep: number;
  totalSteps: number;
  network: Chain;
  nextStep: () => void;
  prevStep: () => void;
  resetSteps: () => void;
  setStepData: (stepIndex: number, newData: Record<string, T> | string) => void;
};

export const Prepare = ({
  data,
  currentStep,
  totalSteps,
  network,
  nextStep,
  prevStep,
  resetSteps,
  setStepData,
}: IProps<string>) => {
  const editorRef = useRef<SNDRACodemirrorRef | null>(null);

  useEffect(() => {
    // @ts-ignore
    window?.stonks.event('native-coins-prepare-loaded');
  }, []);
  return (
    <>
      <EditorRefContext.Provider value={editorRef}>
        <UserInput
          tokenType="native"
          tokenSymbol={network?.nativeCurrency?.symbol}
          example={native_coin_input_example}
          defaultValue={data ?? ''}
          ref={editorRef}
        />

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
            setStepData(currentStep, editorRef?.current?.getValue() ?? '');
          }}
          disabled={currentStep === totalSteps - 1}
        >
          ➡ Next
        </button>
      </EditorRefContext.Provider>
    </>
  );
};
