import type { ReactNode } from "react";

type PaymentDetailRowProps = {
  label: string;
  children: ReactNode;
};

export function PaymentDetailRow({ label, children }: PaymentDetailRowProps) {
  return (
    <div className="flex justify-between gap-4">
      <dt className="text-neutral-400">{label}</dt>
      <dd className="text-right text-white">{children}</dd>
    </div>
  );
}
