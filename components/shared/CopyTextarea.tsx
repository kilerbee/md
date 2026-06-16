"use client";

export function CopyTextarea({ value }: { value: string }) {
  return (
    <textarea
      className="mt-4 h-[60vh] w-full border border-neutral-300 px-3 py-2 font-mono text-sm leading-relaxed"
      onClick={(e) => {
        const target = e.currentTarget;
        target.select();
        target.setSelectionRange(0, target.value.length);
      }}
      readOnly
      value={value}
    />
  );
}