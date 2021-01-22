import { DIContainer } from "../di";

const container = new DIContainer();

container.provide("test", true);

@container.Provide("X")
class X {
  @container.Inject("test")
  public isTest!: boolean;
}
@container.Provide(Y)
class Y {
  @container.Inject("X")
  public x!: X;
}

describe("DI", () => {
  test("Simple Injection", () => {
    const x = container.inject<X>("X") as X;

    expect(x.isTest).toBe(true);
  });

  test("Class Injection", () => {
    const y = new Y();

    expect(y.x).toBeInstanceOf(X);
  });

  test("Async Injection", async () => {
    const value = Math.random();

    setTimeout(() => container.provide("SPECIAL_NUMBER", value), 300);

    const x = await container.injectAsync<number>("SPECIAL_NUMBER");

    expect(x).toBe(value);
  });

  test("Class Injection by class ref", async () => {
    const y = await container.injectAsync<Y>(Y);

    expect(y).toBeInstanceOf(Y);
  });
});
