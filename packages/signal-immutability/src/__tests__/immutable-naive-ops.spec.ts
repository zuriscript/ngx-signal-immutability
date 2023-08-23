/* eslint-disable tree-shaking/no-side-effects-in-initialization */
/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  deepFreeze,
  naiveCloneAndMutate,
  naiveDeepClone,
} from '../lib/immutable-utility';

describe('naiveDeepClone', () => {
  it('should deeply clone a given state object', () => {
    // Arrange
    const initialState = { a: 1, b: { c: 2 } };

    // Act
    const clonedState = naiveDeepClone(initialState);

    // Assert
    expect(clonedState).toEqual(initialState);
    expect(clonedState).not.toBe(initialState);
  });

  it('should handle empty object', () => {
    // Arrange
    const initialState = {};

    // Act
    const clonedState = naiveDeepClone(initialState);

    // Assert
    expect(clonedState).toEqual(initialState);
    expect(clonedState).not.toBe(initialState);
  });

  it('should handle empty array', () => {
    // Arrange
    const initialState: any[] = [];

    // Act
    const clonedState = naiveDeepClone(initialState);

    // Assert
    expect(clonedState).toEqual(initialState);
    expect(clonedState).not.toBe(initialState);
  });

  it('should handle deep objects and arrays', () => {
    // Arrange
    const initialState = {
      a: [1, 2, { x: 3 }],
      b: { c: { d: [4, { y: 5 }] } },
    };

    // Act
    const clonedState = naiveDeepClone(initialState);

    // Assert
    expect(clonedState).toEqual(initialState);
    expect(clonedState).not.toBe(initialState);
  });
});

describe('naiveCloneAndMutate', () => {
  it('should apply a mutation to a cloned state', () => {
    // Arrange
    const initialState = { a: 1, b: { c: 2 } };
    const mutation = (state: any) => {
      state.a = 42;
      state.b.c = 99;
    };

    // Act
    const newState = naiveCloneAndMutate(initialState, mutation);

    // Assert
    expect(newState).not.toBe(initialState);
    expect(newState.a).toBe(42);
    expect(newState.b.c).toBe(99);
    expect(initialState.a).toBe(1);
    expect(initialState.b.c).toBe(2);
  });

  it('should not modify the original state when mutation fails', () => {
    // Arrange
    const initialState = { a: 1 };
    const mutation = () => {
      throw new Error('Mutation error');
    };

    // Act
    try {
      naiveCloneAndMutate(initialState, mutation);
    } catch (_) {
      /* empty */
    }

    // Assert
    expect(initialState.a).toEqual(1);
  });

  it('should handle empty initial state', () => {
    // Arrange
    const initialState = {};
    const mutation = (state: any) => {
      state.a = 42;
    };

    // Act
    const newState = naiveCloneAndMutate(initialState, mutation);

    // Assert
    expect(newState).toEqual({ a: 42 });
  });
});

describe('deepFreeze', () => {
  it('should freeze all properties', () => {
    const state = {
      pString: '',
      pNumber: 5,
      pBoolean: true,
      pDate: new Date(),
      pObject: {
        pString: 'Ha',
        pNumber: 10,
        pObject: {
          pString: 'In',
        },
      },
      pArray: [
        {
          pString: 'Hallo',
          pNumber: 20,
        },
      ],
    };

    deepFreeze(state);

    expect(Object.isFrozen(state.pString)).toBeTruthy();
    expect(Object.isFrozen(state.pNumber)).toBeTruthy();
    expect(Object.isFrozen(state.pBoolean)).toBeTruthy();
    expect(Object.isFrozen(state.pDate)).toBeTruthy();
    expect(Object.isFrozen(state.pObject)).toBeTruthy();
    expect(Object.isFrozen(state.pObject.pString)).toBeTruthy();
    expect(Object.isFrozen(state.pObject.pNumber)).toBeTruthy();
    expect(Object.isFrozen(state.pObject.pObject)).toBeTruthy();
    expect(Object.isFrozen(state.pObject.pObject.pString)).toBeTruthy();
    expect(Object.isFrozen(state.pArray)).toBeTruthy();
    expect(Object.isFrozen(state.pArray[0].pString)).toBeTruthy();
    expect(Object.isFrozen(state.pArray[0].pNumber)).toBeTruthy();
  });
});
