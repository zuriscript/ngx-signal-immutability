import {
  CreateSignalOptions,
  Signal,
  WritableSignal,
  computed,
  signal,
} from '@angular/core';
import {
  CreateImmutableSignalOptions,
  globalImmutableSignalOptions,
} from './immutable-signal-options';
import { Immutable } from './immutable-type';
import { deepFreeze } from './immutable-utility';

/**
 * Represents an immutable signal
 * @template T - The type of the signal's value.
 */
export type ImmutableSignal<T> = Signal<Immutable<T>>;

/**
 * Represents an immutable writable signal
 * @template T - The type of the signal's value.
 */
export interface ImmutableWritableSignal<T>
  extends WritableSignal<Immutable<T>> {
  /**
   * Applies a mutation function to the immutable signal's value producing a new value.
   * @param {(currentVal: T) => void} mutatorFn - The mutation function.
   * @returns {void}
   * @overload
   * @param {(currentVal: Immutable<T>) => void} mutatorFn - The mutation function.
   * @returns {void}
   */
  mutate(mutatorFn: (currentVal: T) => void): void;
  mutate(mutatorFn: (currentVal: Immutable<T>) => void): void;
  mutate(
    mutatorFn: ((currentVal: T) => void) | ((currentVal: Immutable<T>) => void)
  ): void;
}

/**
 * Makes a signal immutable.
 * @template T - The type of the signal's value.
 * @param {Signal<T>} sig - The signal to be made immutable.
 * @param {{ enableDeepFreezing?: boolean }} [options] - Options
 * @returns {ImmutableSignal<T>} Immutable Signal
 * @remarks If deep freezing is enabled, a new signal object is created during the process.
 * Otherwise, the same reference is returned.
 */
export function immutable<T>(
  sig: Signal<T>,
  options?: { enableDeepFreezing?: boolean }
): ImmutableSignal<T> {
  const derived =
    options?.enableDeepFreezing ??
    globalImmutableSignalOptions.enableDeepFreezing
      ? computed(() => deepFreeze(sig()))
      : sig;
  return derived as ImmutableSignal<T>;
}

/**
 * Creates an immutable signal.
 * @template T - The type of the signal's value.
 * @param {T} initialValue - The initial value of the signal.
 * @param {CreateImmutableSignalOptions<T>} [options] - The options for the immutable signal.
 * @returns {ImmutableWritableSignal<T>} An immutable signal
 */
export function immutableSignal<T>(
  initialValue: T,
  options?: CreateSignalOptions<T> & CreateImmutableSignalOptions<T>
): ImmutableWritableSignal<T> {
  const strictEqualityFn = options?.equal ?? ((a, b) => a === b);

  const sig = signal(initialValue, {
    ...options,
    equal: strictEqualityFn,
  }) as ImmutableWritableSignal<T>;

  const deepFreezeEnabled =
    options?.enableDeepFreezing ??
    globalImmutableSignalOptions.enableDeepFreezing;
  const mutateFn =
    options?.mutationProducerFn ??
    globalImmutableSignalOptions.mutationProducerFn;

  return new Proxy(sig, {
    get(target, property: keyof ImmutableWritableSignal<T>, receiver) {
      switch (property) {
        case 'set':
          return !deepFreezeEnabled
            ? target.set
            : (val: Immutable<T>) => {
                return target.set(deepFreeze(val));
              };
        case 'update':
          return !deepFreezeEnabled
            ? target.update
            : (updateFn: (val: Immutable<T>) => Immutable<T>) => {
                return target.update(val => deepFreeze(updateFn(val)));
              };
        case 'mutate':
          return (mutatorFn: (val: T) => void) => {
            return target.update(
              val =>
                mutateFn(
                  val as T,
                  mutatorFn as (currentVal: T) => void
                ) as Immutable<T>
            );
          };
        default:
          return Reflect.get(target, property, receiver);
      }
    },
  });
}
