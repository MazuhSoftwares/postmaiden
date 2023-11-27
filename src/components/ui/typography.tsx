import { ReactNode } from "react";

export function PageTitle({ children }: { children: ReactNode | string }) {
  return (
    <h2 className="scroll-m-20 border-b pb-2 text-2xl font-semibold tracking-tight first:mt-0">
      {children}
    </h2>
  );
}
