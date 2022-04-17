import { Around, AroundAsync } from "./hooks";

export interface IMemoStorage {
  set(parameters: unknown[], result: unknown, method: Function): void;
  get(parameters: unknown[], method: Function): any;
  has(parameters: unknown[], method: Function): boolean;
}

type MaybePromise<T> = T | Promise<T>;

export interface IAsyncMemoStorage {
  set(parameters: unknown[], result: unknown, method: Function): MaybePromise<void>;
  get(parameters: unknown[], method: Function): MaybePromise<any>;
  has(parameters: unknown[], method: Function): MaybePromise<boolean>;
}

/**
 * Abstract storage
 */
abstract class OpenMemoStorage implements IMemoStorage {
  public readonly storage = new Map<string, any>();

  protected abstract _serializeParameters(parameters: unknown[]): string;

  /**
   *
   * @param {*[]} parameters
   * @param {*} result
   */
  set(parameters: unknown[], result: unknown): void {
    this.storage.set(this._serializeParameters(parameters), result);
  }

  /**
   *
   * @param {*[]} parameters
   * @return {*}
   */
  get(parameters: unknown[]): any {
    return this.storage.get(this._serializeParameters(parameters));
  }
  /**
   * @param {*[]} parameters
   * @return {boolean}
   */
  has(parameters: unknown[]): boolean {
    return this.storage.has(this._serializeParameters(parameters));
  }
}

/**
 * This class is default storage, that `instantiates for every method separately`
 *
 * It also **`caches result by only first parameter`** and is good to use on simple functions.
 * For more complex ones, please write your own
 *
 * @deprecated Use {@link JsonMemoStorage} or code your custom storeage
 */
export class DefaultMemoStorage extends OpenMemoStorage {
  /**
   *
   * @param {any[]} parameters
   * @return {any}
   */
  protected _serializeParameters(parameters: unknown[]): any {
    return parameters[0];
  }
}

/**
 * This class is json storage, that `instantiates for every method separately`
 *
 * It serializes all parameters as JSON array and stores as string. No sorting or filtering is applied
 */
export class JsonMemoStorage extends OpenMemoStorage {
  /**
   * @param  {any[]} parameters
   * @return {string}
   */
  protected _serializeParameters(parameters: unknown[]): string {
    return JSON.stringify(parameters);
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
  storage: IMemoStorage = new JsonMemoStorage()
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
  storage: IMemoStorage | IAsyncMemoStorage = new JsonMemoStorage()
): MethodDecorator {
  return AroundAsync(async (method, ...parameters) => {
    if (await storage.has(parameters, method)) {
      return await storage.get(parameters, method);
    }

    const result = await method(...parameters);

    await storage.set(parameters, result, method);
    return result;
  });
}
