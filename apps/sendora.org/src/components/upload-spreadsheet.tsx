import {
  Button,
  Modal,
  ModalBody,
  ModalContent,
  ModalHeader,
  useDisclosure,
} from '@heroui/react';
import { useEffect, useRef, useState } from 'react';
import H4Title from './h4-title';
import SheetTabs from './sheet-tabs';
import SpreadsheetDropzone from './spreadsheet-dropzone';
export default function UploadSpreadsheet() {
  const { isOpen, onOpen, onOpenChange, onClose } = useDisclosure();

  const spreadsheetBufferRef = useRef<ArrayBuffer | null>(null);
  const [, forceUpdate] = useState({});

  useEffect(() => {
    if (!isOpen) {
      spreadsheetBufferRef.current = null;
      forceUpdate({});
    }
  }, [isOpen]);

  useEffect(() => {
    return () => {
      spreadsheetBufferRef.current = null;
    };
  }, []);
  return (
    <>
      <Button size="sm" onPress={onOpen}>
        Upload
      </Button>

      <Modal
        disableAnimation={true}
        backdrop="blur"
        scrollBehavior="inside"
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        placement="auto"
        size="5xl"
        onClose={() => {
          console.log('onClose');
        }}
      >
        <ModalContent>
          <ModalHeader className="flex flex-col gap-1">
            Upload a spreadsheet
            <H4Title>
              Supports CSV, TXT, ODS, XLS, XLSX, and NUMBERS formats.
            </H4Title>
            <H4Title>On mobile , limit to 10,000 rows.</H4Title>
            <H4Title>On PC , limit to 1,000,000 rows.</H4Title>
          </ModalHeader>
          <ModalBody>
            <SpreadsheetDropzone
              onDrop={async (acceptedFiles: File[]) => {
                try {
                  const file = acceptedFiles[0];
                  const data = await file.arrayBuffer();
                  spreadsheetBufferRef.current = data;
                  forceUpdate({});
                } catch (e) {
                  console.log('SpreadsheetDropzone onDrop error =>', e);
                }
              }}
            />
            {spreadsheetBufferRef.current != null && (
              <SheetTabs
                onClose={() => {
                  onOpenChange();
                }}
                spreadsheetBuffer={spreadsheetBufferRef.current}
              />
            )}
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
}
