import InputNativeCoin from '@/components/input-native-coin';
import { EditorRefContext } from '@/constants/contexts';
import { useRef } from 'react';
import type { SNDRACodemirrorRef } from '../codemirror-sndra';
type IProps<T> = {
  data: T;
  currentStep: number;
  totalSteps: number;
  nextStep: () => void;
  prevStep: () => void;
  resetSteps: () => void;
  setStepData: (stepIndex: number, newData: Record<string, T> | string) => void;
};

export const Prepare = ({
  data,
  currentStep,
  totalSteps,
  nextStep,
  prevStep,
  resetSteps,
  setStepData,
}: IProps<string>) => {
  const editorRef = useRef<SNDRACodemirrorRef | null>(null);
  return (
    <>
      <EditorRefContext.Provider value={editorRef}>
        <InputNativeCoin defaultValue={data ?? ''} ref={editorRef} />

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

        {/*  Store Current Step Data */}
        <button type="button" onClick={() => {}}>
          save form a data
        </button>
        <button type="button" onClick={() => resetSteps()}>
          resetSteps
        </button>
      </EditorRefContext.Provider>
    </>
  );
};
