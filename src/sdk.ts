type MethodReplacementParameters = {
  /** `this` */
  context: any;
  /** Original function */
  original: Function;
  /** Function invocation params */
  parameters: any[];
};

type MethodReplacement = (parameters: MethodReplacementParameters) => any;

type MethodDecoratorParameters = {
  target: any;
  constructor: Function;
  prototype: any;
  property: keyof any;
  descriptor: TypedPropertyDescriptor<Function>;
  /**
   *  Replaces original function with yours by calling `descriptor.value = replacement`
   *
   * @param {Function} replacement Function to replace original with extra context in params
   */
  replace: (replacement: MethodReplacement) => void;
};

/**
 * Simplifies creation of method decorators
 *
 * @param {Function} function_
 * @return {MethodDecorator}
 */
export function methodDecorator(
  function_: (parameters: MethodDecoratorParameters) => void
): MethodDecorator {
  return (target: any, property, descriptor: any) => {
    const original = descriptor.value;

    const replace = (replacement: MethodReplacement) => {
      descriptor.value = function patchedMethod(...parameters: any[]) {
        const context = this || target;
        return replacement.call(context, { parameters, original, context });
      };
    };

    function_({
      constructor: target.constructor,
      prototype: target.constructor?.prototype,
      target,
      property,
      descriptor,
      replace
    });
  };
}

/**
 * Simplifies creation of class decorators
 *
 * @param {Function} function_
 * @return {ClassDecorator}
 *
 */
export function classDecorator(
  function_: (parameters: {
    target: Function;
    prototype: any;
    name: string;
  }) => void | Function
): ClassDecorator {
  return (target) =>
    function_({ target, prototype: target.prototype, name: target.name }) as any;
}

type ParameterReplacementParameters = MethodReplacementParameters & {
  /** Parameter's value */
  value: any;
};

type ParameterReplacement = (parameters: ParameterReplacementParameters) => any;

type ParameterDecoratorParameters = {
  target: any;
  constructor: Function;
  prototype: any;
  property: keyof any;
  index: number;
  replaceMethod: (replacement: MethodReplacement) => void;
  /** Must return new value of the parameter */
  replaceValue: (replacement: ParameterReplacement) => void;
};

/**
 * @param {Function} function_
 * @return {ParameterDecorator}
 */
export function parameterDecorator(
  function_: (parameters: ParameterDecoratorParameters) => void
): ParameterDecorator {
  return (target: any, property, index) => {
    const original = target[property];
    const replaceMethod = (replacement: MethodReplacement) => {
      target[property] = function (...parameters: any[]) {
        const context = this || target;
        return replacement.call(context, { context, original, parameters });
      };
    };

    const replaceValue = (replacement: ParameterReplacement) =>
      replaceMethod(({ parameters, original, context }) => {
        parameters[index] = replacement({
          context,
          parameters,
          original,
          value: parameters[index]
        });

        return original.call(context, parameters);
      });

    function_({
      target,
      property,
      index,
      replaceMethod,
      replaceValue,
      constructor: target.constructor,
      prototype: target.constructor?.prototype
    });
  };
}
