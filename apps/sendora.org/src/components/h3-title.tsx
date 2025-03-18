import type React from 'react';
export default ({ children }: { children: React.ReactNode }) => {
  return (
    <span className="relative text-lg text-foreground-500">{children}</span>
  );
};
