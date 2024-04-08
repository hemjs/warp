import { ConsoleHandler, getLevelName, LogLevel, LogRecord } from '../src';

describe('ConsoleHandler', () => {
  let processStdoutWriteSpy: any;
  let processStderrWriteSpy: any;

  beforeEach(() => {
    processStdoutWriteSpy = jest.spyOn(process.stdout, 'write');
    processStderrWriteSpy = jest.spyOn(process.stderr, 'write');
  });

  afterEach(() => {
    processStdoutWriteSpy = jest.resetAllMocks();
    processStderrWriteSpy = jest.resetAllMocks();
  });

  it('should log debug messages to stdout', () => {
    const message = 'A DEBUG Message';
    const consoleHandler = new ConsoleHandler('NOTSET');
    consoleHandler.handle(
      new LogRecord({
        msg: message,
        level: LogLevel.DEBUG,
        loggerName: 'defualt',
        args: [],
      }),
    );

    expect(processStdoutWriteSpy).toHaveBeenCalledTimes(1);
    expect(processStdoutWriteSpy).toHaveBeenCalledWith(
      expect.stringMatching(getLevelName(LogLevel.DEBUG)),
    );
    expect(processStdoutWriteSpy).toHaveBeenCalledWith(
      expect.stringMatching(message),
    );
  });

  it('should log error messages to stderr', () => {
    const message = 'An ERROR message';
    const consoleHandler = new ConsoleHandler('NOTSET');
    consoleHandler.handle(
      new LogRecord({
        msg: message,
        level: LogLevel.ERROR,
        loggerName: 'defualt',
        args: [],
      }),
    );

    expect(processStderrWriteSpy).toHaveBeenCalledTimes(1);
    expect(processStderrWriteSpy).toHaveBeenCalledWith(
      expect.stringMatching(getLevelName(LogLevel.ERROR)),
    );
    expect(processStderrWriteSpy).toHaveBeenCalledWith(
      expect.stringMatching(message),
    );
  });

  it('should format messages using custom string formatter', () => {
    const message = 'An WARN Message';
    const consoleHandler = new ConsoleHandler('WARN', {
      formatter: '{datetime} {levelName} {pid} {loggerName} {msg}',
    });

    consoleHandler.handle(
      new LogRecord({
        msg: message,
        level: LogLevel.WARN,
        loggerName: 'default',
        args: [],
      }),
    );

    expect(processStdoutWriteSpy).toHaveBeenCalledTimes(1);
    expect(processStdoutWriteSpy).toHaveBeenCalledWith(
      expect.stringMatching('default'),
    );
    expect(processStdoutWriteSpy).toHaveBeenCalledWith(
      expect.stringMatching(getLevelName(LogLevel.WARN)),
    );
    expect(processStdoutWriteSpy).toHaveBeenCalledWith(
      expect.stringMatching(message),
    );
  });

  it('should suppress colors when useColors option is false', () => {
    const message = 'A WARN Message';
    const consoleHandler = new ConsoleHandler('WARN', {
      formatter: '{datetime} {levelName} {pid} {loggerName} {msg}',
      useColors: false,
    });
    consoleHandler.handle(
      new LogRecord({
        msg: message,
        level: LogLevel.WARN,
        loggerName: 'defualt',
        args: [],
      }),
    );

    expect(processStdoutWriteSpy).toHaveBeenCalledTimes(1);
    expect(processStdoutWriteSpy).toHaveBeenCalledWith(
      expect.stringMatching(getLevelName(LogLevel.WARN)),
    );
    expect(processStdoutWriteSpy).toHaveBeenCalledWith(
      expect.stringMatching(message),
    );
  });

  it('should truncate long logger names', () => {
    const message = 'A INFO Message';
    const consoleHandler = new ConsoleHandler('INFO', {
      formatter: '{datetime} {levelName} {pid} {loggerName} {msg}',
    });
    consoleHandler.handle(
      new LogRecord({
        msg: message,
        level: LogLevel.INFO,
        loggerName: 'this_logger_name_is_way_too_long_and_might_break_things',
        args: [],
      }),
    );

    expect(processStdoutWriteSpy).toHaveBeenCalledTimes(1);
    expect(processStdoutWriteSpy).toHaveBeenCalledWith(
      expect.stringMatching(getLevelName(LogLevel.INFO)),
    );
    expect(processStdoutWriteSpy).toHaveBeenCalledWith(
      expect.stringMatching(message),
    );
    expect(processStdoutWriteSpy).toHaveBeenCalledWith(
      expect.stringContaining('~too_long_and_might_break_things'),
    );
  });

  it('should handle missing values in formatter templates', () => {
    const message = 'A TRACE Message';
    const consoleHandler = new ConsoleHandler('TRACE', {
      formatter: '{levelName} {msg} {missing}',
    });
    consoleHandler.handle(
      new LogRecord({
        msg: message,
        level: LogLevel.TRACE,
        loggerName: 'defualt',
        args: [],
      }),
    );

    expect(processStdoutWriteSpy).toHaveBeenCalledTimes(1);
    expect(processStdoutWriteSpy).toHaveBeenCalledWith(
      expect.stringMatching(getLevelName(LogLevel.TRACE)),
    );
    expect(processStdoutWriteSpy).toHaveBeenCalledWith(
      expect.stringMatching(message),
    );
    expect(processStdoutWriteSpy).toHaveBeenCalledWith(
      expect.stringContaining('{missing}'),
    );
  });

  it('should call custom formatter function', function () {
    const handler = new ConsoleHandler('DEBUG', {
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

    expect(processStderrWriteSpy).toHaveBeenCalledTimes(1);
    expect(processStderrWriteSpy).toHaveBeenCalledWith(
      expect.stringMatching(getLevelName(LogLevel.ERROR)),
    );
    expect(processStderrWriteSpy).toHaveBeenCalledWith(
      expect.stringMatching('fn formatter ERROR Hello, world!'),
    );
  });
});
