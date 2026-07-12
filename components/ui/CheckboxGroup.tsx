import type { ReactNode } from 'react'

export type CheckboxOption = { id: string; label: string; description?: string }

type CheckboxGroupProps = {
  legend: string
  options: CheckboxOption[]
  value: string[]
  onChange: (next: string[]) => void
  name: string
  className?: string
  theme?: 'brutalist' | 'culinary'
}

export function CheckboxGroup({
  legend,
  options,
  value,
  onChange,
  name,
  className = '',
  theme,
}: CheckboxGroupProps) {
  const culinary = theme === 'culinary'
  const toggle = (id: string) => {
    onChange(value.includes(id) ? value.filter((x) => x !== id) : [...value, id])
  }
  return (
    <fieldset className={className}>
      <legend
        className={
          culinary
            ? 'mb-3 font-sans text-[12px] font-semibold uppercase tracking-[0.1em] text-charcoal'
            : 'mb-3 text-sm font-medium text-cream/80'
        }
      >
        {legend}
      </legend>
      <ul className="space-y-2.5">
        {options.map((o) => (
          <li key={o.id}>
            <label
              className={
                culinary
                  ? 'flex cursor-pointer items-start gap-3 font-sans text-sm text-charcoal'
                  : 'flex cursor-pointer items-start gap-3 text-sm text-cream/90'
              }
            >
              <input
                type="checkbox"
                name={`${name}[]`}
                className={
                  culinary
                    ? 'mt-1 h-4 w-4 rounded-none border border-charcoal bg-bone text-navy shadow-none focus:ring-gold'
                    : 'mt-1 h-4 w-4 rounded border border-brass/40 bg-midnight text-brass focus:ring-brass/50'
                }
                checked={value.includes(o.id)}
                onChange={() => toggle(o.id)}
              />
              <span>
                <span className={culinary ? 'font-medium text-charcoal' : 'font-medium text-cream'}>
                  {o.label}
                </span>
                {o.description ? (
                  <span className={culinary ? 'ml-1 text-charcoal/55' : 'ml-1 text-cream/50'}>
                    — {o.description}
                  </span>
                ) : null}
              </span>
            </label>
          </li>
        ))}
      </ul>
    </fieldset>
  )
}
