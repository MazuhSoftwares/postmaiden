import { ReactNode } from "react";

export function Title({ children }: { children: ReactNode | string }) {
  return (
    <h2 className="scroll-m-20 pb-2 text-xl font-semibold tracking-tight first:mt-0">
      {children}
    </h2>
  );
}
