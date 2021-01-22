import { EmojiLogger, Logger } from "../logger";

const logger = new Logger(EmojiLogger);

class Test {
  prop = 42;

  /**
   *
   * @param {number} firstArgument
   * @param {any[]} rest
   */
  @logger.Calls()
  @logger.Perf()
  x(@logger.ReceivedValue() firstArgument: number, ...rest: any[]) {
    void firstArgument, rest;

    console.log(this.prop);
  }
}

describe("Logger", () => {
  const t = new Test();

  test("", () => {
    t.x(10);
  });
});
