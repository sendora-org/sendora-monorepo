import { emojiAvatarForAddress } from '@/libs/emojiAvatarFOrAddress';
import { useMemo } from 'react';

export const UserIcon = ({ address }: { address: string }) => {
  const { color: backgroundColor, emoji } = useMemo(
    () => emojiAvatarForAddress(address),
    [address],
  );
  return (
    <div
      className="w-[40px] h-[40px]   flex justify-center items-center "
      style={{ backgroundColor, fontSize: '24px' }}
    >
      {emoji}
    </div>
  );
};
