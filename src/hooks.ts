// IDK how to test this decorators.
// Because it's impossible to create inline(or simply not global)
// class with decorators.
// Thats why im leaving this file untested

/**
 *
 * @param callback Callback that receives all function params. **It will be called before function execution in the same context**
 */
export function Before(callback: (...args: any[]) => void): MethodDecorator {
  return function (_target, _prop, desc) {
    const fn = (desc.value as any) as Function;

    (desc as any).value = function (...args: any[]) {
      callback.apply(this, args);
      return fn.apply(this, args);
    };

    return desc;
  };
}

/**
 *
 * @param callback Callback that receives function's result as first argument and her params as rest. **It will be called after function execution in the same context**
 */
export function After(
  callback: (result: any, ...args: any[]) => void
): MethodDecorator {
  return function (_target, _prop, desc) {
    const fn = (desc.value as any) as Function;

    (desc as any).value = function (...args: any[]) {
      const result = fn.apply(this, args);
      callback.call(this, result, ...args);

      return result;
    };

    return desc;
  };
}

/**
 *
 * @param callback Callback that receives the function as first param and her arguments as rest. **It will be called instead of the function in same context. It must return a result**
 */
export function Around(
  callback: (fn: Function, ...args: any[]) => any
): MethodDecorator {
  return function (_target, _prop, desc) {
    const fn = (desc.value as any) as Function;

    (desc as any).value = function (...args: any[]) {
      return callback.call(this, fn.bind(this), ...args);
    };

    return desc;
  };
}

/**
 * Async version of `@Before` decorator
 * @see Before
 *
 * @param callback
 */
export function BeforeAsync(
  callback: (...args: any[]) => void | Promise<void>
): MethodDecorator {
  return function (_target, _prop, desc) {
    const fn = (desc.value as any) as Function;

    (desc as any).value = async function (...args: any[]) {
      await callback.apply(this, args);
      return await fn.apply(this, args);
    };

    return desc;
  };
}

/**
 * Async version of `@After` decorator
 * @see After
 *
 * @param callback
 */
export function AfterAsync(
  callback: (result: any, ...args: any[]) => void | Promise<void>
): MethodDecorator {
  return function (_target, _prop, desc) {
    const fn = (desc.value as any) as Function;

    (desc as any).value = async function (...args: any[]) {
      const result = await fn.apply(this, args);
      await callback.call(this, result, ...args);

      return result;
    };

    return desc;
  };
}

/**
 * Async version of `@Around` decorator
 * @see Around
 *
 * @param callback
 */
export function AroundAsync(
  callback: (fn: Function, ...args: any[]) => any | Promise<any>
): MethodDecorator {
  return function (_target, _prop, desc) {
    const fn = (desc.value as any) as Function;

    (desc as any).value = async function (...args: any[]) {
      return await callback.call(this, fn.bind(this), ...args);
    };

    return desc;
  };
}
