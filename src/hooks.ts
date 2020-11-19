// IDK how to test this decorators.
// Because it's impossible to create inline(or simply not global)
// class with decorators.
// Thats why im leaving this file untested

/**
 * Method decorator, that executes `callback` before the method's execution in the method's context(this)
 *
 * **Useful for** - params pre-validation
 *
 * @param {Function} callback Callback that receives all method's parameters
 * @return {MethodDecorator}
 */
export function Before(callback: (...parameters: any[]) => void): MethodDecorator {
  return function (_target, _property, descriptor) {
    const function_ = (descriptor.value as any) as Function;

    (descriptor as any).value = function (...parameters: any[]) {
      callback.apply(this, parameters);
      return function_.apply(this, parameters);
    };

    return descriptor;
  };
}

/**
 * Method decorator, that executes `callback` after the method's execution and in the same context(this).
 *
 * **Useful for** - side effects (close db connection, send logs, etc...)
 *
 * @param {Function} callback Callback that receives method's result as first argument and his parameters as rest.
 * @return {MethodDecorator}
 */
export function After(
  callback: (result: any, ...parameters: any[]) => void
): MethodDecorator {
  return function (_target, _property, descriptor) {
    const function_ = (descriptor.value as any) as Function;

    (descriptor as any).value = function (...parameters: any[]) {
      const result = function_.apply(this, parameters);
      callback.call(this, result, ...parameters);

      return result;
    };

    return descriptor;
  };
}

/**
 * Method decorator, that calls `callback` instead of the method
 *
 * **Useful for** - collecting metrics & handle errors
 *
 * @param {Function} callback Callback that receives the method as first argument and his parameters as rest.
 * @return {MethodDecorator}
 */
export function Around(
  callback: (method: Function, ...parameters: any[]) => any
): MethodDecorator {
  return function (_target, _property, descriptor) {
    const function_ = (descriptor.value as any) as Function;

    (descriptor as any).value = function (...parameters: any[]) {
      return callback.call(this, function_.bind(this), ...parameters);
    };

    return descriptor;
  };
}

/**
 * Async version of `@Before` decorator
 * @see Before
 *
 * @param {Function} callback
 * @return {MethodDecorator}
 */
export function BeforeAsync(
  callback: (...parameters: any[]) => void | Promise<void>
): MethodDecorator {
  return function (_target, _property, descriptor) {
    const function_ = (descriptor.value as any) as Function;

    (descriptor as any).value = async function (...parameters: any[]) {
      await callback.apply(this, parameters);
      return await function_.apply(this, parameters);
    };

    return descriptor;
  };
}

/**
 * Async version of `@After` decorator
 * @see After
 *
 * @param {Function} callback
 * @return {MethodDecorator}
 */
export function AfterAsync(
  callback: (result: any, ...parameters: any[]) => void | Promise<void>
): MethodDecorator {
  return function (_target, _property, desc) {
    const function_ = (desc.value as any) as Function;

    (desc as any).value = async function (...parameters: any[]) {
      const result = await function_.apply(this, parameters);
      await callback.call(this, result, ...parameters);

      return result;
    };

    return desc;
  };
}

/**
 * Async version of `@Around` decorator
 * @see Around
 *
 * @param {Function} callback
 * @return {MethodDecorator}
 */
export function AroundAsync(
  callback: (method: Function, ...parameters: any[]) => any | Promise<any>
): MethodDecorator {
  return function (_target, _property, descriptor) {
    const function_ = (descriptor.value as any) as Function;

    (descriptor as any).value = async function (...parameters: any[]) {
      return await callback.call(this, function_.bind(this), ...parameters);
    };

    return descriptor;
  };
}
