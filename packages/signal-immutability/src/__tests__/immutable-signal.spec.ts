/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable tree-shaking/no-side-effects-in-initialization */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { computed, signal } from '@angular/core';
import { immutable, immutableSignal } from '../lib/immutable-signal';
import {
  getDefaultImmutableSignalOptions,
  globalImmutableSignalOptions,
  setGlobalImmutableSignalOptions,
} from '../lib/immutable-signal-options';

describe('immutable', () => {
  beforeAll(() => {
    setGlobalImmutableSignalOptions({
      enableDeepFreezing: false,
    });
  });

  it('should make a writable signal deeply readonly without creating a new object', () => {
    // Arrange
    const sig = signal({ a: 1 });

    // Act
    const immutableSig = immutable(sig);

    // Assert
    expect(immutableSig).toBe(sig);
    expect(immutableSig()).toBe(sig());
  });

  it('should make a signal deeply readonly without creating a new object', () => {
    // Arrange
    const sig = signal({ a: 1 }).asReadonly();

    // Act
    const immutableSig = immutable(sig);

    // Assert
    expect(immutableSig).toBe(sig);
    expect(immutableSig()).toBe(sig());
  });

  it('should make a computed signal deeply readonly without creating a new object', () => {
    // Arrange
    const sig = signal({ a: 1 });
    const computedSig = computed(() => sig());

    // Act
    const immutableSig = immutable(computedSig);

    // Assert
    expect(immutableSig).toBe(computedSig);
    expect(immutableSig()).toBe(computedSig());
  });

  it('should do nothing for immutable signals', () => {
    // Arrange
    const immutableSig = immutable(signal({ a: 1 }));

    // Act
    const doubleimmutableSig = immutable(immutableSig);

    // Assert
    expect(doubleimmutableSig).toBe(immutableSig);
    expect(doubleimmutableSig()).toBe(immutableSig());
  });
});

describe('immutable with deepFreeze enabled', () => {
  beforeAll(() => {
    setGlobalImmutableSignalOptions({
      enableDeepFreezing: true,
    });
  });

  it('should make a writable signal deeply readonly, creating a derived signal', () => {
    // Arrange
    const sig = signal({ a: 1 });

    // Act
    const immutableSig = immutable(sig);

    // Assert
    expect(immutableSig).not.toBe(sig);
    expect(immutableSig()).toBe(sig());
  });

  it('should make a signal deeply readonly, creating a derived signal', () => {
    // Arrange
    const sig = signal({ a: 1 }).asReadonly();

    // Act
    const immutableSig = immutable(sig);

    // Assert
    expect(immutableSig).not.toBe(sig);
    expect(immutableSig()).toBe(sig());
  });

  it('should make a computed signal deeply readonly, creating a derived signal', () => {
    // Arrange
    const sig = signal({ a: 1 });
    const computedSig = computed(() => sig());

    // Act
    const immutableSig = immutable(computedSig);

    // Assert
    expect(immutableSig).not.toBe(computedSig);
    expect(immutableSig()).toBe(computedSig());
  });

  it('should create a derived immutable signal based on the passed immutable signal', () => {
    // Arrange
    const immutableSig = immutable(signal({ a: 1 }));

    // Act
    const doubleimmutableSig = immutable(immutableSig);

    // Assert
    expect(doubleimmutableSig).not.toBe(immutableSig);
    expect(doubleimmutableSig()).toBe(immutableSig());
  });
});

