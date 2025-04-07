export type Locale = 'en-US' | 'de-DE' | 'fr-FR' | 'de-CH';
export type HDLng = 'en' | 'de' | 'fr';
export type LocaleInfo = {
  decimalSeparator: '.' | ',';
  thousandSeparator: '' | '.' | ',' | `'` | ' ';
  locale: Locale;
  hdLng: HDLng;
};

export const numberFormats: Record<Locale, LocaleInfo> = {
  'en-US': {
    decimalSeparator: '.',
    thousandSeparator: ',',
    locale: 'en-US',
    hdLng: 'en',
  },

  'de-DE': {
    decimalSeparator: ',',
    thousandSeparator: '.',
    locale: 'de-DE',
    hdLng: 'de',
  },

  'fr-FR': {
    decimalSeparator: ',',
    thousandSeparator: ' ',
    locale: 'fr-FR',
    hdLng: 'fr',
  },

  'de-CH': {
    decimalSeparator: '.',
    thousandSeparator: `'`,
    locale: 'de-CH',
    hdLng: 'de',
  },
};

export type ExampleInfo = {
  id: Locale;
  label: Locale;
  content: string;
};

export type IExample = Record<Locale, ExampleInfo>;
export const native_coin_input_example: Record<Locale, ExampleInfo> = {
  'en-US': {
    id: 'en-US',
    label: 'en-US',
    content: `0x1345fc0db80b4e3d872a3770ddab52ef16f2bf17,10,000.001
0x4395780d9062D76c618c7C62659Cc31F0d20214e,1,000,000.002
999.arb,0.003
123456.bnb,0.004
vitalik.eth,0.005
0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045,66
sendora.eth,0.1
sendora.base.eth,0.006`,
  },
  'de-DE': {
    id: 'de-DE',
    label: 'de-DE',
    content: `0x1345fc0db80b4e3d872a3770ddab52ef16f2bf17,10.000,001
0x4395780d9062D76c618c7C62659Cc31F0d20214e,1.000.000,002
999.arb,0,003
123456.bnb,0,004
vitalik.eth,0,005
0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045,66
sendora.eth,0,1
sendora.base.eth,0,006`,
  },
  'fr-FR': {
    id: 'fr-FR',
    label: 'fr-FR',
    content: `0x1345fc0db80b4e3d872a3770ddab52ef16f2bf17,10 000,001
0x4395780d9062D76c618c7C62659Cc31F0d20214e,1 000 000,002
999.arb,0,003
123456.bnb,0,004
vitalik.eth,0,005
0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045,66
sendora.eth,0,1
sendora.base.eth,0,006`,
  },
  'de-CH': {
    id: 'de-CH',
    label: 'de-CH',
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

export const discountedPriceTips = [
  'As a valued subscriber, you can avoid the tool fee.',
  'During the Beta testing period, you can avoid the tool fee.',
];
