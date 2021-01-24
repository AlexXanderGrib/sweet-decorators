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
  return function (target, _property, descriptor) {
    const method = (descriptor.value as any) as Function;

    (descriptor as any).value = function (...parameters: any[]) {
      const context = this || target;

      callback.apply(context, parameters);
      return method.apply(context, parameters);
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
  return function (target, _property, descriptor) {
    const method = (descriptor.value as any) as Function;

    (descriptor as any).value = function (...parameters: any[]) {
      const context = this || target;

      const result = method.apply(context, parameters);
      callback.call(context, result, ...parameters);

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
  return function (this: any, target, _property, descriptor) {
    const method = (descriptor.value as any) as Function;
    (descriptor as any).value = function (...parameters: any[]) {
      const context = this || target;

      return callback.call(context, method.bind(context), ...parameters);
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
  return function (target, _property, descriptor) {
    const method = (descriptor.value as any) as Function;

    (descriptor as any).value = async function (...parameters: any[]) {
      const context = this || target;
      await callback.apply(context, parameters);
      return await method.apply(context, parameters);
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
  return function (target, _property, desc) {
    const method = (desc.value as any) as Function;

    (desc as any).value = async function (...parameters: any[]) {
      const context = this || target;
      const result = await method.apply(context, parameters);
      await callback.call(context, result, ...parameters);

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
  return function (target, _property, descriptor) {
    const method = (descriptor.value as any) as Function;

    (descriptor as any).value = async function (...parameters: any[]) {
      const context = this || target;
      return await callback.call(context, method.bind(context), ...parameters);
    };

    return descriptor;
  };
}
