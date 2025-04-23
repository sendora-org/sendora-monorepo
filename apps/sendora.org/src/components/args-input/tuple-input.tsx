import { Input, Switch } from '@heroui/react';
import {
  Button,
  ButtonGroup,
  Card,
  CardBody,
  CardHeader,
  Chip,
  Image,
} from '@heroui/react';
import { Icon } from '@iconify/react';
import { AddressInput } from './address-input';
import { IntInput } from './int-input';
import { StringInput } from './string-input';

export const TupleInput = ({
  error,
  components,
  inputType,
  inputName,
  value,
  onChange,
}: any) => {
  return (
    <>
      <Card className=" border border-transparent dark:border-default-100 my-2">
        <CardHeader className="flex gap-3 justify-between items-center">
          <div className="text-small  text-default-400">{inputName}</div>

          <div className="text-small  text-default-400">{inputType}</div>
        </CardHeader>

        <CardBody>
          <div className="ml-4">
            {components.map((item: any) => {
              if (
                item.baseType.startsWith('uint') ||
                item.baseType.startsWith('int')
              ) {
                return (
                  <IntInput
                    error={error}
                    inputType={item.type}
                    inputName={item.name}
                    // value={value}
                    // onChange={(value) => {
                    //   updateArgAtIndex(index, value, specificArgs);
                    // }}
                  />
                );
              }
              if (item.baseType === 'string') {
                return (
                  <StringInput
                    error={error}
                    inputType={item.type}
                    inputName={item.name}
                    // value={value}
                    // onChange={(value) => {
                    //   updateArgAtIndex(index, value, specificArgs);
                    // }}
                  />
                );
              }
              if (item.baseType === 'address') {
                return (
                  <AddressInput
                    error={error}
                    inputType={item.type}
                    inputName={item.name}
                    // value={value}
                    // onChange={(value) => {
                    //   updateArgAtIndex(index, value, specificArgs);
                    // }}
                  />
                );
              }
            })}
          </div>
        </CardBody>
      </Card>
    </>
  );
};
