import { Button } from '@heroui/react';
import { Icon } from '@iconify/react';
import prettyBytes from 'pretty-bytes';
import { useDropzone } from 'react-dropzone-esm';

export default function SpreadsheetDropzone({
  onDrop,
}: { onDrop: (acceptedFiles: File[]) => void }) {
  const { acceptedFiles, getRootProps, getInputProps, open } = useDropzone({
    multiple: false,
    onDrop,
    // https://github.com/react-dropzone/react-dropzone/issues/1220
    accept: {
      'text/csv': ['.csv'],
      'text/plain': ['.txt'],
      'application/vnd.oasis.opendocument.spreadsheet': ['.ods'], // LibreOffice / OpenOffice
      'application/vnd.ms-excel': ['.xls'], // MS Excel /WPS
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': [
        '.xlsx',
      ], // MS Excel /WPS
      'application/vnd.apple.numbers': ['.numbers'], // Apple numbers
    },
  });

  const displayFile =
    acceptedFiles?.length >= 1 ? (
      <div>
        {acceptedFiles[0]?.name} - {prettyBytes(acceptedFiles[0].size)}
      </div>
    ) : null;

  return (
    <section className="container">
      <div {...getRootProps({ className: 'dropzone' })}>
        <input {...getInputProps()} />
        <Button
          className="flex justify-between !rounded-full"
          variant="bordered"
          fullWidth
          onPress={open}
          endContent={<Icon icon="lucide:upload" width={16} />}
        >
          {displayFile}
          {(!acceptedFiles || acceptedFiles.length === 0) &&
            'Please add a file'}
        </Button>
      </div>
    </section>
  );
}
