"use client";

import { useMemo, useRef, useState } from "react";
import type { NavigateAction } from "react-big-calendar";

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

export function CustomToolbar({ date, onNavigate }: { date: Date; onNavigate: (action: NavigateAction, date?: Date) => void }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const options = useMemo(() => {
    const now = new Date();
    const items: { label: string; value: Date }[] = [];
    // 12 months from current month
    for (let i = 0; i < 12; i++) {
      const d = new Date(now.getFullYear(), now.getMonth() + i, 1);
      items.push({
        label: `${MONTHS[d.getMonth()]} ${d.getFullYear()}`,
        value: d
      });
    }
    return items;
  }, []);

  const goToMonth = (d: Date) => {
    onNavigate("DATE", d);
    setOpen(false);
  };

  return (
    <div className="mb-4 flex items-center justify-between">
      <button
        type="button"
        className="border border-neutral-300 px-3 py-1 text-sm text-neutral-600 hover:border-neutral-900 hover:text-neutral-900"
        onClick={() => onNavigate("TODAY")}
      >
        Today
      </button>

      <div ref={ref} className="relative flex items-center gap-2">
        <button
          type="button"
          className="border border-neutral-300 px-2 py-1 text-sm text-neutral-600 hover:border-neutral-900 hover:text-neutral-900"
          onClick={() => onNavigate("PREV")}
        >
          ←
        </button>

        <button
          type="button"
          className="flex items-center gap-1 border border-neutral-300 px-3 py-1 text-sm font-medium text-neutral-900 hover:border-neutral-900"
          onClick={() => setOpen(!open)}
        >
          {MONTHS[date.getMonth()]} {date.getFullYear()}
          <span className="text-xs text-neutral-500">▼</span>
        </button>

        <button
          type="button"
          className="border border-neutral-300 px-2 py-1 text-sm text-neutral-600 hover:border-neutral-900 hover:text-neutral-900"
          onClick={() => onNavigate("NEXT")}
        >
          →
        </button>

        {open && (
          <div className="absolute right-0 top-full z-50 mt-1 max-h-64 w-48 overflow-y-auto border border-neutral-300 bg-white shadow-lg">
            {options.map((opt) => {
              const isSelected =
                date.getMonth() === opt.value.getMonth() &&
                date.getFullYear() === opt.value.getFullYear();
              return (
                <button
                  key={opt.label}
                  type="button"
                  className={`block w-full px-3 py-1.5 text-left text-sm hover:bg-neutral-100 ${
                    isSelected ? "bg-neutral-900 text-white hover:bg-neutral-800" : "text-neutral-700"
                  }`}
                  onClick={() => goToMonth(opt.value)}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}