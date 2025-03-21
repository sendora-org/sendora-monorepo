import { getWorkbook } from '@/libs/common';
import {
  Button,
  Modal,
  ModalBody,
  ModalContent,
  ModalHeader,
  useDisclosure,
} from '@heroui/react';
import { useEffect, useState } from 'react';
import H3Title from './h3-title';
import H4Title from './h4-title';
import SheetTabs from './sheet-tabs';
import SpreadsheetDropzone from './spreadsheet-dropzone';
export default function UploadSpreadsheet() {
  const { isOpen, onOpen, onOpenChange, onClose } = useDisclosure();

  const [spreadsheetBuffer, setSpreadsheetBuffer] =
    useState<ArrayBuffer | null>(null);

  useEffect(() => {
    if (!isOpen) {
      console.log('cleanr isopen');
      setSpreadsheetBuffer(null);
    }
  }, [isOpen]);
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
                  setSpreadsheetBuffer(data);
                } catch (e) {
                  console.log('err=>', e);
                }
              }}
            />
            {spreadsheetBuffer != null && (
              <SheetTabs
                onClose={() => {
                  onOpenChange();
                }}
                spreadsheetBuffer={spreadsheetBuffer}
              />
            )}
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
}
