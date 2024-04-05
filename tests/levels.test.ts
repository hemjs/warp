import {
  getLevelByName,
  getLevelName,
  type LevelName,
  LogLevel,
  LogLevelNames,
} from '../src';

describe('getLevelByName', () => {
  it('should return correct LogLevel for DEBUG', () => {
    expect(getLevelByName('DEBUG')).toEqual(LogLevel.DEBUG);
  });

  it('should throw an error for an unknown level name', () => {
    expect(() => getLevelByName('unknownLevel' as LevelName)).toThrow(
      'no log level found',
    );
  });
});

describe('getLevelName', () => {
  it('should return the correct LevelName for LogLevel.WARN', () => {
    expect(getLevelName(LogLevel.WARN)).toEqual('WARN');
  });

  it('should throw an error for an invalid LogLevel number', () => {
    expect(() => getLevelName(100 as any)).toThrow('no level name found');
  });
});

describe('LogLevelNames', () => {
  it('should contain all valid LevelNames', () => {
    const expectedNames = ['NOTSET', 'TRACE', 'DEBUG', 'INFO', 'WARN', 'ERROR'];
    expectedNames.forEach((name) => expect(LogLevelNames).toContain(name));
  });
});
