import { Button } from '@heroui/react';
import { useState } from 'react';
import { CustomAlert } from './custom-alert';
export const DeterministicDeployerPrompt = () => {
  const [isVisible, setIsVisible] = useState(true);
  return (
    <CustomAlert
      isVisible={isVisible}
      onVisibleChange={setIsVisible}
      color={'success'}
      title="Make sure the Deterministic Deployer is deployed on the network."
    >
      <div className="flex items-center gap-1 mt-3">
        <Button
          onPress={() =>
            window.open(
              'https://github.com/Arachnid/deterministic-deployment-proxy',
              '_blank',
            )
          }
          className="bg-background text-default-700 font-medium border-1 shadow-small"
          size="sm"
          variant="bordered"
        >
          View Deterministic Deployer
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
