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

                {/* {tableData.columns?.length >= 1 && (
                  <>
                    {value.size > 0 && (
                      <div className="flex flex-wrap gap-4 items-center">
                        <Button
                          onPress={() => {
                            if (value2.size > 0) {
                              const to = value.values().next().value!;
                              const amount = value2.values().next().value!;
                              console.log({ to, amount });
                              const data = tableData.rows
                                .map((row) => {
                                  return `${row[to] ?? ''},${
                                    row[amount] ?? ''
                                  }`;
                                })
                                .join('\n');
                              console.log(data);
                              updateCM(data);
                              onClose();
                            } else {
                              const to = value.values().next().value!;
                              const data = tableData.rows
                                .map((row) => {
                                  return `${row[to] ?? ''}`;
                                })
                                .join('\n');
                              console.log(data);
                              updateCM(data);
                              onClose();
                            }
                          }}
                          className="bg-gradient-to-tr from-purple-600 to-fuchica-600 text-[#f7cf5294] shadow-lg"
                          fullWidth
                        >
                          Continue
                        </Button>
                      </div>
                    )}
                  </>
                )} */}
              </ModalBody>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
}
