import { methodDecorator } from "./sdk";

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
  return methodDecorator((context) => {
    context.replace(({ context, original, parameters }) => {
      callback.apply(context, parameters);
      return original.apply(context, parameters);
    });
  });
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
  return methodDecorator((context) => {
    context.replace(({ context, original, parameters }) => {
      const result = original.apply(context, parameters);
      callback.call(context, result, ...parameters);

      return result;
    });
  });
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
  return methodDecorator((context) => {
    context.replace(({ context, original, parameters }) => {
      return callback.call(context, original.bind(context), ...parameters);
    });
  });
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
  return methodDecorator((context) => {
    context.replace(async ({ context, original, parameters }) => {
      await callback.apply(context, parameters);
      return await original.apply(context, parameters);
    });
  });
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
  return methodDecorator((context) => {
    context.replace(async ({ context, original, parameters }) => {
      const result = await original.apply(context, parameters);
      await callback.call(context, result, ...parameters);

      return result;
    });
  });
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
  return methodDecorator((context) => {
    context.replace(async ({ context, original, parameters }) => {
      return await callback.call(context, original.bind(context), ...parameters);
    });
  });
}
