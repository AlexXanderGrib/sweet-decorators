export const kMeta = Symbol("META");

type Key = string | symbol | number;

function assignMeta(subject: any, key: Key | object, value?: any) {
  const object = typeof key === "object" ? key : { [key]: value };

  if (kMeta in subject && typeof subject[kMeta] === "object") {
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

function assign(key: Key | object, value?: any): ClassAndMethodDecorator {
  return function (target: any, _prop: Key, desc: PropertyDescriptor) {
    if (typeof target === "function") {
      assignMeta(target.prototype, key, value);
      return target;
    }

    assignMeta(desc.value, key, value);
  } as any;
}

export const Assign: Assign = new Proxy(assign, {
  get(target, prop) {
    if (prop in target) return target[prop as keyof typeof target];

    return (value: any) => assign(prop, value);
  }
}) as any;

export function readMeta(target: any, key?: Key): any {
  const meta = target[kMeta] ?? {};

  if (key) return meta[key];

  return meta;
}
