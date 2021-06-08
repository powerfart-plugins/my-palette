const { existsSync } = require('fs');
const { resolve } = require('path');

const { Plugin } = require('powercord/entities');
const { i18n:{ Messages } } = require('powercord/webpack');

const i18n = require('./i18n');
const { registerSettings } = require('./components/Settings');
const installDependencies = require('./utils/installDependencies');

const ConfigHandler = require('./modules/ConfigHandler');
const ProfilesHandler = require('./modules/ProfilesHandler');
const ChangeLog = require('./modules/ChangeLog');

const changelog = require('./changelog.json');

/* eslint-disable object-property-newline */
// noinspection JSUnusedGlobalSymbols
module.exports = class MyPalette extends Plugin {
  constructor () {
    super();
    this.initError = new Error();

    if (existsSync(resolve(__dirname, 'node_modules'))) {
      this.Config = new ConfigHandler();
      this.Profiles = new ProfilesHandler();
    } else {
      this.initError.name = 'need npm dependencies';
      this.initError.code = 'NEED_NPM_DEPENDENCIES';
    }
    this.ChangeLog = new ChangeLog({
      config: changelog,
      currentVer: this.manifest.version,
      lastCheckedVer: this.settings.get('lastChangeLogVersion', '0'),
      updateLastCheckedVer: (v) => this.settings.set('lastChangeLogVersion', v)
    });
  }

  async startPlugin () {
    powercord.api.i18n.loadAllStrings(i18n);
    this.loadStylesheet('style.scss');

    if (this.initError.code === 'NEED_NPM_DEPENDENCIES') {
      this.installDeps();
      return;
    }

    this.ChangeLog.init();
    registerSettings(this.entityID, { Config: this.Config, Profiles: this.Profiles });
    this.Config.appendStyle('config-my-palette');
    this.Profiles.load();
  }

  pluginWillUnload () {
    powercord.api.settings.unregisterSettings('my-palette');
    this.Config?.removeStyle();
  }

  installDeps () {
    const { notices } = powercord.api;

    notices.sendAnnouncement('my-palette-deps', {
      message: Messages.MY_PALETTE_INSTALL_DEPS_NEED.format({ name: 'My Palette' }),
      button: {
        text: Messages.MY_PALETTE_INSTALL_DEPS,
        onClick: () => {
          installDependencies(__dirname)
            .then(() => {
              powercord.pluginManager.remount(this.entityID);
              notices.sendToast('my-palette-deps', {
                header: 'My Palette',
                content: Messages.MY_PALETTE_INSTALL_DEPS_READY,
                timeout: 4e3,
                type: 'success'
              });
            })
            .catch((err) => {
              this.error(err);
              notices.sendToast('my-palette-deps', {
                header: 'My Palette',
                content: Messages.MY_PALETTE_INSTALL_DEPS_ERROR.format({ devName: this.manifect.author }),
                type: 'danger'
              });
            });
        }
      }
    });
  }
};
