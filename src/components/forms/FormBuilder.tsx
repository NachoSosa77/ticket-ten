"use client";

import { FormConfig, FormFieldConfig } from "@/lib/forms/types";

type FormValues = Record<string, string | number | boolean>;

interface FormBuilderProps {
  config: FormConfig;
  values: FormValues;
  errors?: Record<string, string>;
  isSubmitting?: boolean;
  onChange: (name: string, value: string | number | boolean) => void;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  submitLabel?: string;
}

function renderField(
  field: FormFieldConfig,
  value: string | number | boolean | undefined,
  error: string | undefined,
  onChange: (name: string, value: string | number | boolean) => void
) {
  const baseInputClass =
    "w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100";
  const errorClass = error ? "border-rose-300 focus:border-rose-300 focus:ring-rose-100" : "";

  switch (field.type) {
    case "text":
      return (
        <input
          id={field.name}
          type="text"
          className={`${baseInputClass} ${errorClass}`}
          placeholder={field.placeholder}
          value={String(value ?? "")}
          onChange={(e) => onChange(field.name, e.target.value)}
        />
      );

    case "textarea":
      return (
        <textarea
          id={field.name}
          className={`${baseInputClass} ${errorClass} min-h-30`}
          placeholder={field.placeholder}
          value={String(value ?? "")}
          onChange={(e) => onChange(field.name, e.target.value)}
        />
      );

    case "number":
      return (
        <input
          id={field.name}
          type="number"
          className={`${baseInputClass} ${errorClass}`}
          placeholder={field.placeholder}
          value={String(value ?? "")}
          onChange={(e) =>
            onChange(field.name, e.target.value === "" ? "" : Number(e.target.value))
          }
        />
      );

    case "datetime-local":
      return (
        <input
          id={field.name}
          type="datetime-local"
          className={`${baseInputClass} ${errorClass}`}
          value={String(value ?? "")}
          onChange={(e) => onChange(field.name, e.target.value)}
        />
      );

    case "checkbox":
      return (
        <input
          id={field.name}
          type="checkbox"
          checked={Boolean(value)}
          onChange={(e) => onChange(field.name, e.target.checked)}
        />
      );

    case "select":
      return (
        <select
          id={field.name}
          className={`${baseInputClass} ${errorClass}`}
          value={String(value ?? "")}
          onChange={(e) => onChange(field.name, e.target.value)}
        >
          <option value="">Seleccionar...</option>
          {field.options?.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      );

    default:
      return null;
  }
}

export default function FormBuilder({
  config,
  values,
  errors = {},
  isSubmitting = false,
  onChange,
  onSubmit,
  submitLabel = "Guardar",
}: FormBuilderProps) {
  return (
    <form onSubmit={onSubmit} className="space-y-5">
      {config.fields.map((field) => {
        const error = errors[field.name];

        return (
          <div key={field.name} className="space-y-2">
            <label htmlFor={field.name} className="block text-sm font-medium text-slate-800">
              {field.label}
              {field.required ? " *" : ""}
            </label>

            {field.description && (
              <p className="text-sm text-slate-500">{field.description}</p>
            )}

            {renderField(field, values[field.name], error, onChange)}

            {error && <p className="text-sm text-rose-600">{error}</p>}
          </div>
        );
      })}

      <div className="pt-2">
        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting ? "Guardando..." : submitLabel}
        </button>
      </div>
    </form>
  );
}
