import { BaseHandler } from './base-handler';
import { LogLevel } from './levels';
import type { LogRecord } from './log-record';
import type { ConsoleHandlerOptions, LevelName } from './types';

export class ConsoleHandler extends BaseHandler {
  readonly useColors?: boolean;

  constructor(levelName: LevelName, options: ConsoleHandlerOptions = {}) {
    super(levelName, options);
    this.useColors = options.useColors ?? true;
  }

  override log(message: string, level: LogLevel): void {
    process[this.getWriteStreamType(level)].write(message + '\n');
  }

  override format(logRecord: LogRecord): string {
    if (this.formatter instanceof Function) {
      return this.formatter(logRecord);
    }

    return this.formatter.replace(/{([^\s}]+)}/g, (match, p1): string => {
      let value = logRecord[p1 as keyof LogRecord];

      // do not interpolate missing values
      if (value == null) {
        return match;
      }

      if (p1 === 'levelName') {
        value = this.formatLevelName(value as string, logRecord.level);
      } else if (p1 === 'loggerName') {
        value = this.formatLoggerName(value as string, 32);
      } else if (p1 === 'datetime') {
        value = this.formatTimestamp(value as Date);
      } else if (p1 === 'pid') {
        value = this.formatPid(value as number);
      }

      return String(value);
    });
  }

  protected formatPid(pid: number) {
    return this.useColors ? `\x1B[2m(${pid})\x1B[22m` : `(${pid})`;
  }

  protected formatTimestamp(value: Date) {
    const timestamp = `[${new Date(value).toISOString()}]`;

    if (this.useColors) {
      return `\x1B[2m${timestamp}\x1B[22m`;
    }

    return timestamp;
  }

  protected formatLevelName(value: string, logLevel: LogLevel) {
    value = value.padStart(5, ' ');

    if (this.useColors) {
      return this.colorize(value, logLevel);
    }

    return value;
  }

  protected formatLoggerName(loggerName: string, maxLength: number) {
    if (loggerName.length > maxLength) {
      loggerName = loggerName.slice(1 - maxLength).padStart(maxLength, '~');
    }

    return `${this.useColors ? `\x1B[36m${loggerName}\x1B[39m` : loggerName}:`;
  }

  protected colorize(value: string, level: LogLevel) {
    switch (level) {
      case LogLevel.ERROR:
        return `\x1B[31m${value}\x1B[39m`;
      case LogLevel.WARN:
        return `\x1B[33m${value}\x1B[39m`;
      default:
        return `\x1B[32m${value}\x1B[39m`;
    }
  }

  private getWriteStreamType(level: LogLevel) {
    switch (level) {
      case LogLevel.ERROR:
        return 'stderr';
      default:
        return 'stdout';
    }
  }
}
