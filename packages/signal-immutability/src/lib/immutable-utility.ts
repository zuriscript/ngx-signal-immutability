/**
 * Naively creates a deep clone of a given value object using JSON.parse and JSON.stringify.
 * This approach is simple has some shortcomings and is not optimal for performance.
 *
 * @template T - The type of the value object.
 * @param value - The value object to be cloned.
 * @returns A deep clone of the provided value object.
 */
export function naiveDeepClone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

/**
 * Creates a deep clone of a given value object using either the `structuredClone` method if available,
 * or a naive approach using JSON.parse and JSON.stringify if `structuredClone` is not supported.
 * The naive approach is simple but may have shortcomings and is not optimal for performance.
 *
 * @template T - The type of the value object.
 * @param {T} value - The value object to be cloned.
 * @returns {T} A deep clone of the provided value object.
 */
export function deepClone<T>(value: T): T {
  return 'structuredClone' in window
    ? structuredClone(value)
    : naiveDeepClone(value);
}

/**
 * Naive implementation of an immutable update function using a clone-and-mutate approach.
 * This function serves as a placeholder that you can swap with a more optimized
 * solution like the one provided by the 'immer.js' library (https://immerjs.github.io/immer/).
 * Using 'immer.js' will result in more efficient and concise code for managing
 * immutable updates to your value.
 *
 * @template T - The type of the value object.
 * @param currentValue - The current value object to be updated.
 * @param mutation - A function that modifies a draft copy of the value.
 * @returns The new value object after applying the mutation.
 */
export function naiveCloneAndMutate<T>(
  currentValue: T,
  mutation: (drafT: T) => void
): T {
  const clone = deepClone(currentValue) as T;
  mutation(clone);
  return clone;
}

/**
 * Deeply freezes an object and its properties, making it read-only and immutable.
 * @template T - The type of the object.
 * @param {T} obj - The object to be deeply frozen.
 * @returns {T} The deeply frozen object.
 */
export function deepFreeze<T>(obj: T): T {
  if (obj) {
    Object.freeze(obj);

    const oIsFunction = typeof obj === 'function';
    const hasOwnProp = Object.prototype.hasOwnProperty;

    Object.getOwnPropertyNames(obj).forEach(function (prop: string) {
      if (
        hasOwnProp.call(obj, prop) &&
        (oIsFunction
          ? prop !== 'caller' && prop !== 'callee' && prop !== 'arguments'
          : true)
      ) {
        const propValue = obj[prop as keyof T];
        if (
          propValue !== null &&
          (typeof propValue === 'object' || typeof propValue === 'function') &&
          !Object.isFrozen(propValue)
        ) {
          deepFreeze(propValue);
        }
      }
    });
  }

  return obj;
}
