const DetoxEnvironment = require('detox/runners/jest-circus/environment');

class CustomDetoxEnvironment extends DetoxEnvironment {
  constructor(config) {
    super(config);

    this.enableListener('WorkerAssignReporter');
    this.enableListener('SpecReporter');
  }

  async initDetox() {
    if (process.env.TIMEOUT_E2E_TEST) {
      return this._initDetoxWithHangingServer();
    } else {
      return super.initDetox();
    }
  }

  async _initDetoxWithHangingServer() {
    console.log('Making problems with server');
    const config = require('../package.json').detox;
    const instance = await this.detox.init(config, { launchApp: false });
    const sendActionOriginal = instance._server.sendAction;
    instance._server.sendAction = function(ws, action) {
      if (action.type !== 'ready') {
        sendActionOriginal.call(this, ws, action);
      }
    };

    await instance.device.launchApp();
    return instance;
  }
}

if (process.env.TIMEOUT_E2E_TEST) {
  CustomDetoxEnvironment.initTimeout = 30000;
}

process.on('unhandledRejection', (reason, p) => {
  console.log('Unhandled Rejection at: Promise', p, 'reason:', reason);
});

module.exports = CustomDetoxEnvironment;
