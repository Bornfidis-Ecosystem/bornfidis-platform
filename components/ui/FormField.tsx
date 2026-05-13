import type { ReactNode, InputHTMLAttributes, TextareaHTMLAttributes, SelectHTMLAttributes } from 'react'

const fieldClass =
  'w-full rounded-sm border border-brass/30 bg-white/5 px-4 py-2.5 text-sm font-light text-cream placeholder:text-cream/35 focus:border-brass/60 focus:outline-none focus:ring-1 focus:ring-brass/30'

type FormFieldBase = {
  label: ReactNode
  id: string
  error?: string
  required?: boolean
  className?: string
  description?: string
}

export function TextField({ label, id, error, required, className, description, ...input }: FormFieldBase & InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div className={className}>
      <label htmlFor={id} className="mb-1 block text-sm font-medium text-cream/80">
        {label}
        {required ? <span className="text-red-400"> *</span> : null}
      </label>
      {description ? <p className="mb-1.5 text-xs text-cream/50">{description}</p> : null}
      <input
        id={id}
        className={fieldClass}
        aria-invalid={!!error}
        aria-describedby={error ? `${id}-err` : undefined}
        {...input}
      />
      {error ? (
        <p id={`${id}-err`} className="mt-1 text-xs text-red-300" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  )
}

export function TextareaField({
  label,
  id,
  error,
  required,
  className,
  description,
  rows = 3,
  ...textarea
}: FormFieldBase & TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <div className={className}>
      <label htmlFor={id} className="mb-1 block text-sm font-medium text-cream/80">
        {label}
        {required ? <span className="text-red-400"> *</span> : null}
      </label>
      {description ? <p className="mb-1.5 text-xs text-cream/50">{description}</p> : null}
      <textarea id={id} className={fieldClass} rows={rows} aria-invalid={!!error} {...textarea} />
      {error ? <p className="mt-1 text-xs text-red-300">{error}</p> : null}
    </div>
  )
}

export function SelectField({
  label,
  id,
  error,
  required,
  className,
  children,
  ...select
}: FormFieldBase & SelectHTMLAttributes<HTMLSelectElement> & { children: ReactNode }) {
  return (
    <div className={className}>
      <label htmlFor={id} className="mb-1 block text-sm font-medium text-cream/80">
        {label}
        {required ? <span className="text-red-400"> *</span> : null}
      </label>
      <select id={id} className={fieldClass} aria-invalid={!!error} {...select}>
        {children}
      </select>
      {error ? <p className="mt-1 text-xs text-red-300">{error}</p> : null}
    </div>
  )
}

export { fieldClass as formFieldClass }
