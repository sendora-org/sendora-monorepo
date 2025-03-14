import useAuthStore from '@/hooks/useAuth';
import {
  Avatar,
  Button,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownSection,
  DropdownTrigger,
  User,
} from '@heroui/react';

import { emojiAvatarForAddress } from '@/libs/emojiAvatarFOrAddress';
// export const PlusIcon = (props) => {
//   return (
//     <svg
//       aria-hidden="true"
//       fill="none"
//       focusable="false"
//       height="1em"
//       role="presentation"
//       viewBox="0 0 24 24"
//       width="1em"
//       {...props}
//     >
//       <g
//         fill="none"
//         stroke="currentColor"
//         strokeLinecap="round"
//         strokeLinejoin="round"
//         strokeWidth={1.5}
//       >
//         <path d="M6 12h12" />
//         <path d="M12 18V6" />
//       </g>
//     </svg>
//   );
// };

export const EmojiIcon = ({ address }: { address: string }) => {
  const { color: backgroundColor, emoji } = emojiAvatarForAddress(address);
  return (
    <div
      className="w-[40px] h-[40px]   flex justify-center items-center "
      style={{ backgroundColor, fontSize: '24px' }}
    >
      {emoji}
    </div>
  );
};

export default function LoginProfile({
  address,
  displayName,
  displayBalance,
}: { address: string; displayName: string; displayBalance?: string }) {
  const { logout } = useAuthStore.getState();
  return (
    <Dropdown
      showArrow
      classNames={{
        base: 'before:bg-default-200', // change arrow background
        content: 'p-0 border-small border-divider bg-background',
      }}
      radius="sm"
    >
      <DropdownTrigger>
        <Button
          startContent={
            <Avatar
              size="sm"
              showFallback
              fallback={<EmojiIcon address={address} />}
            />
          }
          disableRipple
          variant="ghost"
        >
          {displayName}
        </Button>
      </DropdownTrigger>
      <DropdownMenu
        aria-label="Custom item styles"
        className="p-3"
        disabledKeys={['profile']}
        itemClasses={{
          base: [
            'rounded-md',
            'text-default-500',
            'transition-opacity',
            'data-[hover=true]:text-foreground',
            'data-[hover=true]:bg-default-100',
            'dark:data-[hover=true]:bg-default-50',
            'data-[selectable=true]:focus:bg-default-50',
            'data-[pressed=true]:opacity-70',
            'data-[focus-visible=true]:ring-default-500',
          ],
        }}
      >
        <DropdownSection showDivider aria-label="Profile & Actions">
          <DropdownItem
            key="profile"
            isReadOnly
            className="h-14 gap-2 opacity-100"
          >
            <User
              avatarProps={{
                size: 'sm',
                radius: 'full',
                fallback: <EmojiIcon address={address} />,
              }}
              classNames={{
                name: 'text-default-600',
                description: 'text-default-500',
              }}
              description={displayBalance}
              name={displayName}
            />
          </DropdownItem>
          {/* <DropdownItem key="settings">Settings</DropdownItem> */}
        </DropdownSection>

        {/* <DropdownSection showDivider aria-label="Preferences"> */}

        {/* <DropdownItem
                        key="theme"
                        isReadOnly
                        className="cursor-default"
                        endContent={
                            <select
                                className="z-10 outline-none w-16 py-0.5 rounded-md text-tiny group-data-[hover=true]:border-default-500 border-small border-default-300 dark:border-default-200 bg-transparent text-default-500"
                                id="theme"
                                name="theme"
                            >
                                <option>System</option>
                                <option>Dark</option>
                                <option>Light</option>
                            </select>
                        }
                    >
                        Theme
                    </DropdownItem> */}
        {/* </DropdownSection> */}

        <DropdownSection aria-label="Help & Feedback">
          <DropdownItem
            onPress={() =>
              open('https://github.com/sendora-org/sendora-monorepo/issues')
            }
            key="help_and_feedback"
          >
            Help & Feedback
          </DropdownItem>
          <DropdownItem onPress={logout} key="logout">
            Log Out
          </DropdownItem>
        </DropdownSection>
      </DropdownMenu>
    </Dropdown>
  );
}
