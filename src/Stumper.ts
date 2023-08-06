import * as Rotator from "file-stream-rotator";
import FileStreamRotator from "file-stream-rotator/lib/FileStreamRotator";
import { FileStreamRotatorOptions } from "file-stream-rotator/lib/types";

/**
 * The timezone that the times in the log will be in.
 */
export enum TIMEZONE {
  LOCAL,
  UTC,
}

/**
 * The different levels that the log can be set to.
 */
export enum LOG_LEVEL {
  ERROR,
  WARNING,
  INFO,
  ALL,
}

/**
 * Where the logs will be output to.
 */
export enum OUTPUT_TYPE {
  CONSOLE,
  FILE,
  BOTH,
}

enum LOG_TYPE {
  ERROR = "ERROR",
  WARNING = "WARNING",
  INFO = "INFO",
  DEBUG = "DEBUG",
}

/**
 * Options for Stumper
 */
export interface OPTIONS {
  /**
   * @defaultValue `true`
   */
  useColors?: boolean;
  /**
   * @defaultValue `true`
   */
  useTimestamp?: boolean;
  /**
   * @defaultValue `TIMEZONE.LOCAL`
   */
  timezone?: TIMEZONE;
  /**
   * @defaultValue `LOG_LEVEL.ERROR`
   */
  logLevel?: LOG_LEVEL;
  /**
   * @defaultValue `OUTPUT_TYPE.CONSOLE`
   */
  outputType?: OUTPUT_TYPE;
  /**
   * @defaultValue `{
   * filename: "./logs/app-%DATE%.log",
   * max_logs: "7",
   * frequency: "daily",
   * verbose: false
   * }`
   *
   * @see [file-stream-rotator Options Docs](https://www.npmjs.com/package/file-stream-rotator#Options)
   */
  fileOptions?: FileStreamRotatorOptions;
}

const COLORS = {
  DEFAULT: "\x1b[0m",
  RED: "\x1b[31m",
  YELLOW: "\x1b[33m",
  BLUE: "\x1b[34m",
};

export default class Stumper {
  // Default values
  /**
   * @ignore
   */
  private static defaultUseColors = true;
  /**
   * @ignore
   */
  private static defaultUseTimestamp = true;
  /**
   * @ignore
   */
  private static defaultTimezone = TIMEZONE.LOCAL;
  /**
   * @ignore
   */
  private static defaultLogLevel = LOG_LEVEL.ERROR;
  /**
   * @ignore
   */
  private static defaultOutputType = OUTPUT_TYPE.CONSOLE;
  /**
   * @ignore
   */
  private static defaultFileOptions: FileStreamRotatorOptions = {
    filename: "./logs/app-%DATE%.log",
    max_logs: "7",
    frequency: "daily",
    verbose: false,
  };

  private static useColors: boolean = this.defaultUseColors;
  private static useTimestamp: boolean = this.defaultUseTimestamp;
  private static timezone: TIMEZONE = this.defaultTimezone;
  private static logLevel: LOG_LEVEL = this.defaultLogLevel;
  private static outputType: OUTPUT_TYPE = this.defaultOutputType;
  private static fileOptions: FileStreamRotatorOptions = this.defaultFileOptions;

  /**
   * @ignore
   */
  private static fileStreamRotator: FileStreamRotator;

  /* -------------------------------------------------------------------------- */
  /*                                   CONFIG                                   */
  /* -------------------------------------------------------------------------- */
  /**
   * @ignore
   */
  private constructor() {}

  /**
   * Sets the config for Stumper. This only need to be done once.
   *
   * @category Config
   *
   * @param options The options that will override the defaults.
   *
   * @see {@link OPTIONS} for defaults
   */
  public static setConfig(options: OPTIONS = {}) {
    this.useColors = options.useColors ?? this.defaultUseColors;
    this.useTimestamp = options.useTimestamp ?? this.defaultUseTimestamp;
    this.timezone = options.timezone ?? this.defaultTimezone;
    this.logLevel = options.logLevel ?? this.defaultLogLevel;
    this.outputType = options.outputType ?? this.defaultOutputType;
    this.fileOptions = options.fileOptions ?? this.defaultFileOptions;

    this.fileStreamRotator = Rotator.getStream(this.fileOptions);
  }

  /**
   * Gets the currently configured {@link logLevel}.
   *
   * @category Config
   *
   * @returns The current {@link logLevel}.
   */
  public static getLogLevel(): LOG_LEVEL {
    return this.logLevel;
  }

  /**
   * Sets the configured {@link logLevel}.
   *
   * @category Config
   *
   * @param newLogLevel The new {@link logLevel}.
   */
  public static setLogLevel(newLogLevel: LOG_LEVEL): void {
    this.logLevel = newLogLevel;
  }

  /**
   * Gets the currently configured {@link outputType}.
   *
   * @category Config
   *
   * @returns The current {@link outputType}.
   */
  public static getOutputType(): OUTPUT_TYPE {
    return this.outputType;
  }

  /**
   * Sets the configured {@link outputType}.
   *
   * @category Config
   *
   * @param newOutputType The new {@link outputType}.
   */
  public static setOutputType(newOutputType: OUTPUT_TYPE): void {
    this.outputType = newOutputType;
  }

