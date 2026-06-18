"use client";

interface DeleteButtonProps {
  action: (formData: FormData) => void;
  id: number;
  label: string;
}

export function DeleteButton({ action, id, label }: DeleteButtonProps) {
  return (
    <form
      action={action}
      onSubmit={(e) => {
        if (!confirm(label)) {
          e.preventDefault();
        }
      }}
    >
      <input name="id" type="hidden" value={id} />
      <button className="text-red-700 underline underline-offset-2" type="submit">
        Delete
      </button>
    </form>
  );
}