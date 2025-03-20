import type React from 'react';
export default ({ children }: { children: React.ReactNode }) => {
  return (
    <span className="relative text-sm md:text-md text-foreground-500">
      {children}
    </span>
  );
};
