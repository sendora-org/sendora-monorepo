'use client';
import type { NavbarProps } from '@heroui/react';

import { menuItems } from '@/constants/config';
import {
  Navbar as HeroUINavbar,
  Link,
  NavbarBrand,
  NavbarContent,
  NavbarItem,
  cn,
} from '@heroui/react';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import React from 'react';
import LoginProfile from './login-profile';
import SelectButton from './select-button';
import { SignIn } from './sign-in';
import { SendoraICon } from './social';

// const randomUrl = () => {
//   const idx = getRandomInteger(1, menuItems.length - 1);
//   return menuItems[idx].url;
// };

const Navbar = React.forwardRef<
  HTMLElement,
  NavbarProps & { isHomePage?: boolean; uri?: string; chainId?: number }
>(
  (
    { classNames = {}, uri = 'home', isHomePage = true, chainId = 1, ...props },
    ref,
  ) => {
    const [isMenuOpen, setIsMenuOpen] = React.useState(false);

    return (
      <div className="flex flex-col">
        <HeroUINavbar
          ref={ref}
          {...props}
          classNames={{
            base: cn('border-default-100 bg-transparent', {
              'bg-default-200/50 dark:bg-default-100/50': isMenuOpen,
            }),
            wrapper: '  sm:px-6 px-2',
            item: 'hidden md:flex',
            ...classNames,
          }}
          height="60px"
          isMenuOpen={isMenuOpen}
          onMenuOpenChange={setIsMenuOpen}
        >
          <div className="flex  items-center gap-8">
            <NavbarBrand className="sm:px-0 px-0">
              <div className="rounded-full  text-background">
                <SendoraICon size={32} className="rounded-md" />
              </div>
              <span className="ml-2 text-2xl  font-medium text-default-700">
                SENDORA
              </span>
            </NavbarBrand>

            <NavbarContent justify="start">
              {menuItems.map((item) => (
                <NavbarItem key={`${item.uri}`}>
                  <Link
                    className={
                      uri === item.uri
                        ? 'text-default-600 '
                        : 'text-default-500 '
                    }
                    href={item.url}
                    size="sm"
                  >
                    {item.name}
                  </Link>
                </NavbarItem>
              ))}
            </NavbarContent>
          </div>

          <NavbarContent className="flex md:flex" justify="end">
            <NavbarItem className="ml-2 !flex gap-2">
              {!isHomePage && <SelectButton chainId={chainId} />}

              <SignIn />
            </NavbarItem>
          </NavbarContent>
        </HeroUINavbar>
      </div>
    );
  },
);

export default Navbar;
