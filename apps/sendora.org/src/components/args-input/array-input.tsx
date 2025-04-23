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
import { IntInput } from './int-input';

export const ArrayInput = ({
  error,
  arrayLength,
  arrayChildren,
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
          <div className="flex items-center gap-2">
            <Button size="sm" isIconOnly>
              <Icon icon="humbleicons:plus" width="16" height="16" />
            </Button>
            <Button size="sm" isIconOnly>
              <Icon icon="humbleicons:minus" width="16" height="16" />
            </Button>
          </div>
        </CardHeader>

        <CardBody>
          <div className="ml-4">
            {[1, 2].map((item) => {
              if (
                arrayChildren.baseType.startsWith('uint') ||
                arrayChildren.baseType.startsWith('int')
              ) {
                return (
                  <IntInput
                    error={error}
                    inputType={arrayChildren.type}
                    inputName={arrayChildren.name}
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
