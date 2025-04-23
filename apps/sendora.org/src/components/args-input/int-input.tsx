import { Input } from '@heroui/react';

export const IntInput = ({
  error,
  inputType,
  inputName,
  value,
  onChange,
}: any) => {
  return (
    <>
      <Input
        className="my-2"
        isInvalid={!!error}
        errorMessage={error?.message}
        value={value}
        onValueChange={(value) => {
          onChange(value);
        }}
        startContent={
          <div className="pointer-events-none flex items-center">
            <span className="text-default-400 text-small">{inputName}</span>
          </div>
        }
        endContent={
          <div className="pointer-events-none flex items-center">
            <span className="text-default-400 text-small">{inputType}</span>
          </div>
        }
      />
    </>
  );
};
