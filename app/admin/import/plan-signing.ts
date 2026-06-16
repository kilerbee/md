import { createHmac, timingSafeEqual } from "node:crypto";

export function signPlan(plan: unknown) {
  const payload = Buffer.from(JSON.stringify(plan), "utf8").toString("base64url");
  const signature = createSignature(payload);

  return `${payload}.${signature}`;
}

export function verifySignedPlan<T>(signedPlan: string): T {
  const [payload, signature] = signedPlan.split(".");

  if (!payload || !signature) {
    throw new Error("Invalid import plan signature");
  }

  const expected = createSignature(payload);
  const providedBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expected);

  if (providedBuffer.length !== expectedBuffer.length || !timingSafeEqual(providedBuffer, expectedBuffer)) {
    throw new Error("Invalid import plan signature");
  }

  return JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as T;
}

function createSignature(payload: string) {
  const secret = process.env.ADMIN_PASSWORD_HASH?.replaceAll("\\$", "$");

  if (!secret) {
    throw new Error("ADMIN_PASSWORD_HASH is required to sign import plans");
  }

  return createHmac("sha256", secret).update(payload).digest("base64url");
}
