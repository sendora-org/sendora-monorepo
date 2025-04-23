import { Input, Switch } from '@heroui/react';

export const BoolInput = ({
  error,
  inputType,
  inputName,
  value,
  onChange,
}: any) => {
  return (
    <>
      <Input
        isReadOnly={true}
        className="my-2"
        // placeholder={`${inputType}`}
        endContent={
          <Switch size="sm" isSelected={value} onValueChange={onChange} />
        }
        startContent={
          <div className="pointer-events-none flex items-center">
            <span className="text-default-400 text-small">{inputName}</span>
          </div>
        }
      />
    </>
  );
};
