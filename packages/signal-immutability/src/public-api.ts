/*
 * Public API Surface of ngx-signal-immutability
 */

export {
  ImmutableSignal,
  ImmutableWritableSignal,
  immutable,
  immutableSignal,
} from './lib/immutable-signal';
export {
  CreateImmutableSignalOptions as ImmutableSignalOptions,
  setGlobalImmutableSignalOptions,
} from './lib/immutable-signal-options';
export { Immutable } from './lib/immutable-type';
