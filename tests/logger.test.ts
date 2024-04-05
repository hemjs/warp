import {
  BaseHandler,
  getLevelName,
  type LevelName,
  Logger,
  LogLevel,
  type LogRecord,
} from '../src';

class TestHandler extends BaseHandler {
  messages: string[] = [];
  records: LogRecord[] = [];

  override handle(record: LogRecord) {
    this.records.push(record);
    super.handle(record);
  }

  override log(message: string) {
    this.messages.push(message);
  }
}

describe('Logger', () => {
  it('creates a Logger instance with expected properties', () => {
    const logger = new Logger('default', 'DEBUG', {});

    expect(logger).toBeInstanceOf(Logger);
    expect(logger.getLevel()).toEqual(LogLevel.DEBUG);
    expect(logger.getLevelName()).toEqual(getLevelName(LogLevel.DEBUG));
    expect(logger.getLoggerName()).toEqual('default');
  });

  it('sets the loggerName property correctly', () => {
    const logger = new Logger('initialName', 'INFO');
    expect(logger.getLoggerName()).toBe('initialName');

    logger.setLoggerName('newName');
    expect(logger.getLoggerName()).toBe('newName');
  });

  it('logs message with correct level and arguments', () => {
    const handler = new TestHandler('DEBUG');
    const logger = new Logger('default', 'DEBUG', { handler: handler });
    logger.debug('foo', 1, 2);

    expect(handler.records[0].msg).toEqual('foo');
    expect(handler.records[0].level).toEqual(LogLevel.DEBUG);
    expect(handler.records[0].levelName).toEqual(getLevelName(LogLevel.DEBUG));
    expect(handler.records[0].args).toEqual([1, 2]);
    expect(handler.messages).toEqual(['DEBUG foo']);
  });

  it('logs messages at or above specified logger level', () => {
    let handler: TestHandler;
    const doLog = (level: LevelName): TestHandler => {
      const handler = new TestHandler(level);
      const logger = new Logger('default', level, { handler: handler });
      logger.trace('foo');
      logger.debug('bar');
      logger.info('baz');
      logger.warn('voo');
      logger.error('doo');
      return handler;
    };

    handler = doLog('TRACE');
    expect(handler.messages).toEqual([
      'TRACE foo',
      'DEBUG bar',
      'INFO baz',
      'WARN voo',
      'ERROR doo',
    ]);

    handler = doLog('DEBUG');
    expect(handler.messages).toEqual([
      'DEBUG bar',
      'INFO baz',
      'WARN voo',
      'ERROR doo',
    ]);

    handler = doLog('INFO');
    expect(handler.messages).toEqual(['INFO baz', 'WARN voo', 'ERROR doo']);

    handler = doLog('WARN');
    expect(handler.messages).toEqual(['WARN voo', 'ERROR doo']);

    handler = doLog('ERROR');
    expect(handler.messages).toEqual(['ERROR doo']);
  });

  it('does not log messages below logger level', () => {
    const handler = new TestHandler('ERROR');
    const logger = new Logger('default', 'ERROR', { handler: handler });
    logger.debug('foo', 1, 2);

    expect(handler.messages).toEqual([]);
  });

  it('converts data types to strings for logging correctly', () => {
    const handler = new TestHandler('NOTSET');
    const logger = new Logger('default', 'NOTSET', { handler: handler });

    // string
    logger.trace('abc');
    logger.trace('def', 1);
    expect(handler.messages[0]).toEqual('TRACE abc');
    expect(handler.messages[1]).toEqual('TRACE def');

    // null
    logger.debug(null);
    logger.debug(null, 1);
    expect(handler.messages[2]).toEqual('DEBUG null');
    expect(handler.messages[3]).toEqual('DEBUG null');

    // number
    logger.info(3);
    logger.info(3, 1);
    expect(handler.messages[4]).toEqual('INFO 3');
    expect(handler.messages[5]).toEqual('INFO 3');

    // bigint
    logger.warn(5n);
    logger.warn(5n, 1);
    expect(handler.messages[6]).toEqual('WARN 5');
    expect(handler.messages[7]).toEqual('WARN 5');

    // boolean
    logger.error(true);
    logger.error(false, 1);
    expect(handler.messages[8]).toEqual('ERROR true');
    expect(handler.messages[9]).toEqual('ERROR false');

    // undefined
    logger.debug(undefined);
    logger.debug(undefined, 1);
    expect(handler.messages[10]).toEqual('DEBUG {msg}');
    expect(handler.messages[11]).toEqual('DEBUG {msg}');

    // symbol
    logger.info(Symbol());
    logger.info(Symbol('a'), 1);
    expect(handler.messages[12]).toEqual('INFO Symbol()');
    expect(handler.messages[13]).toEqual('INFO Symbol(a)');

    // object
    logger.warn({ payload: 'data', other: 123 });
    logger.warn({ payload: 'data', other: 123 }, 1);
    logger.warn({ payload: 'data', other: 123n });
    logger.warn({ payload: 'data', other: 123n }, 1);
    expect(handler.messages[14]).toEqual('WARN {"payload":"data","other":123}');
    expect(handler.messages[15]).toEqual('WARN {"payload":"data","other":123}');
    expect(handler.messages[16]).toEqual('WARN {"payload":"data","other":123}');
    expect(handler.messages[17]).toEqual('WARN {"payload":"data","other":123}');

    // error
    const error = new Error('Uh-oh!');
    logger.error(error);
    const messages = handler.messages[18]!.split('\n');
    expect(messages[0]!).toEqual(`ERROR ${error.name}: ${error.message}`);
  });
});
