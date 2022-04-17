import { Assign, readMeta } from "../meta";

const k = Symbol("KEY");

function ComposedDecorator() {
  return Assign("meta", "SomeMeta");
}

@Assign({ [k]: undefined })
@Assign("a", "b")
@Assign.test(true)
class Test {
  @Assign({ [k]: k })
  @Assign("b", "c")
  @Assign.isMethod(true)
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  method() {}

  @ComposedDecorator()
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  x() {}
}

@Assign.isChild(true)
class TestChild extends Test {
  @Assign.isInChild(true)
  method() {
    console.log("Method in child");
  }
}

const t = new Test();
const c = new TestChild();

describe("Meta", () => {
  describe("Parent", () => {
    test("Class Assignation", () => {
      expect(readMeta(t)).toStrictEqual({ a: "b", test: true, [k]: undefined });
    });

    test("Method Assignation", () => {
      expect(readMeta(t.method)).toStrictEqual({
        b: "c",
        isMethod: true,
        [k]: k
      });
    });

    test("Composed decorator", () => {
      expect(readMeta(t.x)).toStrictEqual({
        meta: "SomeMeta"
      });
    });
  });

  describe("Child", () => {
    test("Class Assignation", () => {
      expect(readMeta(c)).toStrictEqual({
        isChild: true
      });
    });

    test("Method Assignation", () => {
      expect(readMeta(c.method)).toStrictEqual({
        isInChild: true
      });
    });

    test("Composed decorator", () => {
      expect(readMeta(c.x)).toStrictEqual({
        meta: "SomeMeta"
      });
    });
  });
});
