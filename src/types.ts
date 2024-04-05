import type { LogLevel } from './levels';

export type LevelName = keyof typeof LogLevel;

export interface LogRecordOptions {
  msg: string;
  args: unknown[];
  level: LogLevel;
  loggerName: string;
}
