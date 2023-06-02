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
  ERROR = "ERROR",
  WARNING = "WARNING",
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

  public static debug(data: any, identifier = ""): void {
    if (this.logLevel >= LOG_LEVEL.ALL) {
      console.debug(this.getLogMessage(data, identifier, LOG_TYPE.DEBUG));
    }
  }

  private static getLogMessage(data: any, identifier: string, type: LOG_TYPE): string {
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

  private static colorizeMessage(message: string, type: LOG_TYPE): string {
    let colorCode: string = COLORS.DEFAULT;
    switch (type) {
      case LOG_TYPE.ERROR:
        colorCode = COLORS.RED;
        break;
      case LOG_TYPE.WARNING:
        colorCode = COLORS.YELLOW;
        break;
      case LOG_TYPE.INFO:
        colorCode = COLORS.BLUE;
        break;
      case LOG_TYPE.DEBUG:
        colorCode = COLORS.DEFAULT;
        break;
    }
    return `${colorCode}${message}${COLORS.DEFAULT}`;
  }
}

export class Time {
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
