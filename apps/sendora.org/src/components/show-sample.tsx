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
import { vscodeDark } from '@/libs/vscodeDark';
import { Tab, Tabs } from '@heroui/react';

export default function App({
  tabs = [],
}: { tabs: { id: string; label: string; content: string }[] }) {
  const { isOpen, onOpen, onOpenChange } = useDisclosure();

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
          {() => (
            <>
              <ModalHeader className="flex flex-col gap-1">Example</ModalHeader>
              <ModalBody>
                <Tabs className="px-4" aria-label="Dynamic tabs" items={tabs}>
                  {(item) => (
                    <Tab className='py-1' key={item.id} title={item.label}>
                      <CodeMirror
                        // className="rounded-lg"
                        value={item.content}
                        height="200px"
                        //   extensions={[javascript({ jsx: true })]}
                        theme={vscodeDark}
                        readOnly={true}
                      />

                      <div className="absolute bottom-0 right-0">
                        {' '}
                        <CopyText>{item.content}</CopyText>
                      </div>
                      {/* <Card>
                        <CardBody>{item.content}</CardBody>
                      </Card> */}
                    </Tab>
                  )}
                </Tabs>
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
