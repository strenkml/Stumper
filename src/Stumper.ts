export enum TIMEZONE {
  LOCAL,
  UTC,
}

export enum LOG_LEVEL {
  ERROR,
  WARNING,
  INFO,
  ALL,
}

enum LOG_TYPE {
  CATASTROPHIC_EXCEPTION = "CATASTROPHIC_EXCEPTION",
  EXCEPTION = "EXCEPTION",
  ERROR = "ERROR",
  WARNING = "WARNING",
  SUCCESS = "SUCCESS",
  INFO = "INFO",
  DEBUG = "DEBUG",
}

interface OPTIONS {
  useColors?: boolean;
  useTimestamp?: boolean;
  timezone?: TIMEZONE;
  logLevel?: LOG_LEVEL;
}

const COLORS = {
  DEFAULT: "\x1b[0m",
  RED: "\x1b[31m",
  YELLOW: "\x1b[33m",
  BLUE: "\x1b[34m",
  GREEN: "\x1b[32m",
  PURPLE: "\x1b[35m",
};

export default class Stumper {
  // Default values
  private static defaultUseColors = true;
  private static defaultUseTimestamp = true;
  private static defaultTimezone = TIMEZONE.LOCAL;
  private static defaultLogLevel = LOG_LEVEL.ERROR;

  private static useColors: boolean = this.defaultUseColors;
  private static useTimestamp: boolean = this.defaultUseTimestamp;
  private static timezone: TIMEZONE = this.defaultTimezone;
  private static logLevel: LOG_LEVEL = this.defaultLogLevel;

  public static setConfig(options: OPTIONS = {}) {
    this.useColors = options.useColors ?? this.defaultUseColors;
    this.useTimestamp = options.useTimestamp ?? this.defaultUseTimestamp;
    this.timezone = options.timezone ?? this.defaultTimezone;
    this.logLevel = options.logLevel ?? this.defaultLogLevel;
  }

  public static getLogLevel(): LOG_LEVEL {
    return this.logLevel;
  }

  public static setLogLevel(newLogLevel: LOG_LEVEL): void {
    this.logLevel = newLogLevel;
  }

  public static error(data: any, identifier = ""): void {
    console.error(this.getLogMessage(data, identifier, LOG_TYPE.ERROR));
  }

  public static caughtError(error: any, identifier = ""): void {
    if (error instanceof Error) {
      if (error.stack) {
        console.error(this.getLogMessage(error.stack, identifier, LOG_TYPE.ERROR));
      } else {
        console.error(this.getLogMessage(`[${error.name}] ${error.message}`, identifier, LOG_TYPE.ERROR));
      }
    } else {
      console.error(this.getLogMessage(error, identifier, LOG_TYPE.ERROR));
    }
  }

  public static caughtWarning(warning: any, identifier = ""): void {
    if (warning instanceof Error) {
      if (warning.stack) {
        console.error(this.getLogMessage(warning.stack, identifier, LOG_TYPE.WARNING));
      } else {
        console.error(this.getLogMessage(`[${warning.name}] ${warning.message}`, identifier, LOG_TYPE.WARNING));
      }
    } else {
      console.error(this.getLogMessage(warning, identifier, LOG_TYPE.WARNING));
    }
  }

  public static caughtException(exception: Exception): void {
    let type = LOG_TYPE.EXCEPTION;
    if (exception.isCatastrophic) {
      type = LOG_TYPE.CATASTROPHIC_EXCEPTION;
    }
    console.error(this.getLogMessage(exception.message, exception.errorCode.toString(), type));
  }

  public static warning(data: any, identifier = ""): void {
    if (this.logLevel >= LOG_LEVEL.WARNING) {
      console.warn(this.getLogMessage(data, identifier, LOG_TYPE.WARNING));
    }
  }

  public static info(data: any, identifier = ""): void {
    if (this.logLevel >= LOG_LEVEL.INFO) {
      console.info(this.getLogMessage(data, identifier, LOG_TYPE.INFO));
    }
  }

