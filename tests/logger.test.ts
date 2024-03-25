import { Logger } from '../src';

test('Logger creates an instance', () => {
  expect(new Logger()).toBeInstanceOf(Logger);
});
