const { Plugin } = require('powercord/entities');

const i18n = require('./i18n');
const { registerSettings } = require('./components/Settings');

const Config = new (require('./modules/ConfigHandler'))();
const Profiles = new (require('./modules/ProfilesHandler'))();

/* eslint-disable object-property-newline */
module.exports = class MyPalette extends Plugin {
  async startPlugin () {
    powercord.api.i18n.loadAllStrings(i18n);
    this.loadStylesheet('style.scss');
    registerSettings(this.entityID, { Config, Profiles });
    Config.appendStyle('config-my-palette');
    Profiles.load();
  }

  pluginWillUnload () {
    powercord.api.settings.unregisterSettings('my-palette');
    Config.removeStyle();
  }
};
