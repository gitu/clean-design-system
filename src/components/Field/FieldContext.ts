import { createContext, useContext } from 'react'

export interface FieldContextValue {
  /** id the labelled control must adopt. */
  id: string
  /**
   * The field's label, when it is plain text.
   *
   * Only a composite control needs this — one `<Field>` around two inputs has
   * one visible label and two things to name, and "Embargo lifts — time" has to
   * be built from somewhere. A single control ignores it: the `<label for>`
   * already does the job.
   */
  label?: string
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
    /** The surrounding field's label text, for composite controls. */
    fieldLabel: field?.label,
    describedBy,
    invalid: props.invalid ?? field?.invalid ?? false,
    required: props.required ?? field?.required ?? false,
    disabled: props.disabled ?? field?.disabled ?? false,
  }
}
