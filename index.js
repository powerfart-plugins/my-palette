const { Plugin } = require('powercord/entities');
const { inject, uninject } = require('powercord/injector');
const { React, getModule } = require('powercord/webpack');

const i18n = require('./i18n');
const { registerSettings } = require('./components/Settings');
const SnippetButton = require('./components/SnippetButton');

const Config = new (require('./utils/ConfigHandler'))();
const Profiles = new (require('./utils/ProfilesHandler'))();

/* eslint-disable object-property-newline */
module.exports = class ThemeSettings extends Plugin {
  async startPlugin () {
    powercord.api.i18n.loadAllStrings(i18n);
    this.loadStylesheet('style.scss');
    registerSettings('my-palette', this.entityID, { Config, Profiles });
    Config.appendStyle('config-my-palette');
    Profiles.load();
    await this._injectSnippets();
  }

  pluginWillUnload () {
    powercord.api.settings.unregisterSettings('my-palette');
    Config.removeStyle();
    uninject('my-palette-snippet-profile');
  }

  async _injectSnippets () {
    const MiniPopover = await getModule((m) => m.default && m.default.displayName === 'MiniPopover');
    inject('my-palette-snippet-profile', MiniPopover, 'default', ([ { children: [ { props } ] } ], res) => {
      const { message, channel } = props;

      if (channel && channel.id === '810165518744420372') {
        res.props.children.unshift(
          React.createElement(SnippetButton, { Config, Profiles, message })
        );
      }
      return res;
    });
    MiniPopover.default.displayName = 'MiniPopover';
  }
};