  /**
   * Sets the configured {@link fileOptions}.
   *
   * @category Config
   *
   * @see [file-stream-rotator Options Docs](https://www.npmjs.com/package/file-stream-rotator#Options)
   *
   * @param newFileOptions The new file options.
   */
  public static setFileOptions(newFileOptions: FileStreamRotatorOptions): void {
    this.fileOptions = newFileOptions;
    this.fileStreamRotator = Rotator.getStream(this.fileOptions);
  }

  /* -------------------------------------------------------------------------- */
  /*                                FILE CONTROL                                */
  /* -------------------------------------------------------------------------- */
  /**
   * Forces the log file to be rotated.
   *
   * @category File Control
   *
   * @throws `FileOutputNotEnabled` if {@link OUTPUT_TYPE} is CONSOLE
   */
  public static forceFileRotate(): void {
    if (this.outputType == OUTPUT_TYPE.CONSOLE) {
      throw new FileOutputNotEnabledException();
    }

    this.fileStreamRotator.rotate(true);
  }

  /**
   * @ignore
   */
  private static writeToLog(message: string): void {
    if (this.outputType == OUTPUT_TYPE.CONSOLE) {
      throw new FileOutputNotEnabledException();
    }

    this.fileStreamRotator.write(message);
  }

  /* -------------------------------------------------------------------------- */
  /*                               LOGGING METHODS                              */
  /* -------------------------------------------------------------------------- */
  /**
   * Logs an error message. This will send no matter what the {@link logLevel} is set to.
   *
   * @category Logging
   *
   * @param data The log message to be sent. Objects and arrays will be stringified.
   * @param identifier Can be used to identify where in the code a log statement is coming from. For example the identifier could be set to the method name.
   */
  public static error(data: any, identifier = ""): void {
    this.outputToLocation(data, identifier, LOG_TYPE.ERROR);
  }

  /**
   * Logs a warning message. Only sends if the {@link logLevel} is atleast {@link LOG_LEVEL.WARNING}`.
   *
   * @category Logging
   *
   * @param data The log message to be sent. Objects and arrays will be stringified.
   * @param identifier Can be used to identify where in the code a log statement is coming from. For example the identifier could be set to the method name.
   */
  public static warning(data: any, identifier = ""): void {
    if (this.logLevel >= LOG_LEVEL.WARNING) {
      this.outputToLocation(data, identifier, LOG_TYPE.WARNING);
    }
  }

  /**
   * Logs an info message. Only sends if the {@link logLevel} is atleast {@link LOG_LEVEL.INFO}.
   *
   * @category Logging
   *
   * @param data The log message to be sent. Objects and arrays will be stringified.
   * @param identifier Can be used to identify where in the code a log statement is coming from. For example the identifier could be set to the method name.
   */
  public static info(data: any, identifier = ""): void {
    if (this.logLevel >= LOG_LEVEL.INFO) {
      this.outputToLocation(data, identifier, LOG_TYPE.INFO);
    }
  }

  /**
   * Logs a debug message. Only sends if the {@link logLevel} is {@link LOG_LEVEL.ALL}.
   *
   * @category Logging
   *
   * @param data The log message to be sent. Objects and arrays will be stringified.
   * @param identifier Can be used to identify where in the code a log statement is coming from. For example the identifier could be set to the method name.
   */
  public static debug(data: any, identifier = ""): void {
    if (this.logLevel >= LOG_LEVEL.ALL) {
      this.outputToLocation(data, identifier, LOG_TYPE.DEBUG);
    }
  }

  /* -------------------------------------------------------------------------- */
  /*                                   HELPERS                                  */
  /* -------------------------------------------------------------------------- */
  /**
   * @ignore
   */
  private static outputToLocation(data: any, identifier: string, logType: LOG_TYPE): void {
    let consoleFunction: (message?: any, ...optionalParams: any[]) => void;
    switch (logType) {
      case LOG_TYPE.ERROR:
        consoleFunction = console.error;
        break;
      case LOG_TYPE.WARNING:
        consoleFunction = console.warn;
        break;
      case LOG_TYPE.INFO:
        consoleFunction = console.info;
        break;
      case LOG_TYPE.DEBUG:
        consoleFunction = console.debug;
        break;
      default:
        consoleFunction = console.log;
    }

    const outputMessage = this.getLogMessage(data, identifier, logType);

    if (this.outputType == OUTPUT_TYPE.CONSOLE || this.outputType == OUTPUT_TYPE.BOTH) {
      consoleFunction(outputMessage);
    }

    if (this.outputType == OUTPUT_TYPE.FILE || this.outputType == OUTPUT_TYPE.BOTH) {
      this.writeToLog(outputMessage);
    }
  }

  /**
   * @ignore
   */
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

  /**
   * @ignore
   */
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

/* -------------------------------------------------------------------------- */
/*                                 TIME CLASS                                 */
/* -------------------------------------------------------------------------- */
/**
 * @ignore
 */
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

/* -------------------------------------------------------------------------- */
/*                                 EXCEPTIONS                                 */
/* -------------------------------------------------------------------------- */
class Exception {
  constructor(protected name: string, protected message: string) {}
}

class FileOutputNotEnabledException extends Exception {
  constructor() {
    super("FileOutputNotEnabledException", "outputType must be set to FILE or BOTH");
  }
}
