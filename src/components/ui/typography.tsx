import { cn } from "@/lib/utils";
import { AnchorHTMLAttributes, ReactNode } from "react";

export interface TitleProps {
  children: ReactNode | string;
}

export function Title({ children }: TitleProps) {
  return (
    <h2 className="scroll-m-20 pb-2 text-xl font-semibold tracking-tight first:mt-0">
      {children}
    </h2>
  );
}

export function Anchor({
  children,
  ...props
}: AnchorHTMLAttributes<HTMLAnchorElement>) {
  return (
    <a
      {...props}
      className={cn(
        "transition-colors hover:text-foreground/80 text-foreground/60",
        props.className
      )}
    >
      {children}
    </a>
  );
}
