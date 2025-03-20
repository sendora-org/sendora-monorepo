import type React from 'react';
export default ({ children }: { children: React.ReactNode }) => {
  return (
    <h1 className="text-lg md:text-xl font-medium text-foreground-600 mb-0">
      {children}
    </h1>
  );
};
