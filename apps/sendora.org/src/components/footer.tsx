'use client';

import { Divider, Link } from '@heroui/react';
import type { IconProps } from '@iconify/react';
import { Icon } from '@iconify/react';
import React from 'react';
import { SendoraICon } from './social';

type SocialIconProps = Omit<IconProps, 'icon'>;

const footerNavigation = {
  services: [
    // { name: 'Branding', href: '#' },
    // { name: 'Data Analysis', href: '#' },
    // { name: 'E-commerce Solutions', href: '#' },
    // { name: 'Market Research', href: '#' },
  ],
  supportOptions: [
    // { name: 'Pricing Plans', href: '#' },
    // { name: 'User Guides', href: '#' },
    // { name: 'Tutorials', href: '#' },
    // { name: 'Service Status', href: '#' },
  ],
  aboutUs: [
    // { name: 'Our Story', href: '#' },
    // { name: 'Latest News', href: '#' },
    // { name: 'Career Opportunities', href: '#' },
    // { name: 'Media Enquiries', href: '#' },
    // { name: 'Collaborations', href: '#' },
  ],
  legal: [
    // { name: 'Claim', href: '#' },
    // { name: 'Privacy', href: '#' },
    // { name: 'Terms', href: '#' },
    // { name: 'User Agreement', href: '#' },
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
      name: 'ENS',
      href: 'https://app.ens.domains/sendora.eth',
      icon: (props: SocialIconProps) => (
        <Icon {...props} icon="flowbite:profile-card-solid" />
      ),
    },

    {
      name: 'Docs',
      href: 'https://docs.sendora.org/',
      icon: (props: SocialIconProps) => (
        <Icon {...props} icon="material-symbols:docs" />
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
    <footer className="flex w-full flex-col container mx-auto    max-w-[1024px] ">
      <div className="max-w-7xl px-2 pb-8 pt-16 sm:pt-32 lg:px-6 lg:pt-48">
        <div className="xl:grid xl:grid-cols-3 xl:gap-8">
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
              $SNDRA rises! 🚀 Building the best tool for Web3!
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
                  <item.icon aria-hidden="true" className="w-6" />
                </Link>
              ))}
            </div>
          </div>
          {/* <div className="mt-16 grid grid-cols-2 gap-8 xl:col-span-2 xl:mt-0">
            <div className="md:grid md:grid-cols-2 md:gap-8">
              <div>
                {renderList({
                  title: 'Services',
                  items: footerNavigation.services,
                })}
              </div>
              <div className="mt-10 md:mt-0">
                {renderList({
                  title: 'Support',
                  items: footerNavigation.supportOptions,
                })}
              </div>
            </div>
            <div className="md:grid md:grid-cols-2 md:gap-8">
              <div>
                {renderList({
                  title: 'About Us',
                  items: footerNavigation.aboutUs,
                })}
              </div>
              <div className="mt-10 md:mt-0">
                {renderList({ title: 'Legal', items: footerNavigation.legal })}
              </div>
            </div>
          </div> */}
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
