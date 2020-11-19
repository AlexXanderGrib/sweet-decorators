export function MapErrors(mapper: (error: Error) => Error): MethodDecorator {
  return function (_target, _prop, desc) {
    const fn = (desc.value as any) as Function;

    (desc as any).value = function (...args: any[]) {
      try {
        return fn.apply(this, args);
      } catch (error) {
        throw mapper(error);
      }
    };

    return desc;
  };
}

export function MapErrorsAsync(
  mapper: (error: Error) => Error | Promise<Error>
): MethodDecorator {
  return function (_target, _prop, desc) {
    const fn = (desc.value as any) as Function;

    (desc as any).value = async function (...args: any[]) {
      try {
        return await fn.apply(this, args);
      } catch (error) {
        throw await mapper(error);
      }
    };

    return desc;
  };
}
