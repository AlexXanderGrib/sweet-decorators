type ProvideHandler = (key: any, value: any) => void;

export class DIContainer<
  Key extends string | symbol = string | symbol,
  Value extends any = any
> {
  public readonly deps = new Map<Key, { value: Value | undefined }>();
  private provideHandlers: ProvideHandler[] = [];

  /**
   * Used to inject a permanent reference to value.
   * By default value is undefined and when the dependency will be
   * provided, value automatically changes.
   *
   * @param name Dependency name
   * @returns {{ value: Value | undefined }} Object that references to value
   */
  public getRef(name: Key): { value: Value | undefined } {
    const ref = this.deps.get(name) || { value: undefined };
    this.deps.set(name, ref);

    return ref;
  }

  /**
   * Provides a dependency
   *
   * @param {Key} name
   * @param {Value} value
   */
  public provide(name: Key, value: Value) {
    const ref = this.getRef(name);

    ref.value = value;

    this.provideHandlers.forEach((cb) => cb(name, value));
  }

  /**
   * Returns a value of dependency. May return `undefined`, if value
   * was not yet provided. It's not a reference. To get ref use
   * `getRef` method.
   *
   * @param {Key} name
   * @returns {Value | undefined} value
   */
  public inject(name: Key): Value | undefined {
    return this.getRef(name).value;
  }

  /**
   * Its a **property** decorator, that creates a **getter** on prototype.
   * Getter will always return a current value of a dependency.
   *
   * ### Please use a syntax provided in example
   *
   * @param {Key} name
   *
   * @example
   *
   * @Inject('SECRET_KEY') // <-- this decorator
   *
   * public key!: string; // <-- Property. Must be with "!"
   *
   */
  public Inject(name: Key): PropertyDecorator {
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
   * @param name
   */
  public Provide(name: Key): ClassDecorator {
    return (target) => {
      const instance = this.instantiate(target);

      this.provide(name, instance);
    };
  }

  /**
   * Returns a `promise`, that always resolves as a dependency when it
   * will be provided.
   *
   * ### If dependency will not be provided with the key, promise will be hanged
   *
   * @param dependency
   */
  public injectAsync<T extends Value = Value>(dependency: Key): Promise<T> {
    return new Promise<any>((resolve) => {
      if (this.deps.has(dependency)) return resolve(this.inject(dependency));

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
   * @param {ProvideHandler} cb
   * @returns {() => void} Unsubscribe function
   */
  public subscribe(cb: ProvideHandler): () => void {
    this.provideHandlers.push(cb);

    return () => {
      this.provideHandlers = this.provideHandlers.filter((fn) => fn !== cb);
    };
  }

  private instantiate(target: any): any {
    return new target();
  }
}
