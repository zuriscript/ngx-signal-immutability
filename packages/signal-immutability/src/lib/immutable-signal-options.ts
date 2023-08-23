/* eslint-disable @typescript-eslint/no-explicit-any */
import { naiveCloneAndMutate } from './immutable-utility';

/**
 * Function signature for a clone and mutate like operation.
 * @template T - The type of the state object.
 * @param {T} currentState - The current state object to be updated.
 * @param {(draftState: T) => void} mutation - A function that modifies a draft copy of the state.
 * @returns {T} The new state object after applying the mutation.
 */
export type MutationProducerFn<T> = (
  currentState: T,
  mutation: (draftState: T) => void
) => T;

/**
 * Options for making a signal immutable
 * @template T - The type of the signal's value.
 */
export interface CreateImmutableSignalOptions<T> {
  /**
   * Custom clone and mutate strategy function.
   * @remarks You can provide your own cloning and mutation strategy function, e.g. 'immer.js'.
   * @default Unoptimized - If no mutationProducer function is provided, an unoptimized fallback implementation is used.
   */
  mutationProducerFn?: MutationProducerFn<T>;

  /**
   * Enable deep freezing of values within the signal.
   * @default false
   */
  enableDeepFreezing?: boolean;
}

/**
 * Global signal immutability options.
 * @type {Required<CreateImmutableSignalOptions<any>>}
 */
export let globalImmutableSignalOptions: Required<
  CreateImmutableSignalOptions<any>
> = getDefaultImmutableSignalOptions();

/**
 * Gets the default signal immutability options.
 * @returns {Required<CreateImmutableSignalOptions<any>>} Default signal immutability options.
 */
export function getDefaultImmutableSignalOptions(): Required<
  CreateImmutableSignalOptions<any>
> {
  return {
    mutationProducerFn: naiveCloneAndMutate,
    enableDeepFreezing: false,
  };
}

/**
 * Sets the global signal immutability options.
 * @param {CreateImmutableSignalOptions<any>} options - New signal immutability options.
 */
export function setGlobalImmutableSignalOptions(
  options: CreateImmutableSignalOptions<any>
): void {
  if (options) {
    const defaultOptions = getDefaultImmutableSignalOptions();
    globalImmutableSignalOptions = {
      mutationProducerFn:
        options.mutationProducerFn ?? defaultOptions.mutationProducerFn,
      enableDeepFreezing:
        options.enableDeepFreezing ?? defaultOptions.enableDeepFreezing,
    };
  }
}
