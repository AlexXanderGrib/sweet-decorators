/**
 * Converts linked list simple array
 *
 * @template {T}
 * @param {T} child
 * @return {T[]} Array of child + all parents
 */
export function flattenLinked<T extends { parent?: T | undefined | null }>(
  child: T
): T[] {
  const array: T[] = [child];

  if (child.parent) {
    array.push(...flattenLinked(child.parent));
  }

  return array;
}
