import { TableVirtuoso } from 'react-virtuoso';

type Column = { label: string; key: string };
type Row = Record<string, unknown> & {
  key: string;
};

export default function AnyTable({
  tableData,
}: {
  tableData: {
    columns: Column[];
    rows: Row[];
  };
}) {
  return (
    <TableVirtuoso
      data={tableData.rows}
      style={{ height: 350, width: '100%' }}
      fixedHeaderContent={() => (
        <>
          <th
            key={'key'}
            className="  1group/th px-4 h-10 align-middle bg-default-100 whitespace-nowrap text-foreground-500 text-tiny font-semibold first:rounded-s-lg last:rounded-e-lg data-[sortable=true]:cursor-pointer data-[hover=true]:text-foreground-400 outline-none data-[focus-visible=true]:z-10 data-[focus-visible=true]:outline-2 data-[focus-visible=true]:outline-focus data-[focus-visible=true]:outline-offset-2 text-start min-w-[200px] w-max "
          >
            No.
          </th>
          {tableData?.columns.map(({ key, label }) => (
            <th
              key={key}
              className="  1group/th px-4 h-10 align-middle bg-default-100 whitespace-nowrap text-foreground-500 text-tiny font-semibold first:rounded-s-lg last:rounded-e-lg data-[sortable=true]:cursor-pointer data-[hover=true]:text-foreground-400 outline-none data-[focus-visible=true]:z-10 data-[focus-visible=true]:outline-2 data-[focus-visible=true]:outline-focus data-[focus-visible=true]:outline-offset-2 text-start min-w-[200px] w-max "
            >
              {label}
            </th>
          ))}
        </>
      )}
      itemContent={(index, row) => (
        <>
          {Object.keys(row).map((k) => {
            if (k !== 'key') {
              return (
                <td
                  className="px-4  py-1  min-w-[100px] text-pretty   text-default-400"
                  key={k}
                >
                  {row[k] as React.ReactNode}
                </td>
              );
            }
            return (
              <td
                className="px-4  py-1  min-w-[100px] text-pretty   text-default-400"
                key={k}
              >
                {(Number(row[k]) - 1) as React.ReactNode}
              </td>
            );
          })}
        </>
      )}
    />
  );
}
