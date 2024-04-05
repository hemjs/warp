import { DEFAULT_FORMATTER } from './constants';
import { getLevelByName, type LogLevel } from './levels';
import type { LogRecord } from './log-record';
import type { BaseHandlerOptions, LevelName } from './types';

export class BaseHandler {
  readonly level: LogLevel;
  readonly levelName: LevelName;
  readonly formatter: string | ((logRecord: LogRecord) => string);

  constructor(levelName: LevelName, options: BaseHandlerOptions = {}) {
    this.level = getLevelByName(levelName);
    this.levelName = levelName;
    this.formatter = options.formatter || DEFAULT_FORMATTER;
  }

  handle(logRecord: LogRecord) {
    if (this.level > logRecord.level) return;

    const msg = this.format(logRecord);
    this.log(msg, logRecord.level);
  }

  format(logRecord: LogRecord): string {
    if (this.formatter instanceof Function) {
      return this.formatter(logRecord);
    }

    return this.formatter.replace(/{([^\s}]+)}/g, (match, p1): string => {
      const value = logRecord[p1 as keyof LogRecord];

      if (value === undefined) {
        return match;
      }

      return String(value);
    });
  }

  log(msg: string, level: LogLevel) {}
}
