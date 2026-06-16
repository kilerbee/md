import { ImportForm } from "./import-form";

export default function ImportPage() {
  return (
    <section>
      <h2 className="text-xl font-medium">Import</h2>
      <p className="mt-3 max-w-3xl text-sm text-neutral-700">
        Paste JSON, preview the full import plan, then import only after the preview is valid. Preview does not write to the database.
      </p>
      <div className="mt-6">
        <ImportForm />
      </div>
    </section>
  );
}