describe.each([false, true])(
  'immutableSignal with deepFreeze enabled: %p',
  deepFreezeEnabled => {
    beforeAll(() => {
      setGlobalImmutableSignalOptions({
        ...getDefaultImmutableSignalOptions(),
        enableDeepFreezing: deepFreezeEnabled,
      });
    });

    it('should be a getter which reflects the contained primitive value', () => {
      // Act
      const state = immutableSignal(true);

      // Assert
      expect(state()).toBe(true);
    });

    it('should be a getter which reflects the contained reference typed value', () => {
      // Arrange
      const obj = { value: 5 };

      // Act
      const state = immutableSignal(obj);

      // Assert
      expect(state()).toBe(obj);
    });

    it('should accept set function to set new primitive value', () => {
      // Arrange
      const state = immutableSignal('initial');

      // Act
      state.set('new');

      // Assert
      expect(state()).toEqual('new');
    });

    it('should accept set function to set new reference typed value', () => {
      // Arrange
      const obj = { value: false };
      const state = immutableSignal(obj);

      // Act
      state.set({ value: true });

      // Assert
      expect(state()).toStrictEqual({ value: true });
      expect(state()).not.toBe(obj);
    });

    it('should accept update function to set new primitive value based on the previous one', () => {
      // Arrange
      const counter = immutableSignal(0);

      // Act
      counter.update(c => c + 1);

      // Assert
      expect(counter()).toEqual(1);
    });

    it('should accept update function to set new reference typed value based on the previous one', () => {
      // Arrange
      const obj = { value: 0 };
      const counter = immutableSignal(obj);

      // Act
      counter.update(c => ({
        value: c.value + 1,
      }));

      // Assert
      expect(counter()).toStrictEqual({ value: 1 });
      expect(counter()).not.toBe(obj);
    });

    it('should have mutate function for mutable, out of bound updates creating a new object', () => {
      // Arrange
      const obj = ['a'];
      const state = immutableSignal<string[]>(obj);
      const derived = computed(() => state().join(':'));

      // Act
      state.mutate(s => {
        s.push('b');
      });

      // Assert
      expect(state()).not.toBe(obj);
      expect(derived()).toEqual('a:b');
    });

    it('should not notify changes if set is called with same primitive value using default immutable equality function', () => {
      // Arrange
      const stateValue = 0;
      let computeCount = 0;
      const state = immutableSignal(stateValue);
      const derived = computed(() => `${typeof state()}:${++computeCount}`);
      expect(derived()).toEqual('number:1'); // sanity check

      // Act
      state.set(stateValue);

      // Assert
      expect(derived()).toEqual('number:1');
    });

    it('should not notify changes if set is called with same object using default immutable equality function', () => {
      // Arrange
      const stateValue = {};
      let computeCount = 0;
      const state = immutableSignal(stateValue);
      const derived = computed(() => `${typeof state()}:${++computeCount}`);
      expect(derived()).toEqual('object:1'); // sanity check

      // Act
      state.set(stateValue);

      // Assert
      expect(derived()).toEqual('object:1');
    });

    it('should not notify changes if update is called with same object using default immutable equality function', () => {
      // Arrannge
      const stateValue = {};
      let computeCount = 0;
      const state = immutableSignal(stateValue);
      const derived = computed(() => `${typeof state()}:${++computeCount}`);
      expect(derived()).toEqual('object:1'); // sanity check

      // reset signal value to the same object instance, expect change notification
      state.update(() => stateValue);

      // Assert
      expect(derived()).toEqual('object:1');
    });

    it('should notify changes if update is called with other primitive value using default immutable equality function', () => {
      // Arrange
      const state = immutableSignal(0);
      let computeCount = 0;
      const derived = computed(() => `${typeof state()}:${++computeCount}`);
      expect(derived()).toEqual('number:1'); // sanity check

      // Act && Assert
      state.set(1);
      expect(derived()).toEqual('number:2');

      // Act && Assert
      state.update(x => x + 1);
      expect(derived()).toEqual('number:3');
    });

    it('should notify changes if update is called with other object using default immutable equality function', () => {
      // Arrange
      const state = immutableSignal({} as unknown);
      let computeCount = 0;
      const derived = computed(() => `${typeof state()}:${++computeCount}`);
      expect(derived()).toEqual('object:1'); // sanity check

      // Act && Assert
      state.set({});
      expect(derived()).toEqual('object:2');

      // Act && Assert
      state.update(() => ({}));
      expect(derived()).toEqual('object:3');

      // Act && Assert
      state.mutate(() => {});
      expect(derived()).toEqual('object:4');

      // Act && Assert
      state.set([]);
      expect(derived()).toEqual('object:5');
    });

    describe('options', () => {
      beforeEach(() => {
        setGlobalImmutableSignalOptions({
          ...getDefaultImmutableSignalOptions(),
          enableDeepFreezing: deepFreezeEnabled,
        });
      });

      it('should mutate using default mutationFn if none provided', () => {
        // Arrange
        globalImmutableSignalOptions.mutationProducerFn = jest.fn();
        const sig = immutableSignal({ a: 1 });

        // Act
        sig.mutate(x => (x.a = 2));

        // Assert
        expect(
          globalImmutableSignalOptions.mutationProducerFn
        ).toHaveBeenCalled();
      });

      it('should mutate using custom global mutationFn', () => {
        // Arrange
        const mutationProducerFn = jest.fn();
        setGlobalImmutableSignalOptions({
          mutationProducerFn,
        });
        const sig = immutableSignal({ a: 1 });

        // Act
        sig.mutate(x => (x.a = 2));

        // Assert
        expect(mutationProducerFn).toHaveBeenCalled();
      });

      it('should mutate using passed mutationFn', () => {
        // Arrange
        const mutationProducerFn = jest.fn();
        const sig = immutableSignal({ a: 1 }, { mutationProducerFn });

        // Act
        sig.mutate(x => (x.a = 2));

        // Assert
        expect(mutationProducerFn).toHaveBeenCalled();
      });

      it('should not notify changes if using tautology custom equality function', () => {
        // Arrange
        const state = immutableSignal({} as unknown, { equal: () => true });
        let computeCount = 0;
        const derived = computed(() => `${typeof state()}:${++computeCount}`);
        expect(derived()).toEqual('object:1'); // sanity check

        // Act && Assert
        state.set(state());
        expect(derived()).toEqual('object:1');

        // Act && Assert
        state.set({});
        expect(derived()).toEqual('object:1');

        // Act && Assert
        state.update(() => ({}));
        expect(derived()).toEqual('object:1');

        // Act && Assert
        state.mutate(() => {});
        expect(derived()).toEqual('object:1');

        // Act && Assert
        state.set([]);
        expect(derived()).toEqual('object:1');

        // Act && Assert
        state.set(1);
        expect(derived()).toEqual('object:1');

        // Act && Assert
        state.set('newValue');
        expect(derived()).toEqual('object:1');
      });
    });

    describe('mutate', () => {
      beforeAll(() => {
        setGlobalImmutableSignalOptions({
          ...getDefaultImmutableSignalOptions(),
          enableDeepFreezing: deepFreezeEnabled,
        });
      });

      it('should clone an immutable writable signal value and apply mutation', () => {
        // Arrange
        const value = { a: 1, b: 2 };
        const immutableSig = immutableSignal(value);

        // Act
        immutableSig.mutate(state => {
          state.a = 42;
        });

        // Assert
        expect(immutableSig()).not.toBe(value);
        expect(immutableSig()).toStrictEqual({ a: 42, b: 2 });
      });

      it('should clone and mutate array elements', () => {
        // Arrange
        const value = { arr: [1, 2, 3] };
        const immutableSig = immutableSignal(value);

        // Act
        immutableSig.mutate(state => {
          state.arr[1] = 42;
        });

        // Assert
        expect(immutableSig()).not.toBe(value);
        expect(immutableSig()).toStrictEqual({ arr: [1, 42, 3] });
      });

      it('should handle complex mutations', () => {
        // Arrange
        const value = { a: { b: { c: 1 } } };
        const immutableSig = immutableSignal(value);
        const complexMutation = (state: any) => {
          state.a.b.c = 2;
          state.a.b.d = 3;
          state.a.e = 4;
          delete state.a.b;
        };

        // Act
        immutableSig.mutate(complexMutation);

        // Assert
        expect(immutableSig()).not.toBe(value);
        expect(immutableSig()).toStrictEqual({ a: { e: 4 } });
      });
    });
  }
);
