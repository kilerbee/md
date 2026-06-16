"use client";

import { useActionState, useMemo, useState } from "react";
import { previewImport, runImport } from "./actions";
import type { ImportPlan, ImportState } from "./types";

const initialState: ImportState = {
  input: "",
  plan: null,
  signedPlan: null,
  importMessage: null
};

export function ImportForm() {
  const [previewState, previewAction, previewPending] = useActionState(previewImport, initialState);
  const [importState, importAction, importPending] = useActionState(runImport, initialState);
  const [input, setInput] = useState(previewState.input);
  const [importSubmitted, setImportSubmitted] = useState(false);
  const importEnabled = Boolean(previewState.signedPlan && previewState.input === input && !previewPending && !importPending && !importSubmitted);
  const activePlan = previewState.plan;
  const activeMessage = importState.importMessage;

  const counters = useMemo(() => (activePlan ? getCounters(activePlan) : null), [activePlan]);

  return (
    <div className="space-y-8">
      <form action={previewAction} className="space-y-4" onSubmit={() => setImportSubmitted(false)}>
        <label className="block">
          <span className="text-sm font-medium">JSON input</span>
          <textarea
            className="mt-2 min-h-96 w-full border border-neutral-300 px-3 py-2 font-mono text-sm"
            name="json"
            onChange={(event) => {
              setInput(event.target.value);
              setImportSubmitted(false);
            }}
            value={input}
          />
        </label>
        <button className="border border-neutral-900 px-4 py-2 text-sm font-medium disabled:opacity-50" disabled={previewPending} type="submit">
          {previewPending ? "Previewing..." : "Preview"}
        </button>
      </form>

      {activeMessage ? (
        <p
          className={`border px-3 py-2 text-sm ${
            activeMessage.startsWith("Import failed") ? "border-red-700 text-red-800" : "border-green-700 text-green-800"
          }`}
        >
          {activeMessage}
        </p>
      ) : null}

      {activePlan ? (
        <section className="space-y-6">
          <div>
            <h2 className="text-xl font-medium">Preview results</h2>
            <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2 lg:grid-cols-4">
              {counters?.map((counter) => (
                <div className="border border-neutral-200 p-3" key={counter.label}>
                  <dt className="text-neutral-600">{counter.label}</dt>
                  <dd className="mt-1 text-2xl font-semibold">{counter.value}</dd>
                </div>
              ))}
            </dl>
          </div>

          <PreviewDetails plan={activePlan} />

          <form action={importAction} onSubmit={() => setImportSubmitted(true)}>
            <input name="signed_plan" type="hidden" value={previewState.signedPlan ?? ""} />
            <button className="border border-neutral-900 px-4 py-2 text-sm font-medium disabled:opacity-50" disabled={!importEnabled} type="submit">
              {importPending ? "Importing..." : "Import"}
            </button>
            {!importEnabled && previewState.signedPlan ? (
              <p className="mt-2 text-sm text-neutral-700">Preview the current JSON before importing.</p>
            ) : null}
          </form>
        </section>
      ) : null}
    </div>
  );
}

function PreviewDetails({ plan }: { plan: ImportPlan }) {
  return (
    <div className="space-y-6 text-sm">
      <DetailSection title="Events to create" items={plan.eventsToCreate.map((event) => `${event.externalId}: ${event.title} (${event.startDate})`)} />
      <DetailSection title="Artists to create" items={plan.artistsToCreate.map((artist) => `${artist.name} (${artist.country}, ${artist.genre})`)} />
      <DetailSection title="Venues to create" items={plan.venuesToCreate.map((venue) => `${venue.name}, ${venue.city}`)} />
      <DetailSection title="Warnings" items={plan.warnings} tone="warning" />
      <DetailSection title="Validation errors" items={plan.errors} tone="error" />
    </div>
  );
}

function DetailSection({
  title,
  items,
  tone = "default"
}: {
  title: string;
  items: string[];
  tone?: "default" | "warning" | "error";
}) {
  const toneClass = tone === "error" ? "border-red-300 text-red-900" : tone === "warning" ? "border-yellow-300 text-yellow-900" : "border-neutral-200";

  return (
    <section>
      <h3 className="font-medium">{title}</h3>
      {items.length === 0 ? (
        <p className="mt-2 text-neutral-600">None</p>
      ) : (
        <ul className={`mt-2 max-h-72 space-y-1 overflow-auto border p-3 ${toneClass}`}>
          {items.map((item, index) => (
            <li key={`${item}-${index}`}>{item}</li>
          ))}
        </ul>
      )}
    </section>
  );
}

function getCounters(plan: ImportPlan) {
  return [
    { label: "Events to create", value: plan.eventsToCreate.length },
    { label: "Events already existing", value: plan.eventsExisting.length },
    { label: "Artists to create", value: plan.artistsToCreate.length },
    { label: "Artists already existing", value: plan.artistsExisting.length },
    { label: "Venues to create", value: plan.venuesToCreate.length },
    { label: "Venues already existing", value: plan.venuesExisting.length },
    { label: "Warnings", value: plan.warnings.length },
    { label: "Errors", value: plan.errors.length }
  ];
}
