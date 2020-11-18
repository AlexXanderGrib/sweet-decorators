export function MapErrors(mapper: (error: Error) => Error): MethodDecorator {
  return function (_target, _prop, desc) {
    const original = (desc.value as any) as Function;

    return {
      get: function () {
        const context = this as any;

        return (...args: any[]) => {
          try {
            return original.apply(context, args);
          } catch (error) {
            throw mapper(error);
          }
        };
      }
    } as any;
  };
}

export function MapErrorsAsync(
  mapper: (error: Error) => Error | Promise<Error>
): MethodDecorator {
  return function (_target, _prop, desc) {
    const original = (desc.value as any) as Function;

    return {
      get: function () {
        const context = this as any;

        return async (...args: any[]) => {
          try {
            return await original.apply(context, args);
          } catch (error) {
            throw await mapper(error);
          }
        };
      }
    } as any;
  };
}
