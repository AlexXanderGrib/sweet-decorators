type ProvideHandler = (key: any, value: any) => void;
type Reference<value> = { value: value };
type UnsubscribeCallback = () => void;

export interface IStore<K = any, V = any> {
  get(key: K): V | undefined;
  set(key: K, value: V): void;
  forEach(callback: (value: V, key: K, store: IStore<K, V>) => void): void;
  clone?(): IStore<K, V>;
}

/**
 * Dependency injection container
 */
export class DIContainer<Key = any, Value = any> {
  protected _provideHandlers: ProvideHandler[] = [];

  /**
   * Container constructor
   * @param {IStore} _dependencies Representation of the storage. Default - `new Map`
   */
  constructor(
    private readonly _dependencies: IStore = new Map<
      Key,
      Reference<Value | undefined>
    >()
  ) {}

  /**
   * Used to inject a permanent reference to value.
   * By default value is undefined and when the dependency will be
   * provided, value automatically changes.
   *
   * @param {string} name Dependency name
   * @return {Reference<Value | undefined>} Object that references to value
   */
  public getRef(name: Key): Reference<Value | undefined> {
    const reference = this._dependencies.get(name) || { value: undefined };
    this._dependencies.set(name, reference);

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

    this._provideHandlers.forEach((callback) => callback(name, value));
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

    return (target: any, key: string | symbol) => {
      Object.defineProperty(target, key, {
        get: () => container.inject(name)
      });
    };
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
      if (this.inject(dependency)) return resolve(this.inject<T>(dependency) as T);

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
    this._provideHandlers.push(callback);

    return () => {
      this._provideHandlers = this._provideHandlers.filter(
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

  /**
   * @return {DIContainer<Key, Value>} Copy of current container
   */
  public clone(): DIContainer<Key, Value> {
    let dependenciesClone: IStore<Key, Reference<Value | undefined>>;

    if (this._dependencies.clone) {
      dependenciesClone = this._dependencies.clone();
    } else if (this._dependencies instanceof Map) {
      dependenciesClone = new Map<Key, Reference<Value | undefined>>(
        this._dependencies
      );
    } else {
      dependenciesClone = new Map<Key, Reference<Value | undefined>>();

      this._dependencies.forEach((value, key) => dependenciesClone.set(key, value));
    }

    return new DIContainer<Key, Value>(dependenciesClone);
  }
}
