// import { runWorker } from '@/libs/common';
// import { runWorker2 } from '@/libs/common';
// import CheckTable from '@/components/check-table';
// import type { IReceipent } from '@/components/check-table';
// import CheckTable2 from '@/components/check-table2';
// import { local2NumberFormat } from '@/constants/common';
// import { useLocale } from '@/hooks/useLocale';
// import { useNativeCoinsValue } from '@/hooks/useNativeCoinsValue';
// import { getRandomNumber } from '@/libs/common';
import { splitText } from '@/libs/common';
import {
  formatLocalizedNumberWithSmallNumbers,
  getDecimalsScientific,
} from '@/libs/common';
import ConnectButton from './connect-button';
// import AddAmount from './add-amount';
// import { native_coin_input_example } from '@/constants/common';
// import { type NFType, numberFormats } from '@/constants/common';
// import ShowSample from '@/components/show-sample';

//   const taffydbRef = useRef<Worker | null>(null);
//   useEffect(() => {
//     taffydbRef.current = new Worker(
//       new URL('@/web-workers/demo4.ts', import.meta.url),
//       { type: 'module' },
//     );

//     return () => {
//       if (taffydbRef.current) {
//         taffydbRef.current.terminate();
//       }
//     };
//   }, []);

export const ConfirmInput = () => {
  //   const { locale } = useLocale();
  // const [selectedKeys, setSelectedKeys] = useState(new Set(['USA']));

  // const format = local2NumberFormat[locale];
  // const { decimalSeparator, thousandSeparator, code, useGrouping } =
  //   numberFormats[format as NFType];

  //   const deleteLine = (lineNumbers: number[]) => {
  //     const value = editorRef?.current?.getValue() ?? '';

  //     // setCheckValue((prevV: IReceipent[]) => {
  //     //   const tmp = prevV
  //     //     .filter((_, index) => {
  //     //       return !lineNumbers.includes(index + 1);
  //     //     })
  //     //     .map((item, index) => {
  //     //       return {
  //     //         ...item,
  //     //         id: index + 1,
  //     //       };
  //     //     });
  //     //   const keyCount = countBy(tmp, 'address');
  //     //   return tmp.map((item) => {
  //     //     return {
  //     //       ...item,
  //     //       status:
  //     //         item.status === 'valid' || item.status === 'duplicateAddress'
  //     //           ? keyCount[item.address] > 1
  //     //             ? 'duplicateAddress'
  //     //             : 'valid'
  //     //           : item.status,
  //     //     };
  //     //   });
  //     // });

  //     const val = value
  //       .split('\n')
  //       .filter((_: unknown, index: number) => {
  //         return !lineNumbers.includes(index + 1);
  //       })
  //       .join('\n');

  //     console.log('deleteline', { val, value });
  //     setValue(val);
  //   };
  return (
    <>
      Coinfirm input
      <ConnectButton />
    </>
  );

  //     <Button
  //     onPress={async () => {
  //       console.log('continue');
  //       const value1 = editorRef?.current?.getValue() ?? '';
  //       setValue(value1);
  //       console.log({ value1 });
  //       const input = {
  //         data: value1,
  //         decimalSeparator,
  //         thousandSeparator: thousandSeparator,
  //       };

  //       const worker = new Worker(
  //         new URL(
  //           '@/web-workers/input-nativecoins-validate.ts',
  //           import.meta.url,
  //         ),
  //         { type: 'module' },
  //       );

  //       const result = await runWorker<typeof input, IReceipent[]>(
  //         worker,
  //         input,
  //       );

  //       if (taffydbRef.current) {
  //         const initPayload = {
  //           type: 'initialize',
  //           payload: result,
  //         };

  //         console.log('initialize');
  //         const ff = await runWorker2(taffydbRef.current, initPayload);
  //         console.log(ff);
  //       }

  //       setCheckValue(true);
  //     }}
  //   >
  //     Continue
  //   </Button>
  //   {/* {checkValue.length > 0 && (
  //     <CheckTable data={checkValue} deleteLine={deleteLine} />
  //   )} */}
  //   {/* <CheckTable
  //     data={checkValue}
  //     deleteLine={deleteLine}
  //     // decimalSeparator={decimalSeparator}
  //     // thousandSeparator={thousandSeparator}
  //   /> */}
  //   {/* {checkValue.length > 0 && (
  //     <CheckTable2 data={checkValue} deleteLine={deleteLine} />
  //   )} */}
  //   {checkValue && (
  //     <CheckTable2 worker={taffydbRef.current} deleteLine={deleteLine} />
  //   )}
};
