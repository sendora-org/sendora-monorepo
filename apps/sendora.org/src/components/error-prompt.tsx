import { Button } from '@heroui/react';
import { Icon } from '@iconify/react';
import { useState } from 'react';
import { CustomAlert } from './custom-alert';
import JsonViewer from './json-viewer';

export const ErrorPrompt = ({ error, setError }) => {
  const [isVisible, setIsVisible] = useState(true);
  return (
    <CustomAlert
      hideIcon
      isVisible={isVisible}
      onVisibleChange={setIsVisible}
      color={'danger'}
      title="Something went wrong"
    >
      <div className="flex items-center gap-1 mt-3">
        {/* <JsonViewer data={error}  /> */}

        {error}
        <Button
          isIconOnly
          onPress={() => {
            setError && setError('');
            setIsVisible(false);
          }}
          className="text-default-500 font-medium   absolute top-2 right-2"
          size="sm"
          variant="light"
        >
          <Icon icon="simple-line-icons:close" width="18" height="18" />
        </Button>
      </div>
    </CustomAlert>
  );
};
