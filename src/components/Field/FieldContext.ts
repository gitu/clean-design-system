import { createContext, useContext } from 'react'

export interface FieldContextValue {
  /** id the labelled control must adopt. */
  id: string
  /** Space-joined ids of the hint and error text, or undefined when neither exists. */
  describedBy: string | undefined
  invalid: boolean
  required: boolean
  disabled: boolean
}

export const FieldContext = createContext<FieldContextValue | null>(null)

/**
 * Read the surrounding `<Field>`, if there is one. Controls call this and merge
 * the result with their own props, so they work standalone or wrapped.
 */
export function useFieldControl(props: {
  id?: string
  'aria-describedby'?: string
  invalid?: boolean
  required?: boolean
  disabled?: boolean
}) {
  const field = useContext(FieldContext)
  const describedBy =
    [props['aria-describedby'], field?.describedBy].filter(Boolean).join(' ') || undefined

  return {
    id: props.id ?? field?.id,
    describedBy,
    invalid: props.invalid ?? field?.invalid ?? false,
    required: props.required ?? field?.required ?? false,
    disabled: props.disabled ?? field?.disabled ?? false,
  }
}
