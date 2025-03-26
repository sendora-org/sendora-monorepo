import H2Title from './h2-title';
const StepProgress = ({ currentStep = 1, totalSteps = 4, name = '' }) => {
  const steps = Array.from({ length: totalSteps }).map((_, index) => (
    <div
      // biome-ignore lint/suspicious/noArrayIndexKey: reason
      key={index}
      className={`h-2 flex-auto rounded-sm bg-purple-600 ${
        index < currentStep ? 'opacity-100' : 'opacity-30'
      }`}
    />
  ));

  return (
    <div className="w-64 mb-2">
      <div className="flex items-center justify-start my-1">
        <H2Title>{name}</H2Title>
        <h4 className="ml-2 text-left text-sm text-gray-800 dark:text-neutral-200">
          {`${currentStep} of ${totalSteps}`}
        </h4>
      </div>

      <div className="grid grid-cols-4 gap-x-1.5">{steps}</div>
    </div>
  );
};

export default StepProgress;
