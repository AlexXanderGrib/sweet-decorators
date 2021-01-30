/* eslint-disable @typescript-eslint/explicit-module-boundary-types */

import { DependencyDescriptor } from "./types";
import { flattenLinked } from "./utils";

type VoidFunction = () => void;
type Subscription<T> = (data: T) => void;

const SCOPE = Symbol("SCOPE");

/**
 *
 */
export class AdvancedDIContainer<Key = any, Value = any> {
  public readonly dependencies: DependencyDescriptor<Key, Value>[] = [];
  private _subscriptions: Subscription<DependencyDescriptor<Key, Value>>[] = [];

  /**
   *
   * @param {AdvancedDIContainer<Key, Value>?} parent Parent container. For this instance will be readonly
   */
  constructor(public readonly parent?: AdvancedDIContainer<Key, Value>) {}

  /**
   * `this` + all parent containers
   */
  private get _parentsList() {
    return flattenLinked(this as AdvancedDIContainer<Key, Value>);
  }

  /**
   * Searches dependency in current scope
   *
   * @param {Key} key
   * @param {boolean} [onlyCurrentScope=false] Pass `true` to disable search in parent scopes
   * @return {DependencyDescriptor<Key, Value>} Dependency descriptor
   */
  public find(
    key: Key,
    onlyCurrentScope = false
  ): DependencyDescriptor<Key, Value> | undefined {
    const local = this.dependencies.find((dependency) => dependency.key === key);

    if (local || onlyCurrentScope || !this.parent) return local;

    // Bug in unicorn eslint plugin
    // eslint-disable-next-line unicorn/no-fn-reference-in-iterator
    return this.parent.find(key);
  }

  /**
   * Method to provide dependency in container with current scope
   *
   * @param {Key} key
   * @param {Value} value
   */
  public provide(key: Key, value: Value) {
    this.provideFactory(key, () => value);
  }

  /**
   *
   * @param {Key} key
   * @param {*} factory
   */
  public provideFactory(key: Key, factory: (scope: any) => Value) {
    let descriptor = this.find(key, true);

    if (!descriptor) {
      descriptor = { key, value: factory, scope: this };
      this.dependencies.push(descriptor);
    }

    descriptor.value = factory;
    const effect = descriptor;

    this._subscriptions.forEach((subscription) => subscription(effect));
  }

  /**
   * Returns pure value of dependency
   *
   * @template {T}
   * @param {Key} key
   * @param {*} scope
   * @return {T?} Value of dependency or `undefined`
   */
  public inject<T extends Value = Value>(
    key: Key,
    scope: any = this
  ): T | undefined {
    return this.find(key)?.value(scope) as any;
  }

  /**
   * Returns pure value of dependency
   *
   * @template {T}
   * @param {Key} key
   * @param {Promise<*>?} signal
   * @return {Promise<T>} Value of dependency, when it will be provided
   */
  public injectAsync<T extends Value = Value>(
    key: Key,
    signal?: Promise<any>
  ): Promise<T> {
    const existing = this.find(key);

    if (existing) return Promise.resolve(existing.value(this) as T);

    return new Promise<T>((resolve, reject) => {
      const unsubscribe = this.subscribe((data) => {
        if (data.key === key && this._parentsList.includes(this)) {
          unsubscribe();
          resolve(data.value(this) as T);
        }
      });

      if (signal) {
        signal.catch((error) => {
          unsubscribe();
          reject(error);
        });
      }
    });
  }

  /**
   * Its a **class decorator** that creates instance of a class and provides is as a dependency in container
   *
   * ### Please do not use `constructor()` params. Because instantiation is not under your control
   *
   * @param {Key=} key
   * @return {ClassDecorator}
   */
  public ProvideClass(key?: Key): ClassDecorator {
    return (target: any) => {
      const wm = new WeakMap();

      this.provideFactory(key ?? (target as any), (scope) => {
        const stored = wm.get(scope);

        if (stored) return stored;

        const instance = new target();
        Object.defineProperty(instance, SCOPE, {
          get: () => scope
        });

        wm.set(scope, instance);
        return instance;
      });
    };
  }

  /**
   * @deprecated use `InjectGetter` instead
   *
   * @param {Key} key
   * @return {PropertyDecorator}
   */
  public Inject(key: Key): PropertyDecorator {
    return this.InjectGetter(key);
  }

  /**
   * @deprecated use `ProvideClass` instead
   *
   * @param {Key} key
   * @return {ClassDecorator}
   */
  public Provide(key: Key): ClassDecorator {
    return this.ProvideClass(key);
  }

  /**
   * Its a **property** decorator, that creates a **getter** on prototype.
   * Getter will always return a current value of a dependency.
   *
   * ### Please use a syntax provided in example
   *
   * @param {Key} key
   * @param {boolean} bind Flag to bing getter to current container. Otherwise value can be changed by child containers
   *
   * @return {PropertyDecorator}
   *
   * @example
   *
   * @Inject('SECRET_KEY') // <-- this decorator
   *
   * public key!: string; // <-- Property. Must be with "!"
   *
   */
  public InjectGetter(key: Key, bind = false): PropertyDecorator {
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const context = this;

    return function (target: any, property: string | symbol) {
      Object.defineProperty(target, property, {
        get() {
          const container: AdvancedDIContainer =
            !bind && SCOPE in this ? this[SCOPE] : context;

          return container.inject(key);
        }
      });
    } as any;
  }

  /**
   * Subscribes to any update of container
   *
   * @param {Subscription<DependencyDescriptor<Key, Value>>} subscription
   * @return {VoidFunction} Unsubscribe function
   */
  public subscribe(
    subscription: Subscription<DependencyDescriptor<Key, Value>>
  ): VoidFunction {
    this._subscriptions.push(subscription);
    const unsubscribeParent = this.parent && this.parent.subscribe(subscription);

    return () => {
      unsubscribeParent && unsubscribeParent();

      this._subscriptions = this._subscriptions.filter(
        (sub) => sub !== subscription
      );
    };
  }

  /**
   * Clones container with all of his dependencies. But dependency arrays are separate
   *
   * @return {AdvancedDIContainer<Key, Value>} Cloned instance
   */
  public clone(): AdvancedDIContainer<Key, Value> {
    const instance = new AdvancedDIContainer<Key, Value>();

    instance.dependencies.push(...this.dependencies);

    return instance;
  }
}
