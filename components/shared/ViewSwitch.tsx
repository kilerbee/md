"use client";

import Link from "next/link";

export function ViewSwitch({
  views,
  currentView
}: {
  views: readonly { label: string; href: string }[];
  currentView: string;
}) {
  return (
    <div className="flex gap-0.5 rounded-md border border-neutral-300 p-0.5 text-sm">
      {views.map((view) =>
        view.label === currentView ? (
          <span
            key={view.label}
            className="rounded bg-neutral-900 px-2.5 py-1 text-white"
          >
            {view.label}
          </span>
        ) : (
          <Link
            key={view.label}
            href={view.href}
            className="rounded px-2.5 py-1 text-neutral-600 hover:text-neutral-900"
          >
            {view.label}
          </Link>
        )
      )}
    </div>
  );
}