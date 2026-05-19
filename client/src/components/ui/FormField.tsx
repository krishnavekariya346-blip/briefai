import type { ReactNode } from 'react';

interface FormFieldProps {
  label: string;
  htmlFor: string;
  error?: string;
  children: ReactNode;
}

export default function FormField({ label, htmlFor, error, children }: FormFieldProps) {
  return (
    <div>
      <label className="label" htmlFor={htmlFor}>
        {label}
      </label>
      {children}
      {error && (
        <p className="field-error" role="alert" id={`${htmlFor}-error`}>
          {error}
        </p>
      )}
    </div>
  );
}
