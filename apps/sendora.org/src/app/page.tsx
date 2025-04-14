'use client';
import AppScreenshotSkewed from '@/components/app-screenshot-skewed';
import LayoutDefault from '@/components/layout-default';
import Typewriter from '@/components/typewriter';
import { Button } from '@heroui/react';
import { Icon } from '@iconify/react';
import { AnimatePresence, LazyMotion, domAnimation, m } from 'framer-motion';
import { motion } from 'framer-motion';
import { useTheme } from 'next-themes';

import { useRouter } from 'next/navigation';
export default function Home() {
  const router = useRouter();

  const { theme } = useTheme();
  return (
    <LayoutDefault footClasess="mt-[350px] md:mt-[650px]">
      <>
        <section className="z-20 flex flex-col items-start justify-center gap-[18px] sm:gap-6">
          {/* <Button
            className="h-9 overflow-hidden border-1 border-default-100 bg-default-50 px-[18px] py-2 text-small font-normal leading-5 text-default-500"
            endContent={
              <Icon
                className="flex-none outline-none [&>path]:stroke-[2]"
                icon="solar:arrow-right-linear"
                width={20}
              />
            }
            radius="full"
            variant="bordered"
          >
            New onboarding experience
          </Button> */}
          <LazyMotion features={domAnimation}>
            <m.div
              animate="kick"
              className="flex flex-col gap-6"
              exit="auto"
              initial="auto"
              transition={{
                duration: 0.25,
                ease: 'easeInOut',
              }}
              variants={{
                auto: { width: 'auto' },
                kick: { width: 'auto' },
              }}
            >
              <AnimatePresence>
                <m.div
                  key={1}
                  animate={{ filter: 'blur(0px)', opacity: 1, x: 0 }}
                  className="text-start text-[clamp(40px,10vw,44px)] font-bold leading-[1.2] tracking-tighter sm:text-[64px]"
                  initial={{ filter: 'blur(16px)', opacity: 0, x: 15 + 1 * 2 }}
                  transition={{
                    bounce: 0,
                    delay: 0.01 * 10,
                    duration: 0.8 + 0.1 * 8,
                    type: 'spring',
                  }}
                >
                  <div className="bg-hero-section-title bg-clip-text dark:text-transparent dark:from-[#FFFFFF] dark:to-[#FFFFFF66]">
                    Send tokens to multiple <br />
                    recipients
                  </div>
                </m.div>

                <m.div
                  key={2}
                  animate={{ filter: 'blur(0px)', opacity: 1, x: 0 }}
                  className="text-start font-normal leading-7 text-default-500 sm:w-[466px] sm:text-[18px]"
                  initial={{ filter: 'blur(16px)', opacity: 0, x: 15 + 1 * 3 }}
                  transition={{
                    bounce: 0,
                    delay: 0.01 * 30,
                    duration: 0.8 + 0.1 * 9,
                    type: 'spring',
                  }}
                >
                  <Typewriter
                    tips={[
                      `Sendora helps you send and track on-chain assets, and seamlessly
                  interact with on-chain programs.`,
                    ]}
                  />
                </m.div>

                <m.div
                  key={3}
                  animate={{ filter: 'blur(0px)', opacity: 1, x: 0 }}
                  className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-6"
                  initial={{ filter: 'blur(16px)', opacity: 0, x: 15 + 1 * 4 }}
                  transition={{
                    bounce: 0,
                    delay: 0.01 * 50,
                    duration: 0.8 + 0.1 * 10,
                    type: 'spring',
                  }}
                >
                  <Button
                    onPress={() => {
                      router.push('/native-coins/1');
                    }}
                    className="h-10 w-[163px] bg-default-foreground px-[16px] py-[10px] text-small font-medium leading-5 text-background"
                    radius="full"
                  >
                    Get Started
                  </Button>
                </m.div>
              </AnimatePresence>
            </m.div>
          </LazyMotion>
        </section>
        <LazyMotion features={domAnimation}>
          <AnimatePresence mode="wait">
            <motion.div
              animate={{
                rotate: -15,
                scale: 0.75,
                skewX: 18,
                opacity: 1,
                filter: 'blur(0px)',
              }}
              style={{ originX: 0.5, originY: 0.5 }}
              className="px-12"
              initial={{ filter: 'blur(16px)', opacity: 0 }}
              transition={{
                bounce: 0,
                delay: 0.01 * 10,
                duration: 0.8 + 0.1 * 8,
                type: 'spring',
              }}
            >
              <div className="browser-window  ">
                <div className="browser-bar">
                  <span className="circle red" />
                  <span className="circle yellow" />
                  <span className="circle green" />
                  <div className="address-bar">https://sendora.org</div>
                </div>

                <img
                  aria-label="@sendora"
                  src={
                    theme === 'light'
                      ? '/ads/ads5-light.png'
                      : '/ads/ads5-dark.png'
                  }
                />
              </div>
            </motion.div>
          </AnimatePresence>
        </LazyMotion>

        {/* <LazyMotion features={domAnimation}>
          <AnimatePresence mode="wait">
            <m.div
              animate={{ filter: 'blur(0px)', opacity: 1, y: 0 }}
              className="absolute top-[50%] sm:top-[80%]"
              initial={{ filter: 'blur(16px)', opacity: 0, y: 300 }}
              transition={{
                bounce: 0,
                delay: 0.01 * 10,
                duration: 0.8 + 0.1 * 8,
                type: 'spring',
              }}
            >
              <AppScreenshotSkewed className="w-[95%] " />
            </m.div>
          </AnimatePresence>
        </LazyMotion> */}
      </>
    </LayoutDefault>
  );
}
