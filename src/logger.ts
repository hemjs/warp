import type { Logger as ILogger } from '@armscye/logging';

import type { BaseHandler } from './base-handler';
import { getLevelByName, getLevelName, LogLevel } from './levels';
import { LogRecord } from './log-record';
import type { LevelName, LoggerOptions } from './types';

export class Logger implements ILogger {
  private level: LogLevel;
  private handler: BaseHandler | BaseHandler[];
  private loggerName: string;

  constructor(
    loggerName: string,
    levelName: LevelName,
    options: LoggerOptions = {},
  ) {
    this.loggerName = loggerName;
    this.level = getLevelByName(levelName);
    this.handler = options.handler || [];
  }

  getLevel(): LogLevel {
    return this.level;
  }

  getLevelName(): LevelName {
    return getLevelName(this.level);
  }

  getLoggerName(): string {
    return this.loggerName;
  }

  setLoggerName(loggerName: string): this {
    this.loggerName = loggerName;
    return this;
  }

  trace(msg: any, ...args: unknown[]): void {
    this.log(LogLevel.TRACE, msg, ...args);
  }

  debug(msg: any, ...args: unknown[]): void {
    this.log(LogLevel.DEBUG, msg, ...args);
  }

  info(msg: any, ...args: unknown[]): void {
    this.log(LogLevel.INFO, msg, ...args);
  }

  warn(msg: any, ...args: unknown[]): void {
    this.log(LogLevel.WARN, msg, ...args);
  }

  error(msg: any, ...args: unknown[]): void {
    this.log(LogLevel.ERROR, msg, ...args);
  }

  private log(level: LogLevel, msg: any, ...args: unknown[]): void {
    if (this.level > level) {
      return;
    }

    const record: LogRecord = new LogRecord({
      msg: this.asString(msg),
      args: args.map((arg) => this.asString(arg)),
      level: level,
      loggerName: this.loggerName,
    });

    if (!Array.isArray(this.handler)) {
      this.handler = [this.handler];
    }

    this.handler.forEach((hdl) => {
      hdl.handle(record);
    });
  }

  private asString(data: unknown, isProperty = false): string {
    if (typeof data === 'string') {
      if (isProperty) return `"${data}"`;
      return data;
    } else if (typeof data === 'bigint' || typeof data === 'symbol') {
      return String(data);
    } else if (data instanceof Error) {
      return data.stack!;
    } else if (typeof data === 'object' && data !== null) {
      return `{${Object.entries(data)
        .map(([k, v]) => `"${k}":${this.asString(v, true)}`)
        .join(',')}}`;
    }

    return data as string;
  }
}
