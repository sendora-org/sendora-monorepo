import { Disclosure } from '@headlessui/react';
import { Button, Input, Switch } from '@heroui/react';
import { Icon } from '@iconify/react';
import type { ethers } from 'ethers';
import type React from 'react';
import { useEffect } from 'react';

import { Controller, useFieldArray, useFormContext } from 'react-hook-form';

type FormRendererProps = {
  param: ethers.ParamType;
  name: string;
  defaultValue?: any;
};

export const FormField: React.FC<FormRendererProps> = ({
  param,
  name,
  defaultValue,
}) => {
  const { control, register, setValue, getValues } = useFormContext();

  useEffect(() => {
    const currentValue = getValues(name);
    if (defaultValue !== undefined && currentValue === undefined) {
      setValue(name, defaultValue);
    }
  }, [defaultValue, name, getValues, setValue]);

  // biome-ignore  lint/suspicious/noExplicitAny: reason
  const paste = async (param: any, name: string, arrayLength: number) => {
    console.log({ param, name, arrayLength });

    const array = [];

    param.replace([]);

    try {
      const text = await navigator.clipboard.readText();
      const json = JSON.parse(text);
      if (Array.isArray(json)) {
        for (let i = 0; i < json.length; i++) {
          if (i < arrayLength && arrayLength !== -1) {
            array.push(json[i]);
          }

          if (arrayLength === -1) {
            array.push(json[i]);
          }
        }
      }

      for (let i = 0; i < array.length; i++) {
        param.remove(i);
        param.insert(i, array[i]);
      }
    } catch (e) {
      console.log('paste error', e);
    }
  };

  const renderPrimitive = () => {
    switch (param.type) {
      case 'bool':
        return (
          <div className="py-2">
            <Controller
              name={name}
              control={control}
              render={({
                field: { onChange, value },
                fieldState: { error },
              }) => {
                return (
                  <Input
                    isReadOnly={true}
                    className="my-2"
                    endContent={
                      <Switch
                        size="sm"
                        isSelected={value}
                        onValueChange={onChange}
                      />
                    }
                    startContent={
                      <div className="pointer-events-none flex items-center">
                        <span className="text-default-400 text-small">{`${param.name || name}`}</span>
                      </div>
                    }
                  />
                );
              }}
            />
          </div>
        );

      default:
        return (
          <div className="py-2">
            <Controller
              name={name}
              control={control}
              render={({
                field: { onChange, value },
                fieldState: { error },
              }) => {
                return (
                  <Input
                    value={value}
                    onChange={onChange}
                    className="py-1 rounded w-full"
                    endContent={
                      <div className="pointer-events-none flex items-center">
                        <span className="text-default-400 text-small">{`${param.type}`}</span>
                      </div>
                    }
                    startContent={
                      <div className="pointer-events-none flex items-center">
                        <span className="text-default-400 text-small">{`${param.name || name}`}</span>
                      </div>
                    }
                  />
                );
              }}
            />
          </div>
        );
    }
  };

  if (param.baseType === 'array') {
    const arrayLength = param.arrayLength;

    const fieldArray = useFieldArray({
      control,
      name,
    });

    console.log({ param }, 888);
    if (typeof arrayLength === 'number' && arrayLength >= 0) {
      return (
        <div className="p-2  border border-default-300 rounded">
          <div className="font-semibold block mb-2">
            {param.name || name} (fixed array[{arrayLength}]){' '}
            {param.type !== 'array' && param.type !== 'tuple' && (
              <Button
                size="sm"
                onPress={() => paste(fieldArray, name, arrayLength)}
              >
                paste
              </Button>
            )}
          </div>
          {fieldArray.fields.map((field, index) => (
            <div key={field.id} className="flex gap-2 items-center mb-2">
              <div className="flex-1">
                <FormField
                  // biome-ignore lint/style/noNonNullAssertion: reason
                  param={param.arrayChildren!}
                  name={`${name}.${index}`}
                  defaultValue={[]}
                />
              </div>
              <button
                type="button"
                onClick={() => fieldArray.remove(index)}
                className="text-red-500 font-bold px-2 py-1 rounded border border-red-500 mt-0"
              >
                <Icon icon="mynaui:trash-solid" width="24" height="24" />
              </button>
            </div>
          ))}

          {fieldArray.fields.length < arrayLength && (
            <button
              type="button"
              onClick={() => {
                if (fieldArray.fields.length < arrayLength) {
                  fieldArray.append('');
                }
              }}
              className="bg-blue-500 text-white px-2 py-1 rounded mt-2"
            >
              Add
            </button>
          )}

          {/* {Array.from({ length: arrayLength }).map((_, index) => (
            <FormField
              // biome-ignore lint/suspicious/noArrayIndexKey: reason
              key={index}
              // biome-ignore lint/style/noNonNullAssertion: reason
              param={param.arrayChildren!}
              name={`${name}.${index}`}
            />
          ))} */}

          {/* {fieldArray.fields.map((field, index) => (
          <div key={field.id} className="flex gap-2 items-center mb-2">
            <div className="flex-1">
              <FormField
                // biome-ignore lint/style/noNonNullAssertion: reason
                param={param.arrayChildren!}
                name={`${name}.${index}`}
              />
            </div>
    
          </div>
        ))} */}
        </div>
      );
    }

    return (
      <div className="p-2  border border-default-300 rounded my-2">
        <div className="font-semibold block mb-2">
          {param.name || name} (array){' '}
          {param.type !== 'array' && param.type !== 'tuple' && (
            <Button size="sm" onPress={() => paste(fieldArray, name, -1)}>
              paste
            </Button>
          )}
        </div>
        {fieldArray.fields.map((field, index) => (
          <div key={field.id} className="flex gap-2 items-center mb-2">
            <div className="flex-1">
              <FormField
                // biome-ignore lint/style/noNonNullAssertion: reason
                param={param.arrayChildren!}
                name={`${name}.${index}`}
                defaultValue={[]}
              />
            </div>
            <button
              type="button"
              onClick={() => fieldArray.remove(index)}
              className="text-red-500 font-bold px-2 py-1 rounded border border-red-500 mt-0"
            >
              <Icon icon="mynaui:trash-solid" width="24" height="24" />
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={() => fieldArray.append('')}
          className="bg-blue-500 text-white px-2 py-1 rounded mt-2"
        >
          Add
        </button>
      </div>
    );
  }

  if (param.baseType === 'tuple') {
    return (
      <Disclosure defaultOpen>
        {({ open }) => (
          <>
            <Disclosure.Button className="bg-default-100 px-3 py-2 w-full text-left font-bold rounded my-2">
              {param.name || name} (Tuple)
            </Disclosure.Button>
            <Disclosure.Panel className="pl-4 border-l border-default-300">
              {param.components?.map((childParam, index) => (
                <FormField
                  // biome-ignore lint/suspicious/noArrayIndexKey: reason
                  key={`${name}.${index}`}
                  param={childParam}
                  name={`${name}.${index}`}
                />
              ))}
            </Disclosure.Panel>
          </>
        )}
      </Disclosure>
    );
  }

  return renderPrimitive();
};
