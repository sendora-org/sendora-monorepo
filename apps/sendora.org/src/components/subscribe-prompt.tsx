import { Button } from '@heroui/react';
import { useState } from 'react';
import { CustomAlert } from './custom-alert';
export const SubscribePrompt = () => {
  const [isVisible, setIsVisible] = useState(true);
  return (
    <CustomAlert
      isVisible={isVisible}
      onVisibleChange={setIsVisible}
      color={'success'}
      title="Subscribe to avoid the tool fee."
    >
      <div className="flex items-center gap-1 mt-3">
        <Button
          className="bg-background text-default-700 font-medium border-1 shadow-small"
          size="sm"
          variant="bordered"
        >
          View Pricing
        </Button>
        <Button
          onPress={() => {
            setIsVisible(false);
          }}
          className="text-default-500 font-medium underline underline-offset-4"
          size="sm"
          variant="light"
        >
          Maybe later
        </Button>
      </div>
    </CustomAlert>
  );
};
