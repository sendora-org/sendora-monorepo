import {
  Button,
  Modal,
  ModalBody,
  ModalContent,
  ModalHeader,
  useDisclosure,
} from '@heroui/react';
import CodeMirror from '@uiw/react-codemirror';

import { CopyText } from '@/components/copy-text';
import { EditorRefContext } from '@/constants/contexts';
import { vscodeDark } from '@/libs/vscodeDark';
import { Tab, Tabs } from '@heroui/react';
import { useTheme } from 'next-themes';
import { useContext, useEffect } from 'react';

import { vscodeLight } from '@/libs/vscodeLight';
export default function App({ example = '' }: { example: string }) {
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const { theme } = useTheme();

  const editorRef = useContext(EditorRefContext);

  useEffect(() => {
    if (isOpen) {
      // @ts-ignore
      window?.stonks?.event('show-sample');
    }
  }, [isOpen]);
  return (
    <>
      <Button size="sm" onPress={onOpen}>
        Show Sample
      </Button>
      <Modal
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        placement="center"
        size="2xl"
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">Example</ModalHeader>
              <ModalBody>
                <CodeMirror
                  // className="rounded-lg"
                  value={example}
                  height="200px"
                  //   extensions={[javascript({ jsx: true })]}
                  theme={theme === 'dark' ? vscodeDark : vscodeLight}
                  readOnly={true}
                />

                <div className="absolute bottom-0 right-0">
                  {' '}
                  <CopyText
                    aftefCopied={() => {
                      onClose();
                      editorRef?.current?.setValue(example);
                    }}
                  >
                    {example}
                  </CopyText>
                </div>
              </ModalBody>
              {/* <ModalFooter>
                  <Button color="danger" variant="light" onPress={onClose}>
                    Close
                  </Button>
                  <Button color="primary" onPress={onClose}>
                    Action
                  </Button>
                </ModalFooter> */}
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
}
