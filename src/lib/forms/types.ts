export type FieldType =
  | "text"
  | "textarea"
  | "number"
  | "select"
  | "datetime-local"
  | "checkbox";

export interface SelectOption {
  label: string;
  value: string;
}

export interface FormFieldConfig {
  name: string;
  label: string;
  type: FieldType;
  placeholder?: string;
  required?: boolean;
  options?: SelectOption[];
  description?: string;
}

export interface FormConfig {
  fields: FormFieldConfig[];
}
