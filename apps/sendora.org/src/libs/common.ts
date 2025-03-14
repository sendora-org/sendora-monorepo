import FingerprintJS from '@fingerprintjs/fingerprintjs';
export const getVisitorId = async () => {
  const fpPromise = FingerprintJS.load();
  const fp = await fpPromise;
  const result = await fp.get();
  return result.visitorId;
};

export const shortAddress = (address: string, length = 4) => {
  return `${address.slice(0, length)}...${address.slice(-length)}`;
};
