import Link from "next/link";

export default function CalendarPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <header className="mb-10">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-semibold tracking-normal">Muzički Događaji</h1>
          <div className="flex gap-0.5 rounded-md border border-neutral-300 p-0.5 text-sm">
            <Link href="/" className="rounded px-2.5 py-1 text-neutral-600 hover:text-neutral-900">List</Link>
            <span className="rounded bg-neutral-900 px-2.5 py-1 text-white">Calendar</span>
          </div>
        </div>
        <nav className="mt-5 text-sm">
          <Link href="/archive">Archive</Link>
        </nav>
      </header>

      <p className="text-neutral-600">Calendar view coming soon.</p>
    </main>
  );
}