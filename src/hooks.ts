// IDK how to test this decorators.
// Because it's impossible to create inline(or simply not global)
// class with decorators.
// Thats why im leaving this file untested

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
