import test from 'ava';
import sinon, { SinonSpy } from 'sinon';

import { DefaultApiLogger } from './api-logger';

let spiedConsoleInfo: SinonSpy<[message?: any, ...options: any[]]>;
let spiedConsoleError: SinonSpy<[message?: any, ...options: any[]]>;

test.beforeEach(() => {
  spiedConsoleInfo = sinon.spy(console, 'info');
  spiedConsoleError = sinon.spy(console, 'error');
});

test.afterEach(() => {
  spiedConsoleInfo.restore();
  spiedConsoleError.restore();
});

test.serial(
  'should trigger both console.info & console.error when NODE_ENV=development',
  (t) => {
    sinon.stub(process, 'env').value({ NODE_ENV: 'development' });

    const logger = new DefaultApiLogger();

    logger.info();
    t.is(spiedConsoleInfo.callCount, 1);

    logger.error();
    t.is(spiedConsoleError.callCount, 1);
  }
);

test.serial(
  'should only trigger console.error, not console.info when NODE_ENV=production',
  (t) => {
    sinon.stub(process, 'env').value({ NODE_ENV: 'production' });
    const logger = new DefaultApiLogger();

    logger.info();
    t.is(spiedConsoleInfo.callCount, 0);

    logger.error();
    t.is(spiedConsoleError.callCount, 1);
  }
);

test.serial(
  'should trigger neither console.error nor console.info when NODE_ENV=test',
  (t) => {
    sinon.stub(process, 'env').value({ NODE_ENV: 'test' });
    const logger = new DefaultApiLogger();

    logger.info();
    t.is(spiedConsoleInfo.callCount, 0);

    logger.error();
    t.is(spiedConsoleInfo.callCount, 0);
  }
);

test.serial(
  'should trigger both console.info & console.error when loggerLevel=info',
  (t) => {
    const logger = new DefaultApiLogger({ loggerLevel: 'info' });

    logger.info();
    t.is(spiedConsoleInfo.callCount, 1);

    logger.error();
    t.is(spiedConsoleError.callCount, 1);
  }
);

test.serial(
  'should only trigger console.error, not console.info when loggerLevel=warn',
  (t) => {
    const logger = new DefaultApiLogger({ loggerLevel: 'warn' });

    logger.info();
    t.is(spiedConsoleInfo.callCount, 0);

    logger.error();
    t.is(spiedConsoleError.callCount, 1);
  }
);

test.serial(
  'should only trigger console.error, not console.info when loggerLevel=error',
  (t) => {
    const logger = new DefaultApiLogger({ loggerLevel: 'error' });

    logger.info();
    t.is(spiedConsoleInfo.callCount, 0);

    logger.error();
    t.is(spiedConsoleError.callCount, 1);
  }
);

test.serial(
  'should trigger neither console.error nor console.info when loggerLevel=silent',
  (t) => {
    const logger = new DefaultApiLogger({ loggerLevel: 'silent' });

    logger.info();
    t.is(spiedConsoleInfo.callCount, 0);

    logger.error();
    t.is(spiedConsoleInfo.callCount, 0);
  }
);
