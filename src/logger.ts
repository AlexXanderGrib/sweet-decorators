/* eslint-disable security/detect-object-injection */
export type LoggerAdapter = {
  error: (...data: any[]) => void;
  info: (...data: any[]) => void;
  message: (...data: any[]) => void;
  warn: (...data: any[]) => void;
  startTimer: (name: string) => void;
  stopTimer: (name: string) => void;
};

export const DefaultLogger: LoggerAdapter = {
  error: console.error,
  message: console.log,
  warn: console.warn,
  info: console.info,
  startTimer: console.time,
  stopTimer: console.timeEnd
};

export const EmojiLogger: LoggerAdapter = {
  error: (...data: any[]) => console.log("🛑", ...data),
  info: (...data: any[]) => console.log("ℹ️", ...data),
  message: (...data: any[]) => console.log("💬", ...data),
  warn: (...data: any[]) => console.log("⚠️", ...data),
  startTimer: (name: string) => console.time(`⏲️ ${name}`),
  stopTimer: (name: string) => console.timeEnd(`⏲️ ${name}`)
};

export type LogType = "error" | "info" | "message" | "warn";

/**
 *
 * @param {*} object
 * @return {string}
 */
function nameOf(object: any): string {
  return String(
    object.name ||
      object?.constructor?.name ||
      object?.prototype?.name ||
      object?.__proto__?.name ||
      "<Unnamed object>"
  );
}

/**
 *
 * @param {*} target
 * @param {string|number|symbol} property
 *
 * @return {string}
 */
function makeName(target: any, property: keyof any): string {
  return `${nameOf(target)}.${String(property)}`;
}

/**
 * Console Logger
 */
export class Logger {
  /**
   *
   * @param {LoggerAdapter} [adapter=DefaultLogger]
   */
  constructor(public adapter: LoggerAdapter = DefaultLogger) {}

  /**
   * Logs received value of argument when method called
   *
   * @param {LogType} [logType="info"]
   *
   * @return {ParameterDecorator}
   */
  public ReceivedValue(logType: LogType = "info"): ParameterDecorator {
    const log = this.adapter[logType];

    return (target: any, property, index) => {
      const method = target[property] as Function;
      console.log({ target, property, index, method });

      const patch = function (this: any, ...parameters: any[]) {
        // eslint-disable-next-line no-invalid-this
        const context = this || target;

        log(`${makeName(target, property)}(param#${index}): `, parameters[index]);

        return method.apply(context, parameters);
      };

      const result = Reflect.set(target, property, patch);

      console.log(result);
    };
  }

  /**
   * Logs performance of sync method
   *
   * @return {MethodDecorator}
   */
  public Perf(): MethodDecorator {
    const start = this.adapter.startTimer;
    const stop = this.adapter.stopTimer;

    return (target: any, property, descriptor) => {
      const method = (descriptor.value as any) as Function;
      const timerName = `${makeName(target, property)}() performance`;

      (descriptor as any).value = function (...parameters: any[]) {
        const context = this || target;
        start(timerName);

        const result = method.apply(context, parameters);
        stop(timerName);

        return result;
      };
    };
  }

  /**
   * Logs performance of async method
   *
   * @return {MethodDecorator}
   */
  public PerfAsync(): MethodDecorator {
    const start = this.adapter.startTimer;
    const stop = this.adapter.stopTimer;

    return (target: any, property, descriptor) => {
      const method = (descriptor.value as any) as Function;
      const timerName = `async ${makeName(target, property)}() performance`;

      (descriptor as any).value = async function (...parameters: any[]) {
        const context = this || target;
        start(timerName);

        const result = await method.apply(context, parameters);
        stop(timerName);

        return result;
      };
    };
  }

  /**
   * @param {LogType} logType
   *
   * @return {MethodDecorator}
   */
  public Calls(logType: LogType = "info"): MethodDecorator {
    const kCounter = Symbol("CALL_COUNTER");
    const log = this.adapter[logType];

    return (target: any, property, descriptor: any) => {
      const method = descriptor.value as Function;

      descriptor.value = function (...parameters: any[]) {
        const context = this || target;

        const counter = (descriptor.value[kCounter] ?? 0) + 1;
        descriptor.value[kCounter] = counter;

        log(`${makeName(target, property)}(): call #${counter}`);

        return method.apply(context, parameters);
      };
    };
  }
}
