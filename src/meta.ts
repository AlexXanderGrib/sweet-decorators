/* eslint-disable security/detect-object-injection */
export const kMeta = Symbol("META");

type Key = string | symbol | number;

/**
 *
 *
 * @param {*} object
 * @param {Key} key
 * @return {boolean}
 */
function hasKey<T extends Key>(object: any, key: T): object is Record<T, unknown> {
  return Object.prototype.hasOwnProperty.call(object, key);
}

/**
 *
 * @param {*} subject
 * @param {Key | object} key
 * @param {*} value
 *
 */
function assignMeta(subject: any, key: Key | object, value?: any) {
  const object = typeof key === "object" ? key : { [key]: value };

  if (hasKey(subject, kMeta) && typeof subject[kMeta] === "object") {
    Object.assign(subject[kMeta], object);

    return;
  }

  subject[kMeta] = object;
}

type ClassAndMethodDecorator = ClassDecorator & MethodDecorator;

interface Assign {
  /**
   * Use this override when you need to assign **one** meta prop
   *
   * @param {Key} key
   * @param {*} value
   *
   * @returns {ClassAndMethodDecorator} Class or Method decorator
   */
  (key: Key, value: any): ClassAndMethodDecorator;

  /**
   * Use this override when you need to assign **multiple** meta props
   *
   * @param {*} object
   *
   * @returns {ClassAndMethodDecorator} Class or Method decorator
   */
  (object: Record<Key, any>): ClassAndMethodDecorator;

  /**
   * Use this override when you need to assign **one** meta prop but with **like a pro**.
   *
   * @param {*} value
   *
   * @returns {ClassAndMethodDecorator} Class or Method decorator
   */
  [key: string]: (value: any) => ClassAndMethodDecorator;
}

/**
 *
 * @param {Key | object} key
 * @param {*} value
 * @return {ClassAndMethodDecorator}
 */
function assign(key: Key | object, value?: any): ClassAndMethodDecorator {
  return ((target: any, _property: Key, desc: PropertyDescriptor) => {
    if (typeof target === "function") {
      assignMeta(target.prototype, key, value);
      return target;
    }

    assignMeta(desc.value, key, value);
  }) as any;
}

export const Assign: Assign = new Proxy(assign, {
  get(target, property) {
    if (property in target) return target[property as keyof typeof target];

    return (value: any) => assign(property, value);
  }
}) as any;

/**
 * Reads & return meta, assigned by `@Assign` decorator
 *
 * @param {*} target Class or method that contains any meta
 * @param {Key=} key Meta key
 * @return {*} Meta value or full object, if `key` argument didn't passed
 */
export function readMeta(target: object | Function, key?: Key): any {
  const meta = (target as any)[kMeta] ?? {};

  if (key) return meta[key];

  return meta;
}
