import { Memoize, MemoizeAsync } from "../memo";

class Test {
  @Memoize()
  notMemoSync(x: number) {
    return Math.random() * x;
  }

  @Memoize()
  memoSync(x: number) {
    return x * 5000;
  }

  @MemoizeAsync()
  async notMemoAsync(x: number) {
    return Date.now() * x;
  }

  @MemoizeAsync()
  async memoAsync(x: number) {
    return x * 8000;
  }
}

const { memoAsync, memoSync, notMemoAsync, notMemoSync } = new Test();
const sleep = (timeout: number) =>
  new Promise((resolve) => setTimeout(resolve, timeout));

describe("Memo Decorator", () => {
  const x = Math.random();

  test("Not Memorable Sync", () => {
    const date = notMemoSync(x);

    expect(notMemoSync(x)).toBe(date);
  });

  test("Memorable Sync", () => {
    expect(memoSync(x)).toBe(memoSync(x));
  });

  test("Not Memorable Async", async () => {
    const inPast = await notMemoAsync(x);

    await sleep(10);

    const now = await notMemoAsync(x);

    expect(inPast).toBe(now);
  });

  test("Memorable Async", async () => {
    expect(await memoAsync(x)).toBe(await memoAsync(x));
  });
});
