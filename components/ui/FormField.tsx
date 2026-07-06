import type { ReactNode, InputHTMLAttributes, TextareaHTMLAttributes, SelectHTMLAttributes } from 'react'

import { bookFieldClass, bookLabelClass } from '@/components/booking/book-culinary-classes'

const brutalistFieldClass =
  'w-full rounded-sm border border-brass/30 bg-white/5 px-4 py-2.5 text-sm font-light text-cream placeholder:text-cream/35 focus:border-brass/60 focus:outline-none focus:ring-1 focus:ring-brass/30'

const brutalistLabelClass = 'mb-1 block text-sm font-medium text-cream/80'

type FormFieldBase = {
  label: ReactNode
  id: string
  error?: string
  required?: boolean
  className?: string
  description?: string
  theme?: 'brutalist' | 'culinary'
}

function classes(theme: 'brutalist' | 'culinary' | undefined) {
  const culinary = theme === 'culinary'
  return {
    field: culinary ? bookFieldClass : brutalistFieldClass,
    label: culinary ? bookLabelClass : brutalistLabelClass,
    description: culinary ? 'mb-1.5 text-xs text-[#1a1a1a]/55' : 'mb-1.5 text-xs text-cream/50',
    error: culinary ? 'mt-1 text-xs text-red-700' : 'mt-1 text-xs text-red-300',
    required: culinary ? 'text-red-700' : 'text-red-400',
  }
}

export function TextField({
  label,
  id,
  error,
  required,
  className,
  description,
  theme,
  ...input
}: FormFieldBase & InputHTMLAttributes<HTMLInputElement>) {
  const c = classes(theme)
  return (
    <div className={className}>
      <label htmlFor={id} className={c.label}>
        {label}
        {required ? <span className={c.required}> *</span> : null}
      </label>
      {description ? <p className={c.description}>{description}</p> : null}
      <input
        id={id}
        className={c.field}
        aria-invalid={!!error}
        aria-describedby={error ? `${id}-err` : undefined}
        {...input}
      />
      {error ? (
        <p id={`${id}-err`} className={c.error} role="alert">
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
  theme,
  ...textarea
}: FormFieldBase & TextareaHTMLAttributes<HTMLTextAreaElement>) {
  const c = classes(theme)
  return (
    <div className={className}>
      <label htmlFor={id} className={c.label}>
        {label}
        {required ? <span className={c.required}> *</span> : null}
      </label>
      {description ? <p className={c.description}>{description}</p> : null}
      <textarea id={id} className={c.field} rows={rows} aria-invalid={!!error} {...textarea} />
      {error ? <p className={c.error}>{error}</p> : null}
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
  theme,
  ...select
}: FormFieldBase & SelectHTMLAttributes<HTMLSelectElement> & { children: ReactNode }) {
  const c = classes(theme)
  return (
    <div className={className}>
      <label htmlFor={id} className={c.label}>
        {label}
        {required ? <span className={c.required}> *</span> : null}
      </label>
      <select id={id} className={c.field} aria-invalid={!!error} {...select}>
        {children}
      </select>
      {error ? <p className={c.error}>{error}</p> : null}
    </div>
  )
}

export const formFieldClass = brutalistFieldClass
