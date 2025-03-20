import {
  Button,
  Modal,
  ModalBody,
  ModalContent,
  ModalHeader,
  useDisclosure,
} from '@heroui/react';
import { useState } from 'react';
import H3Title from './h3-title';
import H4Title from './h4-title';
import SheetTabs from './sheet-tabs';
import SpreadsheetDropzone from './spreadsheet-dropzone';

export default function UploadSpreadsheet() {
  const { isOpen, onOpen, onOpenChange } = useDisclosure();

  const [spreadsheetBuffer, setSpreadsheetBuffer] = useState<ArrayBuffer>(
    new ArrayBuffer(0),
  );
  //   const [tableData, setTableData] = useState({ rows: [], columns: [] });
  //   //   const onDataParsed = (data) => {
  //   //     setTableData(data);
  //   //   };
  //   const [value, setValue] = useState(new Set([]));
  //   const [value2, setValue2] = useState(new Set([]));
  //   //   console.log(444, value, value.size);
  //   //   console.log(555, value2, value2.size);

  return (
    <>
      <Button size="sm" onPress={onOpen}>
        Upload
      </Button>
      <Modal
        backdrop="blur"
        scrollBehavior="inside"
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        placement="auto"
        size="5xl"
        onClose={() => {
          setSpreadsheetBuffer(new ArrayBuffer(0));
          //   setValue(new Set([]));
          //   setValue2(new Set([]));
          //   setTableData({ rows: [], columns: [] });
        }}
      >
        <ModalContent>
          {(onClose: () => void) => (
            <>
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

                {spreadsheetBuffer.byteLength > 0 && (
                  <SheetTabs
                    onClose={onClose}
                    spreadsheetBuffer={spreadsheetBuffer}
                  />
                )}
              </ModalBody>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
}
