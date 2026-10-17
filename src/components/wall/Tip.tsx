import type { ReactNode } from "react";

type Props = {
  label: string;
  children: ReactNode;
};

export function Tip({ label, children }: Props) {
  return (
    <span className="tip">
      {children}
      <span className="tip-bubble" role="tooltip">
        {label}
      </span>
    </span>
  );
}
