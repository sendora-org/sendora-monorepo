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

// console.log('continue');
// const value1 = editorRef?.current?.getValue() ?? '';
// setValue(value1);
// console.log({ value1 });
// const input = {
//   data: value1,
//   decimalSeparator,
//   thousandSeparator: thousandSeparator,
// };
// const worker = new Worker(
//   new URL(
//     '@/web-workers/input-nativecoins-validate.ts',
//     import.meta.url,
//   ),
//   { type: 'module' },
// );
// const result = await runWorker<typeof input, IReceipent[]>(
//   worker,
//   input,
// );
// if (taffydbRef.current) {
//   const initPayload = {
//     type: 'initialize',
//     payload: result,
//   };
//   console.log('initialize');
//   const ff = await runWorker2(taffydbRef.current, initPayload);
//   console.log(ff);
// }
// setCheckValue(true);
