import type React from 'react';
export default ({ children }: { children: React.ReactNode }) => {
  return (
    <span className="relative text-base md:text-lg text-foreground-500 ">
      {children}
    </span>
  );
};
