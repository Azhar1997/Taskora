"use client";

import { Button, type ButtonProps } from "@/components/ui/button";

export function ConfirmButton({
  confirmationMessage,
  children,
  ...props
}: ButtonProps & {
  confirmationMessage: string;
}) {
  return (
    <Button
      {...props}
      onClick={(event) => {
        if (!window.confirm(confirmationMessage)) {
          event.preventDefault();
        }
        props.onClick?.(event);
      }}
    >
      {children}
    </Button>
  );
}
