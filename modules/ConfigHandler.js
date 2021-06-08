const { existsSync, promises: { writeFile, readFile } } = require('fs');
const { join } = require('path');
const CSS = require('css');
const warn = `/* ----------------------------------------------------------------------------
\tDo NOT CHANGE this file manually if you are not sure what you are doing
---------------------------------------------------------------------------- */\n\n`;

const filePath = join(__dirname, '..', 'config.css');

module.exports = class MyPaletteConfigHandler {
  constructor () {
    this._element = null;
    this._root = null;
    this._themes = {};
  }

  set stylesheet (v) {
    this._element.innerHTML = v.replace(/\/\*.+?\*\/\n+/gs, '');
  }

  get stylesheet () {
    return this._element.innerHTML;
  }

  appendStyle (id) {
    this._element = document.createElement('style');
    this._element.id = id;

    if (existsSync(filePath)) {
      readFile(filePath, 'utf8')
        .then((data) => this._applyConfig(data))
        .catch(console.error);
    } else {
      this._applyConfig(null);
    }
  }

  removeStyle () {
    document.querySelector(`#${this._element.id}`).remove();
  }

  getTheme (key) {
    if (!this._themes[key]) {
      this._themes[key] = {
        vars: [],
        params: {}
      };
    }
    return this._themes[key];
  }

  setByKey (theme, key, value) {
    const items = this.getTheme(theme).vars;
    const keys = items.map((e) => e.property.trim().substring(2));
    const keyIndex = keys.indexOf(key);

    if (value) {
      if (keyIndex === -1) {
        items.push({
          type: 'declaration',
          property: `--${key}`,
          value
        });
      } else {
        items[keyIndex].value = value;
      }
    } else if (keyIndex !== -1) {
      items.splice(keyIndex, 1);
    } else {
      return; // ничего не обновлено
    }

    this._syncSheet();
  }

  setParam (theme, key, value) {
    const { params } = this.getTheme(theme);
    if (value === null) {
      delete params[key];
    } else {
      params[key] = value;
    }

    this._buildDeclarations();
  }

  applyVars (theme, str) {
    this.getTheme(theme).vars = str
      .split(/;\s?/)
      .map((rule) => {
        const [ key, value ] = rule.split(/:\s?/);
        return {
          type: 'declaration',
          property: `--${key}`,
          value
        };
      });

    this._syncSheet();
    this.save();
  }

  async save () {
    let data = CSS.stringify(this._stylesheetParsed);
    if (!data.includes(':root')) {
      data += ':root {}\n';
    }
    writeFile(filePath, data)
      .catch(console.error);
  }

  reset (theme) {
    delete this._themes[theme];
    this._syncSheet();
    this.save();
  }

  getStrVars (key) {
    return this.getTheme(key).vars
      .map((e) => `${e.property.trim().substring(2)}: ${e.value}`)
      .join('; ');
  }

  _applyConfig (fileData) {
    if (!fileData) {
      fileData = `${warn}:root {}`;
    }

    this.stylesheet = fileData;
    document.head.appendChild(this._element);
    this._stylesheetParsed = CSS.parse(fileData);

    const rootIndex = this._stylesheetParsed.stylesheet.rules
      .findIndex((rule) => (rule.type === 'rule') && (rule.selectors.includes(':root')));
    this._root = this._stylesheetParsed.stylesheet.rules[rootIndex];

    const { declarations } = this._root;
    declarations
      .map((item, index) => (item.type === 'comment') ? [ index, item.comment ] : null)
      .filter((e) => e)
      .forEach((item, index, array) => {
        let [ themeIndex, themeName ] = item;
        const params = {};
        const startIndex = themeIndex + 1;
        const endIndex = (array[index + 1]) ? array[index + 1][0] : declarations.length;
        themeName = themeName.trim();

        if (themeName.includes(' ')) { // можно будет запихать ещё что нибуть в конфиг...
          let profile;
          [ themeName, profile ] = themeName.split(' ');
          [ , profile ] = profile.split('=');
          params.profile = Number(profile);
        }

        this._themes[themeName] = {
          vars: declarations.slice(startIndex, endIndex),
          params
        };
      });
  }

  _syncSheet () {
    this._buildDeclarations();
    this.stylesheet = CSS.stringify(this._stylesheetParsed);
    // console.log(this.stylesheet);
  }

  _buildDeclarations () {
    const getStrParams = (obj) => (
      Object.keys(obj).length ? ` ${Object.keys(obj).map((k) => `${k}=${obj[k]}`).join(' ')}` : ''
    );

    this._root.declarations = Object.entries(this._themes)
      .filter(([ , items ]) => items.vars.length)
      .map(([ key, { vars, params } ]) => [
        {
          type: 'comment',
          comment: ` ${key + getStrParams(params)} `
        },
        ...vars
      ])
      .flat();
    // console.log(this._root.declarations);
  }
};
