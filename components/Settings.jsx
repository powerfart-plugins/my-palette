const { clipboard } = require('electron');
const { React, getModule, getModuleByDisplayName, i18n: { Messages } } = require('powercord/webpack');
const { PopoutWindow, Tooltip, Clickable, settings: { Category } } = require('powercord/components');

const SeparateWindow = require('./SeparateWindow');
const TextInputEdit = require('./TextInputEdit');
const Profiles  = require('./Profiles');
const CreateProfileByPalette = require('./CreateProfileByPalette');
const ThemesParser  = require('../modules/ThemesParser');
const { getType }  = require('../utils/types');

const FavoriteFilled = getModuleByDisplayName('FavoriteFilled', false);

/* eslint-disable object-property-newline,  no-undefined, no-use-before-define */
class Settings extends React.PureComponent {
  constructor (props) {
    super(props);

    this.items = ThemesParser.themesVars;
    this.state = {
      themes: Object.fromEntries(
        [ ...this.items ]
          .map(([ key ]) => [ key, props.Config.getTheme(key) ])
      )
    };
  }

  render () {
    return [ ...this.items ].map(([ themeKey, theme ]) => (
      <Category2
        name={this.renderCategoryName(themeKey)}
        opened={false}
      >
        { this.renderProfiles(themeKey) }
        { this.renderTheme(theme, themeKey) }
      </Category2>
    ));
  }

  Category2 (props) {
    const def = (props.opened === undefined) ? true : props.opened;
    const [ opened, onChange ] = React.useState(def);
    props = { ...props, onChange, opened };

    return <Category {...props}/>;
  }

  renderCategoryName (key) {
    key = key.replace('theme-', '');

    if (key.startsWith('discord-')) {
      return (
        <div className='my-palette-discordTheme-name'>
          <Tooltip text={Messages.MY_PALETTE_NATIVE_DISCORD_THEME} className='icon'>
            <FavoriteFilled/>
          </Tooltip>
          {key.replace('discord-', '')}
        </div>
      );
    }
    return key;
  }

  renderTheme (items, themeKey) {
    const props = {
      save: () => this.props.Config.save(),
      reset: () => {
        this.props.Config.reset(themeKey);
        this.props.Config.setParam(themeKey, 'profile', null);
        this.updateStateTheme(themeKey);
      },
      saveAsProfile: (...args) => this.saveAsProfile(...args, themeKey)
    };
    const renderThemeItems = (...args) => this.renderThemeItems(themeKey, items, args);

    return (
      <SeparateWindow
        openPopout={() => this._openSeparateWindow({
          children: renderThemeItems,
          ...props
        })}
        {...props}
      >
        { renderThemeItems }
      </SeparateWindow>
    );
  }

  renderThemeItems (themeKey, items, args) {
    const theme = this.state.themes[themeKey].vars;

    const getDisplayKey = (key) => {
      const isDiscordTheme = themeKey.startsWith('discord-');
      const themeWithoutPrefix = themeKey.replace('theme-', '');
      const result =  (isDiscordTheme) ? key : key.replace(new RegExp(themeWithoutPrefix), '');
      return result.replace(/-/g, ' ');
    };
    const updateValue = (key, val) => {
      this.props.Config.setByKey(themeKey, key, val);
      this.props.Config.setParam(themeKey, 'profile', null);
      this.updateStateTheme(themeKey);
    };
    const getConfigValue = (key) => {
      const res = theme.find((e) => e.property === `--${key}`);
      return (res) ? res.value : null;
    };

    return [ ...items ].map(([ key, value ]) => {
      let [ type, subType ] = getType(value);
      let cssVarKey;

      if (subType === 'cssVar') {
        cssVarKey = value.replace(/var\(--(.+?)\)/, '$1');
        [ type, subType ] = getType(items.get(cssVarKey));
      }
      return this.renderThemeItem([ key, value ], {
        updateValue,
        getConfigValue,
        getDisplayKey,
        type,
        subType,
        isCssVar: !!(cssVarKey),
        ...args
      });
    });
  }

  renderThemeItem ([ key, value ], opts) {
    const { updateSetting: update, getSetting: get } = this.props;
    const copy = (t) => clipboard.write({ text: `var(--${t})` });

    return (
      <TextInputEdit
        modal={opts[0]}
        value={opts.getConfigValue(key)}
        defaultValue={value}
        type={opts.type}
        subType={opts.subType}
        isCssVar={opts.isCssVar}
        // note={`Key: --${key}`}
        change={(val) => opts.updateValue(key, val)}
        settings={{ update, get }}
      >
        <Clickable className='button' onClick={() => copy(key)}>  {/* Tooltip не работает тут */}
          { opts.getDisplayKey(key) }
        </Clickable>
      </TextInputEdit>
    );
  }

  renderProfiles (key) {
    const { Config, Profiles: ProfilesHand } = this.props;
    const profiles = ProfilesHand.getByThemeKey(key);

    return (
      <Profiles
        profiles={profiles}
        theme={this.state.themes[key]}

        isValid={(v) => ProfilesHand.isValidProfileString(v)}
        add={(v, force = false) => {
          const [ name, theme, vars ] = ProfilesHand.parse(v);

          if ((theme !== key) || force) {
            return false;
          }
          const pIndex = ProfilesHand.add(key, { name, vars });
          Config.setParam(key, 'profile', pIndex);
          Config.applyVars(key, vars);
          this.updateStateTheme(key);
          Config.save();
          return true;
        }}

        onCopy={(v) => ProfilesHand.copy(key, v)}
        onRemove={(v) => {
          ProfilesHand.remove(key, v);
          this.updateStateTheme(key);
        }}
        onChange={(v) => {
          Config.setParam(key, 'profile', v);
          Config.applyVars(key, profiles[v].vars);
          this.updateStateTheme(key);
        }}
      />
    );
  }


  async _openSeparateWindow (props) {
    const popoutModule = await getModule([ 'setAlwaysOnTop', 'open' ]);
    popoutModule.open('DISCORD_POWERCORD_PLUGIN_MY_PALETTE', (key) => (
      React.createElement(PopoutWindow, {
        windowKey: key,
        title: 'My Palette'
      },
      React.createElement(SeparateWindow, {
        popout: true,
        ...props
      }))
    ));
  }

  saveAsProfile (open, close, key) {
    const vars = this.props.Config.getStrVars(key);
    if (!vars) {
      return;
    }
    open(() => (
      React.createElement(CreateProfileByPalette, {
        close,
        save: (name) => {
          const pIndex = this.props.Profiles.add(key, { name, vars });
          this.props.Config.setParam(key, 'profile', pIndex);
          this.updateStateTheme(key);
          this.props.Config.save();
        }
      })
    ));
  }

  updateStateTheme (key) { // лакальный forceUpdate()
    this.setState((prevState) => ({
      themes: {
        ...prevState.themes,
        [key]: this.props.Config.getTheme(key)
      }
    }));
  }
}

function registerSettings (entityID, props) {
  powercord.api.settings.registerSettings('my-palette', {
    label: 'My Palette',
    category: entityID,
    render: (props2) => React.createElement(Settings, {
      ...props,
      ...props2
    })
  });
}

module.exports = {
  Settings,
  registerSettings
};
