import type React from 'react';
export default ({ children }: { children: React.ReactNode }) => {
  return (
    <h1 className="flex flex-row flex-wrap-reverse items-center gap-2 text-3xl text-foreground-600 font-bold  ">
      {children}
    </h1>
  );
};
