import { AdvancedDIContainer } from "../advanced-di";

const container = new AdvancedDIContainer();

container.provide("test", true);

@container.ProvideClass("X")
class X {
  @container.InjectGetter("test")
  public isTest!: boolean;
}

@container.ProvideClass()
class Y {
  @container.InjectGetter("X")
  public x!: X;
}

const child = new AdvancedDIContainer(container);

child.provide("test", false);
child.ProvideClass();
class Z {
  @child.InjectGetter(Y)
  public y!: Y;
}

const copy = container.clone();

describe("Advanced DI Container", () => {
  test("Root's & Clone's dependencies hasn't equal reference", () => {
    expect(copy.dependencies !== container.dependencies).toBeTruthy();
  });

  test("Child container can provide parent's dependencies", () => {
    expect(child.inject(Y)).toBeInstanceOf(Y);
  });

  test("Root can't inject child's dependencies", () => {
    expect(container.inject(Z)).toBeUndefined();
  });

  test("Class Injection", () => {
    const y = new Y();

    expect(y.x).toBeInstanceOf(X);
  });

  test("Async Injection of Parent Dependency", async () => {
    const value = Math.random();

    setTimeout(() => container.provide("SPECIAL_NUMBER", value), 300);

    const x = await child.injectAsync<number>("SPECIAL_NUMBER");

    expect(x).toBe(value);
  });

  test("Class Injection by class ref", async () => {
    const y = await container.injectAsync<Y>(Y);

    expect(y).toBeInstanceOf(Y);
  });

  test("Child container can rewrite injects of parent", () => {
    const x1 = child.inject("X") as X;
    const x2 = child.inject("X") as X;

    expect(x1 === x2).toBeTruthy();
    expect(x1.isTest).toBe(false);
  });
});
