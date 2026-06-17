"use client";

export function CopyTextarea({ children }: { children: React.ReactNode }) {
  return (
    <pre
      className="mt-4 h-[60vh] w-full overflow-auto border border-neutral-300 px-3 py-2 font-sans text-sm leading-relaxed"
      onClick={(e) => {
        const selection = window.getSelection();
        if (selection) {
          const range = document.createRange();
          range.selectNodeContents(e.currentTarget);
          selection.removeAllRanges();
          selection.addRange(range);
        }
      }}
    >
      {children}
    </pre>
  );
}