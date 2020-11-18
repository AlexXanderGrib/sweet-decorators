export function Mixin(...classes: Function[]): ClassDecorator {
  return function (target) {
    classes.forEach((constructor) => {
      Object.getOwnPropertyNames(constructor.prototype).forEach((name) => {
        Object.defineProperty(
          target.prototype,
          name,
          Object.getOwnPropertyDescriptor(constructor.prototype, name) as any
        );
      });
    });

    return target;
  };
}