  public static success(data: any, identifier = ""): void {
    if (this.logLevel >= LOG_LEVEL.INFO) {
      console.info(this.getLogMessage(data, identifier, LOG_TYPE.SUCCESS));
    }
  }

  public static debug(data: any, identifier = ""): void {
    if (this.logLevel >= LOG_LEVEL.ALL) {
      console.debug(this.getLogMessage(data, identifier, LOG_TYPE.DEBUG));
    }
  }

  protected static getLogMessage(data: any, identifier: string, type: LOG_TYPE): string {
    let convertedData = "";
    let message = "";

    if (typeof data === "string") {
      convertedData = data;
    } else if (typeof data === "number" || typeof data === "boolean") {
      convertedData = data.toString();
    } else {
      convertedData = JSON.stringify(data);
    }

    if (identifier != "") {
      message = `${type.toString()}(${identifier}): ${convertedData}`;
    } else {
      message = `${type.toString()}: ${convertedData}`;
    }

    if (this.useColors) {
      message = this.colorizeMessage(message, type);
    }

    if (this.useTimestamp) {
      return `${Time.getFormattedTime(this.timezone)} - ${message}`;
    }

    return message;
  }

  protected static colorizeMessage(message: string, type: LOG_TYPE): string {
    let colorCode: string = COLORS.DEFAULT;
    switch (type) {
      case LOG_TYPE.EXCEPTION:
        colorCode = COLORS.PURPLE;
        break;
      case LOG_TYPE.ERROR:
      case LOG_TYPE.CATASTROPHIC_EXCEPTION:
        colorCode = COLORS.RED;
        break;
      case LOG_TYPE.WARNING:
        colorCode = COLORS.YELLOW;
        break;
      case LOG_TYPE.INFO:
        colorCode = COLORS.BLUE;
        break;
      case LOG_TYPE.SUCCESS:
        colorCode = COLORS.GREEN;
        break;
      case LOG_TYPE.DEBUG:
        colorCode = COLORS.DEFAULT;
        break;
    }
    return `${colorCode}${message}${COLORS.DEFAULT}`;
  }
}

class Time {
  public static getFormattedTime(timezone: TIMEZONE): string {
    if (timezone == TIMEZONE.LOCAL) {
      return this.getLocalTime();
    }
    return this.getUTCTime();
  }

  private static getUTCTime(): string {
    const time = this.getCurrentTime();
    const month = time.getUTCMonth() + 1;
    const day = time.getUTCDate();
    const year = time.getUTCFullYear();

    const hour = time.getUTCHours();
    const minute = this.prefixZero(time.getUTCMinutes());
    const second = this.prefixZero(time.getUTCSeconds());
    const millisecond = time.getUTCMilliseconds();
    return `${month}/${day}/${year} ${hour}:${minute}:${second}.${millisecond}`;
  }

  private static getLocalTime(): string {
    const time = this.getCurrentTime();
    const month = time.getMonth() + 1;
    const day = time.getDate();
    const year = time.getFullYear();

    const hour = time.getHours();
    const minute = this.prefixZero(time.getMinutes());
    const second = this.prefixZero(time.getSeconds());
    const millisecond = time.getMilliseconds();
    return `${month}/${day}/${year} ${hour}:${minute}:${second}.${millisecond}`;
  }

  private static getCurrentTime(): Date {
    return new Date(Date.now());
  }

  private static prefixZero(number: number): number | string {
    if (number < 10) {
      return `0${number}`;
    }
    return number;
  }
}

export abstract class Exception extends Error {
  public readonly errorCode: number;
  public readonly isCatastrophic: boolean;

  constructor(message: string, errorCode: number, isCatastrophic: boolean = false) {
    super(message);

    this.errorCode = errorCode;
    this.isCatastrophic = isCatastrophic;
  }
}
