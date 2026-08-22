export type ClassValue =
  | string
  | number
  | bigint
  | null
  | undefined
  | false
  | ClassValue[]

/** Join class names, dropping anything falsy. Nested arrays are flattened. */
export function cx(...parts: ClassValue[]): string {
  const out: string[] = []
  for (const part of parts) {
    if (!part && part !== 0) continue
    if (Array.isArray(part)) {
      const nested = cx(...part)
      if (nested) out.push(nested)
    } else {
      out.push(String(part))
    }
  }
  return out.join(' ')
}
