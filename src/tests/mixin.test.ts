import { Mixin } from "../mixin";

class Swimmable {
  swim() {
    return true;
  }
}

class Walkable {
  walk() {
    return true;
  }
}

class Flyable {
  fly() {
    return true;
  }
}

@Mixin(Swimmable, Walkable)
class Human {}
interface Human extends Swimmable, Walkable {}

@Mixin(Walkable, Flyable)
class Bird {}
interface Bird extends Walkable, Flyable {}

describe("Mixin Decorator", () => {
  test("Human example", () => {
    const human = new Human();

    expect(human.walk()).toBe(true);
    expect(human.swim()).toBe(true);
  });

  test("Bird example", () => {
    const bird = new Bird();

    expect(bird.fly()).toBe(true);
    expect(bird.walk()).toBe(true);
    expect((bird as any).swim).toBe(undefined);
  });
});
