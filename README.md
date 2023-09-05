<p align="center">
 <img width="22%" height="22%" src="logo.png">
</p>

# ngx-signal-immutability

A lightweight library introducing compile-time immutability and optionally runtime object deep freezing to [Angular signals](https://angular.io/guide/signals):

- Immutability is enforced through the use of a custom type `Immutable<T>`, rendering all properties of the signal's value type recursively `readonly`. This means that the compiler will complain if you tried to mutate a property, saving you from runtime bugs. Read about the limitations of the `readonly` keyword in the [deep freeze section](#deep-freezing)
- There is support for mutating an immutable signal in a mutable fashion through external solutions like [immer.js](https://immerjs.github.io/immer/) or by employing an inherent yet less optimized built-in mutation function.

## Motivation

At the moment, there is no real immutability support for signals out-of-the-box, eventhough there had been [experiments](https://github.com/angular/angular/pull/49644) in the past. This is unsurprising, given the broad spectrum of applications that signals are intended for:

> We specifically didn’t want to "pick sides" in the mutable / immutable
> data discussion and designed the signal library (and other Angular APIs)
> so it works with both.
> &mdash; <cite>[Angular Discussions - Sub-RFC 2: Signal APIs](https://github.com/angular/angular/discussions/49683)</cite>

However, this can potentially result in unexpected behaviors and challenging-to-debug errors. For instance:
We might modify a signal containing a reference-type value from any location without utilizing `set`, `update`, `mutate`. This is actually possible without retaining the reference to the actual `WritableSignal`, hence operaiting on a supposedly readonly signal.

```typescript
const sig = signal({ something: 'initial' }).asReadonly();
sig().something = 'new';
console.log(sig()); // prints "{ something: 'new' }"
```

Another reason for this library is to bring the many advantages of immutability into the world of signals:

- Supports interoperability with rxjs observables, which may relay on a stream of immutable values (see `buffer`, `shareReplay`, etc.)
- Allows for accumulation of singal emmited values over time
- Helps following unidirectional dataflow principle
- More closely adheres to the principles of the functional programming paradigm, enhancing predictability in state modification (matter of taste)
- Improved signal state change detection, since modification of a signal only then fires a changed event notification if the new value is an actual new object

## Installation

Install using npm:

```bash
npm install ngx-signal-immutability
```

## Usage

### Basic

Create an immutable WritableSignal that can be mutated in a mutable fashion:

```typescript
import { immutableSignal } from 'ngx-signal-immutability';

const sig = immutableSignal({ count: 0 });

// Api is the same as a regular writable signal
// Apply a mutation
sig.mutate(currentState => {
  currentState.count += 1;
});

// Apply an update
sig.update(current => ({
  count: current.count + 1,
}));

// Set a new State
sig.set({ count: 3 });

// It saves you from:
sig().count = 5; // Compile-time Error

sig.update(current => {
  current.count = 2; // Compile-time Error
  return current;
});

// And this won't fire a changed notification envet:
sig.set(sig());
sig.update(current => current);
```

Make any signal immutable

```typescript
import { computed, signal } from '@angular/core';
import { immutable } from 'ngx-signal-immutability';

const sig = signal({ count: 0 });

const immutableSig1 = immutable(sig);
const immutableSig2 = immutable(sig.asReadonly());
const immutableSig3 = immutable(computed(() => sig()));
```

### Deep Freezing

TypeScript's structural type system cannot prevent violations of `readonly`, and therefore `Immutable<T>` constraints in certain scenarios, such as:

1. **Type Assertions:** If you use a type assertion to override the type of an object, you can potentially bypass the `readonly` or `Immutable<T>` constraints.
2. **Type Compatibility:** TypeScript's structural typing means that objects with `readonly` properties are compatible with their mutable counterparts, allowing you to bypass immutability checks.
3. **Function Arguments:** If you pass a `readonly` or `Immutable<T>` object to a function that accepts the non-readonly version of the type, the immutability type constraints are not enforced within the function's scope.

By deep freezing the state, you can attain runtime immutability assurance against direct modifications. However, it's important to acknowledge that this introduces some performance overhead. Consequently, it's particularly well-suited for use during development and debugging stages, [read more](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/freeze).

```typescript
import { signal } from '@angular/core';
import {
  immutable,
  immutableSignal,
  setGlobalImmutableSignalOptions,
} from 'ngx-signal-immutability';

// Option 1: Enable deep freezing globally
setGlobalImmutableSignalOptions({ enableDeepFreezing: true });
const writableImmutableSig1 = immutableSignal({ count: 0 }); // Any update of the value is automatically freezed
const immutableSig1 = immutable(signal({ count: 0 })); // Any derived value is automatically freezed

// Option 2: Enable deep freezing for specifc immutable signals
const writableImmutableSig2 = immutableSignal(
  { count: 0 },
  { enableDeepFreezing: true }
);
const immutableSig2 = immutable(signal({ count: 0 }), {
  enableDeepFreezing: true,
});
```

## Immer.js

When no specific strategy is provided, a basic Clone-and-Mutate approach is employed, leveraging [structuredClone](https://developer.mozilla.org/en-US/docs/Web/API/structuredClone) - or JSON Parse/Stringify as alternative if structuredClone is unsupported. While this method might be acceptable for various scenarios, it's advisable to consider integrating a specialized library like `immer.js` for more robustness and speed.

```typescript
import {
  immutableSignal,
  setGlobalImmutableSignalOptions,
} from 'ngx-signal-immutability';
import { produce } from 'immer';

// Option 1: Set global mutation function
setGlobalImmutableSignalOptions({
  mutationProducerFn: produce,
});

// Option 2: Set mutation func for specific immutable writable signal
const immutableSig = immutableSignal(
  { count: 0 },
  { mutationProducerFn: produce }
);
```

Built with ❤️ by zuriscript
