import { getWorkbook } from '@/libs/common';
import {
  Button,
  Modal,
  ModalBody,
  ModalContent,
  ModalHeader,
  useDisclosure,
} from '@heroui/react';
import { useEffect, useRef, useState } from 'react';
import H3Title from './h3-title';
import H4Title from './h4-title';
import SheetTabs from './sheet-tabs';
import SpreadsheetDropzone from './spreadsheet-dropzone';
export default function UploadSpreadsheet() {
  const { isOpen, onOpen, onOpenChange, onClose } = useDisclosure();

  const spreadsheetBufferRef = useRef<ArrayBuffer | null>(null);
  const [, forceUpdate] = useState({});

  useEffect(() => {
    if (!isOpen) {
      console.log('clean isopen', isOpen);
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
            <H3Title>
              Supports CSV, TXT, ODS, XLS, XLSX, and NUMBERS formats.
            </H3Title>
            <H4Title>The table should not exceed 500,000 rows.</H4Title>
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
                  console.log('err=>', e);
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
