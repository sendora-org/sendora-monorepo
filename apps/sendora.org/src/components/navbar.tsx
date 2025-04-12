'use client';
import type { NavbarProps } from '@heroui/react';
import Link from 'next/link';

import { menuItems } from '@/constants/config';
import {
  Chip,
  Navbar as HeroUINavbar,
  // Link,
  NavbarBrand,
  NavbarContent,
  NavbarItem,
  cn,
} from '@heroui/react';
import React from 'react';
import { SignIn } from './sign-in';
import { SendoraICon } from './social';

const Navbar = ({ uri = 'home', classNames = {}, ...props }) => {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);

  return (
    <div className="flex flex-col">
      <HeroUINavbar
        // ref={ref}
        {...props}
        classNames={{
          base: cn('border-default-100 bg-transparent', {
            'bg-default-200/50 dark:bg-default-100/50': isMenuOpen,
          }),
          wrapper: '  sm:px-6 px-2 max-w-[1280px] ',
          item: 'hidden md:flex',
          ...classNames,
        }}
        height="60px"
        isMenuOpen={isMenuOpen}
        onMenuOpenChange={setIsMenuOpen}
      >
        <div className="flex  items-center gap-0 sm:gap-4">
          <NavbarBrand className="sm:px-0 px-0">
            <div className="rounded-full  text-background">
              <SendoraICon size={32} className="rounded-md" />
            </div>
            <span className="ml-2 text-2xl  font-medium text-default-700">
              SENDORA
            </span>

            <Chip
              size="sm"
              radius="sm"
              color="danger"
              className="h-6 scale-75"
              classNames={{
                content: 'text-black font-bold p-0.5',
              }}
            >
              ALPHA
            </Chip>
          </NavbarBrand>

          <NavbarContent justify="start">
            {menuItems.map((item) => (
              <NavbarItem key={`${item.uri}`}>
                <Link
                  className={
                    uri === item.uri
                      ? 'text-default-600 font-bold'
                      : 'text-default-600 '
                  }
                  href={item.url}
                >
                  {' '}
                  {item.name}
                </Link>
              </NavbarItem>
            ))}
          </NavbarContent>
        </div>

        <NavbarContent className="flex md:flex" justify="end">
          <NavbarItem className="ml-1 !flex gap-1">
            <SignIn />
          </NavbarItem>
        </NavbarContent>
      </HeroUINavbar>
    </div>
  );
};

export default Navbar;
