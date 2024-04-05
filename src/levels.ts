import type { LevelName } from './types';

export enum LogLevel {
  NOTSET = 0,
  TRACE = 10,
  DEBUG = 20,
  INFO = 30,
  WARN = 40,
  ERROR = 50,
}

export const LogLevelNames: LevelName[] = Object.keys(LogLevel).filter((key) =>
  isNaN(Number(key)),
) as LevelName[];

const byLevel: Record<string, LevelName> = {
  [String(LogLevel.NOTSET)]: 'NOTSET',
  [String(LogLevel.TRACE)]: 'TRACE',
  [String(LogLevel.DEBUG)]: 'DEBUG',
  [String(LogLevel.INFO)]: 'INFO',
  [String(LogLevel.WARN)]: 'WARN',
  [String(LogLevel.ERROR)]: 'ERROR',
};

export function getLevelByName(name: LevelName): number {
  switch (name) {
    case 'NOTSET':
      return LogLevel.NOTSET;
    case 'TRACE':
      return LogLevel.TRACE;
    case 'DEBUG':
      return LogLevel.DEBUG;
    case 'INFO':
      return LogLevel.INFO;
    case 'WARN':
      return LogLevel.WARN;
    case 'ERROR':
      return LogLevel.ERROR;
    default:
      throw new Error(`no log level found for "${name}"`);
  }
}

export function getLevelName(level: LogLevel): LevelName {
  const levelName = byLevel[level];
  if (levelName) {
    return levelName;
  }
  throw new Error(`no level name found for level: ${level}`);
}
