import { DefaultApiLogger } from '../lib';

describe('ApiLogger', () => {
  jest.spyOn(console, 'info');
  jest.spyOn(console, 'error');
  jest.spyOn(console, 'warn');
  jest.spyOn(console, 'debug');

  const originalEnv = process.env;

  afterEach(() => {
    process.env = originalEnv;
  });

  it('should trigger both console.info, console.warn & console.error when NODE_ENV=development', () => {
    process.env = {
      ...originalEnv,
      NODE_ENV: 'development',
    };

    const logger = new DefaultApiLogger();

    logger.info();
    expect(console.info).toHaveBeenCalledTimes(1);

    logger.error();
    expect(console.error).toHaveBeenCalledTimes(1);

    logger.warn();
    expect(console.warn).toHaveBeenCalledTimes(1);

    logger.debug();
    expect(console.debug).toHaveBeenCalledTimes(0);
  });

  it('should trigger only console.error when NODE_ENV=production', () => {
    process.env = {
      ...originalEnv,
      NODE_ENV: 'production',
    };

    const logger = new DefaultApiLogger();

    logger.info();
    expect(console.info).toHaveBeenCalledTimes(0);

    logger.error();
    expect(console.error).toHaveBeenCalledTimes(1);

    logger.warn();
    expect(console.warn).toHaveBeenCalledTimes(0);

    logger.debug();
    expect(console.debug).toHaveBeenCalledTimes(0);
  });

  it('should trigger neither console.error nor console.info when NODE_ENV=test', () => {
    process.env = {
      ...originalEnv,
      NODE_ENV: 'test',
    };

    const logger = new DefaultApiLogger();

    logger.info();
    expect(console.info).toHaveBeenCalledTimes(0);

    logger.error();
    expect(console.error).toHaveBeenCalledTimes(0);

    logger.warn();
    expect(console.warn).toHaveBeenCalledTimes(0);

    logger.debug();
    expect(console.debug).toHaveBeenCalledTimes(0);
  });

  it('should trigger console.info, console.warn & console.error when loggerLevel=info', () => {
    const logger = new DefaultApiLogger({ loggerLevel: 'info' });

    logger.info();
    expect(console.info).toHaveBeenCalledTimes(1);

    logger.error();
    expect(console.error).toHaveBeenCalledTimes(1);

    logger.warn();
    expect(console.warn).toHaveBeenCalledTimes(1);

    logger.debug();
    expect(console.debug).toHaveBeenCalledTimes(0);
  });

  it('should trigger console.warn & console.error when loggerLevel=warn', () => {
    const logger = new DefaultApiLogger({ loggerLevel: 'warn' });

    logger.info();
    expect(console.info).toHaveBeenCalledTimes(0);

    logger.error();
    expect(console.error).toHaveBeenCalledTimes(1);

    logger.warn();
    expect(console.warn).toHaveBeenCalledTimes(1);

    logger.debug();
    expect(console.debug).toHaveBeenCalledTimes(0);
  });

  it('should trigger console.error when loggerLevel=error', () => {
    const logger = new DefaultApiLogger({ loggerLevel: 'error' });

    logger.info();
    expect(console.info).toHaveBeenCalledTimes(0);

    logger.error();
    expect(console.error).toHaveBeenCalledTimes(1);

    logger.warn();
    expect(console.warn).toHaveBeenCalledTimes(0);

    logger.debug();
    expect(console.debug).toHaveBeenCalledTimes(0);
  });

  it('should trigger all when loggerLevel=debug', () => {
    const logger = new DefaultApiLogger({ loggerLevel: 'debug' });

    logger.info();
    expect(console.info).toHaveBeenCalledTimes(1);

    logger.error();
    expect(console.error).toHaveBeenCalledTimes(1);

    logger.warn();
    expect(console.warn).toHaveBeenCalledTimes(1);

    logger.debug();
    expect(console.debug).toHaveBeenCalledTimes(1);
  });

  it('should not trigger when loggerLevel=silent', () => {
    const logger = new DefaultApiLogger({ loggerLevel: 'silent' });

    logger.info();
    expect(console.info).toHaveBeenCalledTimes(0);

    logger.error();
    expect(console.error).toHaveBeenCalledTimes(0);

    logger.warn();
    expect(console.warn).toHaveBeenCalledTimes(0);

    logger.debug();
    expect(console.debug).toHaveBeenCalledTimes(0);
  });
});
