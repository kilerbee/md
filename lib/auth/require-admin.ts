import { headers } from "next/headers";
import { isAdminAuthorized } from "@/lib/auth/basic-auth";

export async function requireAdmin() {
  const requestHeaders = await headers();

  if (!isAdminAuthorized(requestHeaders.get("authorization"))) {
    throw new Error("Unauthorized");
  }
}
