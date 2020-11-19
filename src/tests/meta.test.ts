import { Assign, readMeta } from "../meta";

const k = Symbol("KEY");

@Assign({ [k]: null })
@Assign("a", "b")
@Assign.test(true)
class Test {
  @Assign({ [k]: k })
  @Assign("b", "c")
  @Assign.isMethod(true)
  method() {}
}

const t = new Test();

describe("Meta", () => {
  test("Class Assignation", () => {
    expect(readMeta(t)).toStrictEqual({ a: "b", test: true, [k]: null });
  });

  test("Method Assignation", () => {
    expect(readMeta(t.method)).toStrictEqual({
      b: "c",
      isMethod: true,
      [k]: k
    });
  });
});
