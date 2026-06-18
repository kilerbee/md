"use client";

import { useFormStatus } from "react-dom";

interface SubmitButtonProps {
  label: string;
}

export function SubmitButton({ label }: SubmitButtonProps) {
  const { pending } = useFormStatus();

  return (
    <button
      className="border border-neutral-900 px-4 py-2 text-sm font-medium disabled:opacity-40"
      type="submit"
      disabled={pending}
    >
      {pending ? "Saving…" : label}
    </button>
  );
}