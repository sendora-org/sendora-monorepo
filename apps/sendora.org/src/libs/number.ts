export function parseAndScaleNumber(
  input: string,
  thousandSeparator: string,
  decimalSeparator: string,
): bigint {
  // 1. Remove the thousands separator.
  const normalized = input.split(thousandSeparator).join('');

  // 2. Replace the decimal point with a standard one .
  const parts = normalized.split(decimalSeparator);
  if (parts.length > 2) {
    throw new Error('Invalid number format: too many decimal separators.');
  }

  const integerPart = parts[0] || '0';
  let fractionalPart = parts[1] || '';

  // 3. Analyze the decimal part, handling up to a maximum of **two Unicode subscripts** that are valid.
  fractionalPart = fractionalPart.replace(
    /([\d])([\u2080-\u2089]{1,2})/,
    (_, digit, subscript) => {
      // Convert Unicode subscripts to corresponding numerical strings.
      //   ₀₁₂₃₄₅₆₇₈₉
      const count = [...subscript].reduce(
        (total, char) => total * 10 + (char.charCodeAt(0) - 0x2080),
        0,
      );

      // Ensure that the subscript does not exceed 18.
      if (count > 18) {
        throw new Error('Invalid format: subscript cannot be greater than 18.');
      }

      return digit.repeat(count);
    },
  );

  // 4. Ensure that the index is no longer included (allowed only once and already replaced).
  if (fractionalPart.match(/[\u2080-\u2089]/)) {
    throw new Error(
      'Invalid format: subscript found in an unexpected position.',
    );
  }

  // 5. Ensure that the decimal part is accurate to 18 digits (pad with zeros if necessary).
  fractionalPart = (fractionalPart + '0'.repeat(18)).slice(0, 18);

  // 6. Convert the integer part + decimal part into a bigint.
  const combinedNumber = integerPart + fractionalPart;
  return BigInt(combinedNumber);
}

export function formatBigIntNumber(
  value: bigint,
  thousandSeparator = ',',
  decimalSeparator = '.',
  precision = 18,
): string {
  if (precision < 0 || precision > 18) {
    throw new Error('Precision must be between 0 and 18');
  }

  // Special case for precision = 0: round up to integer
  if (precision === 0) {
    // If value is negative, we need to handle it separately
    const isNegative = value < 0n;
    const absValue = isNegative ? -value : value;
    // Add 0.5 (which is 10^17 in our 18-decimal system) and truncate decimals
    const rounded = absValue + 5n * 10n ** 17n;
    let integerPart = (rounded / 10n ** 18n).toString();
    if (isNegative) integerPart = '-' + integerPart;
    return integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, thousandSeparator);
  }

  // 1. Convert `bigint` to a string and pad it with 18 decimal places.
  const str = value.toString().padStart(19, '0'); // Ensure that there are at least 19 digits.
  let integerPart = str.slice(0, -18) || '0'; // Integer part
  let fractionalPart = str.slice(-18); // Decimal part

  // 2. Handle 'thousands separator'.
  integerPart = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, thousandSeparator);

  // 3. Handle decimal precision and remove unnecessary `0`s.
  fractionalPart = fractionalPart.slice(0, precision);
  let trimmedFractional = fractionalPart.replace(/0+$/, ''); // Remove trailing `0`.

  // 4. Count the number of leading zeros in the decimal part (`/^0+/`).
  const leadingZeroMatch = trimmedFractional.match(/^0+/);
  const leadingZeroCount = leadingZeroMatch ? leadingZeroMatch[0].length : 0;

  // 5. **Amending the rules for the display of leading zeros:**
  if (leadingZeroCount >= 4) {
    const subscriptZero = [...leadingZeroCount.toString()]
      .map((digit) => String.fromCharCode(0x2080 + Number.parseInt(digit)))
      .join(''); // Generate Unicode subscript

    trimmedFractional = `0${subscriptZero}${trimmedFractional.slice(leadingZeroCount)}`;
  }

  // 6. **Integer Part + Decimal Part**
  const result = trimmedFractional
    ? integerPart + decimalSeparator + trimmedFractional
    : integerPart;

  return result;
}
