import Link from "next/link";
import { headers } from "next/headers";
import { isAdminAuthorized } from "@/lib/auth/basic-auth";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export default async function AdminLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  const requestHeaders = await headers();

  if (!isAdminAuthorized(requestHeaders.get("authorization"))) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-10">
        <h1 className="text-2xl font-semibold">Authentication required</h1>
        <p className="mt-3 text-neutral-700">Admin credentials are invalid.</p>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-5xl px-4 py-8">
      <header className="mb-8 border-b border-neutral-200 pb-4">
        <h1 className="text-2xl font-semibold">Admin</h1>
        <nav className="mt-4 flex flex-wrap gap-4 text-sm">
          <Link href="/admin">Overview</Link>
          <Link href="/admin/events">Events</Link>
          <Link href="/admin/artists">Artists</Link>
          <Link href="/admin/venues">Venues</Link>
          <Link href="/">Public site</Link>
        </nav>
      </header>
      {children}
    </main>
  );
}
