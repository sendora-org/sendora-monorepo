'use client';

import { menuItems } from '@/constants/config';
import { Divider, Link } from '@heroui/react';
import type { IconProps } from '@iconify/react';
import { Icon } from '@iconify/react';
import React from 'react';
import { SendoraICon } from './social';

type SocialIconProps = Omit<IconProps, 'icon'>;

const footerNavigation = {
  services: menuItems.map((item) => {
    return {
      name: item.name,
      href: item.url,
    };
  }),
  aboutUs: [
    { name: 'Tutorials', href: 'https://docs.sendora.org' },
    { name: 'ENS', href: 'https://app.ens.domains/sendora.eth' },
    { name: 'Twitter', href: 'https://x.com/sendora_org' },
    { name: 'Github', href: 'https://github.com/sendora-org' },
    { name: 'Discord', href: 'https://discord.gg/YQp7fzv2G5' },
    { name: 'Telegram', href: 'https://t.me/+gfEJK481L3FiMjg1' },
  ],
  legal: [
    { name: 'Claim', href: '#' },
    { name: 'Privacy', href: '#' },
    { name: 'Terms', href: '#' },
    { name: 'User Agreement', href: '#' },
  ],
  social: [
    {
      name: 'Twitter',
      href: 'https://x.com/sendora_org',
      icon: (props: SocialIconProps) => (
        <Icon {...props} icon="fontisto:twitter" />
      ),
    },
    {
      name: 'GitHub',
      href: 'https://github.com/sendora-org',
      icon: (props: SocialIconProps) => (
        <Icon {...props} icon="fontisto:github" />
      ),
    },

    {
      name: 'Discord',
      href: 'https://discord.gg/YQp7fzv2G5',
      icon: (props: SocialIconProps) => (
        <Icon {...props} icon="fontisto:discord" />
      ),
    },

    {
      name: 'Telegram',
      href: 'https://t.me/+gfEJK481L3FiMjg1',
      icon: (props: SocialIconProps) => (
        <Icon {...props} icon="fontisto:telegram" />
      ),
    },
  ],
};

export default function Component() {
  const renderList = React.useCallback(
    ({
      title,
      items,
    }: {
      title: string;
      items: { name: string; href: string }[];
    }) => (
      <div>
        <h3 className="text-small font-semibold text-default-600">{title}</h3>
        <ul className="mt-6 space-y-4">
          {items.map((item) => (
            <li key={item.name}>
              <Link className="text-default-400" href={item.href} size="sm">
                {item.name}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    ),
    [],
  );

  return (
    <footer className="flex w-full flex-col container mx-auto    max-w-[1280px] ">
      <div className="max-w-7xl px-2 pb-8 pt-16 sm:pt-32 lg:px-6 lg:pt-48">
        <div className="xl:grid xl:grid-cols-2 xl:gap-8">
          <div className="space-y-8 md:pr-8">
            <div className="flex items-center justify-start">
              <div className="rounded-full  text-background">
                <SendoraICon size={32} className="rounded-md" />
              </div>
              <span className="ml-2 text-2xl  font-medium text-default-700">
                SENDORA
              </span>
            </div>

            <p className="text-small text-default-500">
              <Link
                isExternal
                showAnchorIcon
                href="https://dexscreener.com/base/0xb7e943C2582f76Ef220d081468CeC97ccdaDc3Ee"
              >
                $SNDRA rises!
              </Link>{' '}
              🚀 Building the best tool for Web3!
            </p>
            <div className="flex space-x-6">
              {footerNavigation.social.map((item) => (
                <Link
                  key={item.name}
                  isExternal
                  className="text-default-400"
                  href={item.href}
                >
                  <span className="sr-only">{item.name}</span>
                  <item.icon fontSize={48} aria-hidden="true" className="w-8" />
                </Link>
              ))}
            </div>
          </div>
          <div className="mt-8 grid grid-cols-3 md:gap-8   xl:mt-0">
            <div>
              {renderList({
                title: 'Services',
                items: footerNavigation.services,
              })}
            </div>

            <div>
              {renderList({
                title: 'About Us',
                items: footerNavigation.aboutUs,
              })}
            </div>

            <div className="">
              {renderList({
                title: 'Legal',
                items: footerNavigation.legal,
              })}
            </div>
          </div>
        </div>
        <Divider className="mt-16 sm:mt-20 lg:mt-24" />
        <div className="flex flex-wrap justify-between gap-2 pt-8">
          <p className="text-small text-default-400">
            &copy; 2025 SENDORA Inc. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
