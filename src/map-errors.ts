import { Around, AroundAsync } from "./hooks";

/**
 * Method decorator that applies mappers to change & intercept method's errors
 *
 * **Interceptor must return an `undefined`, if he didn't handled an error, else returned value will be thrown**
 *
 * @param {...Function} interceptors Error handlers
 * @return  {MethodDecorator}
 */
export function MapErrors(
  ...interceptors: ((error: Error) => Error | undefined)[]
): MethodDecorator {
  return Around((method, ...parameters) => {
    try {
      return method(...parameters);
    } catch (error) {
      for (const interceptor of interceptors) {
        const result = interceptor(error);

        if (result) throw result;
      }

      throw error;
    }
  });
}

/**
 * Async alternative for `@MapErrors` decorator.
 *
 * @see MapErrors
 *
 * @param {...Function} interceptors
 * @return {MethodDecorator}
 */
export function MapErrorsAsync(
  ...interceptors: ((
    error: Error
  ) => Error | undefined | Promise<Error | undefined>)[]
): MethodDecorator {
  return AroundAsync(async (method, ...parameters) => {
    try {
      return await method(...parameters);
    } catch (error) {
      for (const interceptor of interceptors) {
        const result = await interceptor(error);

        if (result) throw result;
      }

      throw error;
    }
  });
}
