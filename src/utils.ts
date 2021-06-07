export function isPlainObject(obj: unknown): boolean {
  return typeof obj === 'object' && obj?.constructor === Object;
}

export function hasProp(obj: unknown, prop: string): boolean {
  return Object.prototype.hasOwnProperty.call(obj, prop);
}
