import { MapErrors, MapErrorsAsync } from "../map-errors";

class MockError extends Error {}
class GoodError extends Error {}
class BadError extends Error {}
class AltError extends Error {}

const mockErrorMapper = (error: Error) =>
  error instanceof MockError ? new GoodError(error.message) : undefined;

const badErrorMapper = (error: Error) =>
  error instanceof BadError ? new AltError(error.message) : undefined;

class Test {
  public y = 3;

  private nested() {
    throw new BadError();
  }

  @MapErrors(mockErrorMapper, badErrorMapper)
  sync(expected = true) {
    if (expected) throw new MockError();

    this.nested();
  }

  @MapErrorsAsync(mockErrorMapper, badErrorMapper)
  async async(expected = true) {
    if (expected) throw new MockError();

    this.nested();
  }

  @MapErrors(mockErrorMapper)
  context() {
    if (this.y === 3) throw new MockError();

    throw new BadError();
  }

  @MapErrorsAsync(mockErrorMapper)
  async asyncContext() {
    if (this.y === 3) throw new MockError();

    throw new BadError();
  }
}

const t = new Test();

describe("Map Errors Decorator", () => {
  test("Sync", () => {
    try {
      t.sync();

      fail("Sync mock error wasn't thrown");
    } catch (error) {
      expect(error).toBeInstanceOf(GoodError);
    }

    try {
      t.sync(false);

      fail("Sync bad error wasn't thrown");
    } catch (error) {
      expect(error).toBeInstanceOf(AltError);
    }
  });

  test("Async", async () => {
    try {
      await t.async();

      fail("Async mock error wasn't thrown");
    } catch (error) {
      expect(error).toBeInstanceOf(GoodError);
    }

    try {
      await t.async(false);

      fail("Async bad error wasn't thrown");
    } catch (error) {
      expect(error).toBeInstanceOf(AltError);
    }
  });

  test("Decorator does not interrupts `this`", () => {
    try {
      t.context();
    } catch (error) {
      expect(error).toBeInstanceOf(GoodError);
    }
  });

  test("Async decorator does not interrupts `this`", async () => {
    try {
      await t.asyncContext();
    } catch (error) {
      expect(error).toBeInstanceOf(GoodError);
    }
  });
});
