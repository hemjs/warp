import type { BaseHandler } from './base-handler';
import type { LogLevel } from './levels';
import type { LogRecord } from './log-record';

export type LevelName = keyof typeof LogLevel;

export interface LogRecordOptions {
  msg: string;
  args: unknown[];
  level: LogLevel;
  loggerName: string;
}

export interface BaseHandlerOptions {
  formatter?: string | ((logRecord: LogRecord) => string);
}

export interface LoggerOptions {
  handler?: BaseHandler | BaseHandler[];
}
