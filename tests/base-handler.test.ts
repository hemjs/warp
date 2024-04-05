import {
  BaseHandler,
  getLevelByName,
  getLevelName,
  type LevelName,
  LogLevel,
  LogLevelNames,
  LogRecord,
} from '../src';

class TestHandler extends BaseHandler {
  messages: string[] = [];

  override log(message: string) {
    this.messages.push(message);
  }
}

describe('BaseHandler', () => {
  it('should filter messages correctly based on log level', () => {
    const cases = new Map<number, string[]>([
      [
        LogLevel.TRACE,
        [
          'TRACE trace-test',
          'DEBUG debug-test',
          'INFO info-test',
          'WARN warn-test',
          'ERROR error-test',
        ],
      ],
      [
        LogLevel.DEBUG,
        [
          'DEBUG debug-test',
          'INFO info-test',
          'WARN warn-test',
          'ERROR error-test',
        ],
      ],
      [LogLevel.INFO, ['INFO info-test', 'WARN warn-test', 'ERROR error-test']],
      [LogLevel.WARN, ['WARN warn-test', 'ERROR error-test']],
      [LogLevel.ERROR, ['ERROR error-test']],
    ]);

    for (const [testCase, messages] of cases.entries()) {
      const testLevel = getLevelName(testCase);
      const handler = new TestHandler(testLevel);

      for (const levelName of LogLevelNames) {
        const level = getLevelByName(levelName as LevelName);
        handler.handle(
          new LogRecord({
            msg: `${levelName.toLowerCase()}-test`,
            level: level,
            loggerName: 'default',
            args: [],
          }),
        );
      }

      expect(handler.level).toEqual(testCase);
      expect(handler.levelName).toEqual(testLevel);
      expect(handler.messages).toEqual(messages);
    }
  });

  it('should format messages with custom string formatter', () => {
    const handler = new TestHandler('DEBUG', {
      formatter: 'test {levelName} {msg}',
    });
    handler.handle(
      new LogRecord({
        msg: 'Hello, world!',
        level: LogLevel.DEBUG,
        loggerName: 'default',
        args: [],
      }),
    );

    expect(handler.messages).toEqual(['test DEBUG Hello, world!']);
  });

  it('should format with empty message', () => {
    const handler = new TestHandler('DEBUG', {
      formatter: 'test {levelName} {msg}',
    });

    handler.handle(
      new LogRecord({
        msg: '',
        level: LogLevel.DEBUG,
        loggerName: 'default',
        args: [],
      }),
    );

    expect(handler.messages).toEqual(['test DEBUG ']);
  });

  it('should call custom formatter function', function () {
    const handler = new TestHandler('DEBUG', {
      formatter: (logRecord): string =>
        `fn formatter ${logRecord.levelName} ${logRecord.msg}`,
    });

    handler.handle(
      new LogRecord({
        msg: 'Hello, world!',
        args: [],
        level: LogLevel.ERROR,
        loggerName: 'default',
      }),
    );

    expect(handler.messages).toEqual(['fn formatter ERROR Hello, world!']);
  });
});
