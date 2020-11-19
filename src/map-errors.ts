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
  return function (_target, _property, desc) {
    const function_ = (desc.value as any) as Function;

    (desc as any).value = function (...arguments_: any[]) {
      try {
        return function_.apply(this, arguments_);
      } catch (error) {
        for (const interceptor of interceptors) {
          const result = interceptor(error);

          if (result) throw result;
        }

        throw error;
      }
    };

    return desc;
  };
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
  return function (_target, _property, desc) {
    const function_ = (desc.value as any) as Function;

    (desc as any).value = async function (...arguments_: any[]) {
      try {
        return await function_.apply(this, arguments_);
      } catch (error) {
        for (const interceptor of interceptors) {
          const result = await interceptor(error);

          if (result) throw result;
        }

        throw error;
      }
    };

    return desc;
  };
}
