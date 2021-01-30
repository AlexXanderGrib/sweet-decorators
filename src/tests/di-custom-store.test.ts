import { DIContainer, IStore } from "../di";

const map = new Map();
const store: IStore = {
  get: (key) => map.get(key),
  set: (key, value) => map.set(key, value),
  forEach: (callback: any) =>
    map.forEach((value, key, map) => callback(value, key, map))
};

const container = new DIContainer(store);

container.provide("test", true);

@container.Provide("X")
class X {
  @container.Inject("test")
  public isTest!: boolean;
}

describe("DI with custom store", () => {
  console.log(map);

  test("Simple Injection", () => {
    const x = container.inject<X>("X") as X;

    expect(x.isTest).toBe(true);
  });

  test("Copied store dependency === original store dependency", () => {
    const copy = container.clone();

    const x1 = container.inject<X>("X") as X;
    const x2 = copy.inject<X>("X") as X;

    expect(x1.isTest).toBe(true);
    expect(x2).toBe(x1);
  });

  test("Copied store does not affect original one", () => {
    const copy = container.clone();
    copy.provide(X, "Y");

    expect(container.inject(X)).toBeUndefined();
  });
});
