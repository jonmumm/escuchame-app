export function assertNotNull<T>(
  value: T,
  message: string = "Value should not be null"
): asserts value is NonNullable<T> {
  if (value === null || value === undefined) {
    throw new Error(message);
  }
}
