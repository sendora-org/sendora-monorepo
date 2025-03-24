export type NFType = 'USA' | 'DE' | 'FR' | 'CH'; //| 'DOT' | 'COMMA';
export type NFValue = {
  decimalSeparator: '.' | ',';
  thousandSeparator: '' | '.' | ',' | `'` | ' ';
  code: 'en-US' | 'de-DE' | 'fr-FR' | 'de-CH';
  useGrouping: boolean;
};

export const local2NumberFormat: Record<NFValue['code'], NFType> = {
  'en-US': 'USA',
  'de-DE': 'DE',
  'fr-FR': 'FR',
  'de-CH': 'CH',
};

export const numberFormats: Record<NFType, NFValue> = {
  USA: {
    decimalSeparator: '.',
    thousandSeparator: ',',
    code: 'en-US',
    useGrouping: true,
  },

  DE: {
    decimalSeparator: ',',
    thousandSeparator: '.',
    code: 'de-DE',
    useGrouping: true,
  },

  FR: {
    decimalSeparator: ',',
    thousandSeparator: ' ',
    code: 'fr-FR',
    useGrouping: true,
  },

  CH: {
    decimalSeparator: '.',
    thousandSeparator: `'`,
    code: 'de-CH',
    useGrouping: true,
  },

  // DOT: {
  //   decimalSeparator: '.',
  //   thousandSeparator: '',
  //   code: 'en-US',
  //   useGrouping: false,
  // },

  // COMMA: {
  //   decimalSeparator: ',',
  //   thousandSeparator: '',
  //   code: 'de-DE',
  //   useGrouping: false,
  // },
};

export const native_coin_input_example = {
  USA: {
    id: 'USA',
    label: 'USA',
    content: `0x1345fc0db80b4e3d872a3770ddab52ef16f2bf17,10,000.001
0x4395780d9062D76c618c7C62659Cc31F0d20214e,1,000,000.002
999.arb,0.003
123456.bnb,0.004
vitalik.eth,0.005
0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045,66
sendora.eth,0.1
sendora.base.eth,0.006`,
  },
  DE: {
    id: 'DE',
    label: 'Germany',
    content: `0x1345fc0db80b4e3d872a3770ddab52ef16f2bf17,10.000,001
0x4395780d9062D76c618c7C62659Cc31F0d20214e,1.000.000,002
999.arb,0,003
123456.bnb,0,004
vitalik.eth,0,005
0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045,66
sendora.eth,0,1
sendora.base.eth,0,006`,
  },
  FR: {
    id: 'FR',
    label: 'France',
    content: `0x1345fc0db80b4e3d872a3770ddab52ef16f2bf17,10 000,001
0x4395780d9062D76c618c7C62659Cc31F0d20214e,1 000 000,002
999.arb,0,003
123456.bnb,0,004
vitalik.eth,0,005
0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045,66
sendora.eth,0,1
sendora.base.eth,0,006`,
  },
  CH: {
    id: 'CH',
    label: 'Switzerland',
    content: `0x1345fc0db80b4e3d872a3770ddab52ef16f2bf17,10'000.001
0x4395780d9062D76c618c7C62659Cc31F0d20214e,1'000'000.002
999.arb,0.003
123456.bnb,0.004
vitalik.eth,0.005
0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045,66
sendora.eth,0.1
sendora.base.eth,0.006`,
  },
};

// export const native_coin_input_example = [
//   {
//     id: 'USA',
//     label: 'USA',
//     content: `0x1345fc0db80b4e3d872a3770ddab52ef16f2bf17,10,000.001
// 0x4395780d9062D76c618c7C62659Cc31F0d20214e,1,000,000.002
// 999.arb,0.003
// 123456.bnb,0.004
// vitalik.eth,0.005
// sendora.eth,0.1
// sendora.base.eth,0.006`,
//   },
//   {
//     id: 'DE',
//     label: 'Germany',
//     content: `0x1345fc0db80b4e3d872a3770ddab52ef16f2bf17,10.000,001
// 0x4395780d9062D76c618c7C62659Cc31F0d20214e,1.000.000,002
// 999.arb,0,003
// 123456.bnb,0,004
// vitalik.eth,0,005
// sendora.eth,0,1
// sendora.base.eth,0,006`,
//   },
//   {
//     id: 'FR',
//     label: 'France',
//     content: `0x1345fc0db80b4e3d872a3770ddab52ef16f2bf17,10 000,001
// 0x4395780d9062D76c618c7C62659Cc31F0d20214e,1 000 000,002
// 999.arb,0,003
// 123456.bnb,0,004
// vitalik.eth,0,005
// sendora.eth,0,1
// sendora.base.eth,0,006`,
//   },
//   {
//     id: 'CH',
//     label: 'Switzerland',
//     content: `0x1345fc0db80b4e3d872a3770ddab52ef16f2bf17,10'000.001
// 0x4395780d9062D76c618c7C62659Cc31F0d20214e,1'000'000.002
// 999.arb,0.003
// 123456.bnb,0.004
// vitalik.eth,0.005
// sendora.eth,0.1
// sendora.base.eth,0.006`,
//   },
//   //   {
//   //     id: 'DOT',
//   //     label: 'Dot',
//   //     content: `0x1345fc0db80b4e3d872a3770ddab52ef16f2bf17,10000.001
//   // 0x4395780d9062D76c618c7C62659Cc31F0d20214e,1000000.002
//   // 999.arb,0.003
//   // 123456.bnb,0.004
//   // vitalik.eth,0.005
//   // sendora.eth,0.1
//   // sendora.base.eth,0.006`,
//   //   },
//   //   {
//   //     id: 'COMMA',
//   //     label: 'Comma',
//   //     content: `0x1345fc0db80b4e3d872a3770ddab52ef16f2bf17,10000,001
//   // 0x4395780d9062D76c618c7C62659Cc31F0d20214e,1000000,002
//   // 999.arb,0,003
//   // 123456.bnb,0,004
//   // vitalik.eth,0,005
//   // sendora.eth,0,1
//   // sendora.base.eth,0,006`,
//   //   },
// ];
