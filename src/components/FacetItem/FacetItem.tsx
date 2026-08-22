import type { HTMLAttributes, ReactNode } from 'react'
import { cx } from '../../utils/cx'
import { Checkbox } from '../Checkbox/Checkbox'
import './FacetItem.css'

export interface FacetItemProps extends Omit<HTMLAttributes<HTMLDivElement>, 'onChange'> {
  /** The facet value shown to the user. */
  label: ReactNode
  /** Number of records carrying this value. */
  count?: number
  checked?: boolean
  defaultChecked?: boolean
  onChange?: (checked: boolean) => void
  disabled?: boolean
  /**
   * Handler for the "only" shortcut, which appears on hover and replaces the
   * whole group's selection with this one value. A genuine time-saver on
   * facets with many values; omit it and no shortcut renders.
   */
  onOnly?: () => void
  /** Radio semantics for single-select facets. */
  type?: 'checkbox' | 'radio'
  /** Shared radio group name — required when `type="radio"`. */
  name?: string
  /** Small colour swatch before the label, for status or category facets. */
  swatch?: string
}

const nf = new Intl.NumberFormat('en-US')

/** One selectable value inside a `FacetGroup`. */
export function FacetItem({
  label,
  count,
  checked,
  defaultChecked,
  onChange,
  disabled = false,
  onOnly,
  type = 'checkbox',
  name,
  swatch,
  className,
  ...rest
}: FacetItemProps) {
  const isZero = count === 0

  return (
    <div
      className={cx('cds-facet-item', (disabled || isZero) && 'is-disabled', className)}
      {...rest}
    >
      {type === 'radio' ? (
        <label className="cds-facet-item__control">
          <input
            type="radio"
            className="cds-facet-item__radio"
            name={name}
            checked={checked}
            defaultChecked={defaultChecked}
            disabled={disabled || isZero}
            onChange={event => onChange?.(event.target.checked)}
          />
          <span className="cds-facet-item__radio-dot" aria-hidden="true" />
          {swatch && (
            <span
              className="cds-facet-item__swatch"
              style={{ backgroundColor: swatch }}
              aria-hidden="true"
            />
          )}
          <span className="cds-facet-item__label">{label}</span>
        </label>
      ) : (
        <Checkbox
          size="sm"
          className="cds-facet-item__control"
          checked={checked}
          defaultChecked={defaultChecked}
          disabled={disabled || isZero}
          onChange={event => onChange?.(event.target.checked)}
          label={
            <span className="cds-facet-item__label-wrap">
              {swatch && (
                <span
                  className="cds-facet-item__swatch"
                  style={{ backgroundColor: swatch }}
                  aria-hidden="true"
                />
              )}
              <span className="cds-facet-item__label">{label}</span>
            </span>
          }
        />
      )}

      <span className="cds-facet-item__aside">
        {onOnly && !disabled && !isZero && (
          <button
            type="button"
            className="cds-facet-item__only"
            onClick={onOnly}
            tabIndex={-1}
            aria-hidden="true"
          >
            only
          </button>
        )}
        {count !== undefined && (
          <span className="cds-facet-item__count cds-numeric">{nf.format(count)}</span>
        )}
      </span>
    </div>
  )
}
