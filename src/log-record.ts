import { getLevelName, type LogLevel } from './levels';
import type { LogRecordOptions } from './types';

export class LogRecord {
  readonly msg: string;
  readonly args: unknown[];
  readonly level: LogLevel;
  readonly levelName: string;
  readonly loggerName: string;
  readonly datetime: Date;
  readonly pid: number;

  constructor(options: LogRecordOptions) {
    this.msg = options.msg;
    this.args = [...options.args];
    this.level = options.level;
    this.levelName = getLevelName(options.level);
    this.loggerName = options.loggerName;
    this.datetime = new Date();
    this.pid = process.pid;
  }
}
