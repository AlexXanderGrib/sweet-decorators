/**
 * Put methods & static props of `classes` to current class. (that this decorator applies to)
 *
 * @param {...Function} classes Classes list to apply
 * @return {ClassDecorator}
 */
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
