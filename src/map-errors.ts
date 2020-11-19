export function MapErrors(
  ...mappers: ((error: Error) => Error | undefined)[]
): MethodDecorator {
  return function (_target, _prop, desc) {
    const fn = (desc.value as any) as Function;

    (desc as any).value = function (...args: any[]) {
      try {
        return fn.apply(this, args);
      } catch (error) {
        for (const mapper of mappers) {
          const result = mapper(error);

          if (result) throw result;
        }

        throw error;
      }
    };

    return desc;
  };
}

export function MapErrorsAsync(
  ...mappers: ((
    error: Error
  ) => Error | undefined | Promise<Error | undefined>)[]
): MethodDecorator {
  return function (_target, _prop, desc) {
    const fn = (desc.value as any) as Function;

    (desc as any).value = async function (...args: any[]) {
      try {
        return await fn.apply(this, args);
      } catch (error) {
        for (const mapper of mappers) {
          const result = await mapper(error);

          if (result) throw result;
        }

        throw error;
      }
    };

    return desc;
  };
}
