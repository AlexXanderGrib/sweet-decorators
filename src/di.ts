type ProvideHandler = (key: any, value: any) => void;
type Reference<value> = { value: value };
type UnsubscribeCallback = () => void;

/**
 * Dependency injection container
 */
export class DIContainer<Key = any, Value = any> {
  public readonly deps = new Map<Key, Reference<Value | undefined>>();
  private provideHandlers: ProvideHandler[] = [];

  /**
   * Used to inject a permanent reference to value.
   * By default value is undefined and when the dependency will be
   * provided, value automatically changes.
   *
   * @param {string} name Dependency name
   * @return {Reference<Value | undefined>} Object that references to value
   */
  public getRef(name: Key): Reference<Value | undefined> {
    const reference = this.deps.get(name) || { value: undefined };
    this.deps.set(name, reference);

    return reference;
  }

  /**
   * Provides a dependency
   *
   * @param {Key} name
   * @param {Value} value
   */
  public provide(name: Key, value: Value): void {
    const reference = this.getRef(name);

    reference.value = value;

    this.provideHandlers.forEach((callback) => callback(name, value));
  }

  /**
   * Returns a value of dependency. May return `undefined`, if value
   * was not yet provided. It's not a reference. To get ref use
   * `getRef` method.
   *
   * @param {Key} name
   * @return {Value | undefined} value
   */
  public inject<T extends Value = Value>(name: Key): T | undefined {
    return this.getRef(name).value as T;
  }

  /**
   * Its a **property** decorator, that creates a **getter** on prototype.
   * Getter will always return a current value of a dependency.
   *
   * ### Please use a syntax provided in example
   *
   * @param {Key} name
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
  public Inject(name: Key): PropertyDecorator {
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const container = this;

    return function (target: any, key: string | symbol) {
      const proto = Object.getPrototypeOf(target);

      Object.defineProperty(proto, key, {
        get: () => container.inject(name)
      });
    } as any;
  }

  /**
   * Its a **class decorator** that creates instance of a class and provides is as a dependency in container
   *
   * ### Please do not use `constructor()` params. Because instantiation is not under your control
   *
   * @param {Key} name
   * @return {ClassDecorator}
   */
  public Provide(name: Key): ClassDecorator {
    return (target) => {
      const instance = this._instantiate(target);

      this.provide(name, instance);
    };
  }

  /**
   * Returns a `promise`, that always resolves as a dependency when it
   * will be provided.
   *
   * ### If dependency will not be provided with the key, promise will be hanged
   *
   * @param {Key} dependency
   * @return {Promise<*>}
   */
  public injectAsync<T extends Value = Value>(dependency: Key): Promise<T> {
    return new Promise<T>((resolve) => {
      if (this.deps.has(dependency)) return resolve(this.inject<T>(dependency) as T);

      const unsubscribe = this.subscribe((key, value) => {
        if (key === dependency) {
          unsubscribe();
          resolve(value);
        }
      });
    });
  }

  /**
   * Registers a callback to `provide` method and `@Provide` decorator.
   * Calls **every time** when someone something provides inside current container.
   *
   * @param {ProvideHandler} callback
   * @return {UnsubscribeCallback} Unsubscribe function
   */
  public subscribe(callback: ProvideHandler): UnsubscribeCallback {
    this.provideHandlers.push(callback);

    return () => {
      this.provideHandlers = this.provideHandlers.filter(
        (function_) => function_ !== callback
      );
    };
  }

  /**
   *
   * @param {*} target
   * @return {*}
   */
  private _instantiate(target: any): any {
    return new target();
  }
}
