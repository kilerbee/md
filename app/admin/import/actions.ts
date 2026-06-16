"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth/require-admin";
import { buildImportPlan, executeImportPlan } from "./import-plan";
import { signPlan, verifySignedPlan } from "./plan-signing";
import type { ImportPlan, ImportState } from "./types";

export async function previewImport(_previousState: ImportState, formData: FormData): Promise<ImportState> {
  await requireAdmin();

  const input = getInput(formData, "json");
  const plan = await buildImportPlan(input);
  const signedPlan = plan.errors.length === 0 ? signPlan(plan) : null;

  return {
    input,
    plan,
    signedPlan,
    importMessage: null
  };
}

export async function runImport(previousState: ImportState, formData: FormData): Promise<ImportState> {
  await requireAdmin();

  try {
    const signedPlan = getInput(formData, "signed_plan");
    const plan = verifySignedPlan<ImportPlan>(signedPlan);

    await executeImportPlan(plan);

    revalidatePath("/");
    revalidatePath("/archive");
    revalidatePath("/admin/events");
    revalidatePath("/admin/artists");
    revalidatePath("/admin/venues");
    revalidatePath("/admin/import");

    return {
      input: previousState.input,
      plan,
      signedPlan: null,
      importMessage: `Import complete. Created ${plan.eventsToCreate.length} events, ${plan.artistsToCreate.length} artists, and ${plan.venuesToCreate.length} venues.`
    };
  } catch (error) {
    return {
      input: previousState.input,
      plan: previousState.plan,
      signedPlan: previousState.signedPlan,
      importMessage: `Import failed: ${error instanceof Error ? error.message : "Unknown error"}`
    };
  }
}

function getInput(formData: FormData, key: string) {
  const value = formData.get(key);

  if (typeof value !== "string") {
    throw new Error(`${key} is required`);
  }

  return value;
}
