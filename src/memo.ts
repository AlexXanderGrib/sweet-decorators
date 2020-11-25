import { Around, AroundAsync } from "./hooks";

export interface IMemoStorage {
  set(parameters: any[], result: any, method: Function): void;
  get(parameters: any[], method: Function): any;
  has(parameters: any[], method: Function): boolean;
}
/**
 * This class is default storage, that `instantiates for every method separately`
 *
 * It also **`caches result by only first parameter`** and is good to use on simple functions.
 * For more complex ones, please write your own
 */
export class DefaultMemoStorage implements IMemoStorage {
  public readonly storage = new Map<any, any>();

  /**
   *
   * @param {*[]} parameters
   * @param {*} result
   */
  set(parameters: any[], result: unknown): void {
    this.storage.set(parameters[0], result);
  }

  /**
   *
   * @param {*[]} parameters
   * @return {*}
   */
  get(parameters: any[]): any {
    return this.storage.get(parameters[0]);
  }
  /**
   * @param {*[]} parameters
   * @return {boolean}
   */
  has(parameters: any[]): boolean {
    return this.storage.has(parameters[0]);
  }
}

/**
 * This decorator makes method remember his previously returned results.
 *
 * ### By default it uses store that `remembers result only by 1st param`
 * if you want to change this behavior, please write your own store, by
 * implementing interface `IMemoStorage`.
 *
 * @see IMemoStorage
 *
 * @param {IMemoStorage} storage
 *
 * @return {MethodDecorator}
 */
export function Memoize(
  storage: IMemoStorage = new DefaultMemoStorage()
): MethodDecorator {
  return Around((method, ...parameters) => {
    if (storage.has(parameters, method)) {
      return storage.get(parameters, method);
    }

    const result = method(...parameters);

    storage.set(parameters, result, method);
    return result;
  });
}

/**
 * This decorator makes async method remember his previously returned results.
 *
 * ### By default it uses store that `remembers result only by 1st param`
 * if you want to change this behavior, please write your own store, by
 * implementing interface `IMemoStorage`.
 *
 * @see IMemoStorage
 *
 * @param {IMemoStorage} storage
 *
 * @return {MethodDecorator}
 */
export function MemoizeAsync(
  storage: IMemoStorage = new DefaultMemoStorage()
): MethodDecorator {
  return AroundAsync(async (method, ...parameters) => {
    if (storage.has(parameters, method)) {
      return storage.get(parameters, method);
    }

    const result = await method(...parameters);

    storage.set(parameters, result, method);
    return result;
  });
}
