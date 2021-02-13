const { clipboard } = require('electron');
const { writeFile, readFile } = require('fs').promises;
const { join } = require('path');

const filePath = join(__dirname, '..', 'profiles.json');
const PROFILE_REGEX = /^(```css\s)?\/\*\s?(.+?)\s\((.+?)\)\s?\*\/\s+(.+?:\s[^`]+;?\s?)+?(```)?$/;


module.exports = class MyPaletteProfilesHandler {
  constructor () {
    this._profiles = null;
  }

  load () {
    readFile(filePath, 'utf8')
      .then((file) => this._profiles = JSON.parse(file))
      .catch(console.error);
  }

  getByThemeKey (key) {
    if (key in this._profiles) {
      return this._profiles[key];
    }
    return null;
  }

  copy (theme, index) {
    const profile = this._profiles[theme][index];
    const content = `css\n/* ${profile.name} (${theme}) */\n\n${profile.vars}`;
    clipboard.write({ text: `\`\`\`${content}\`\`\`` });
  }

  remove (theme, index) {
    this._profiles[theme].splice(index, 1);
    if (!this._profiles[theme].length) {
      delete this._profiles[theme];
    }
    this._save();
  }

  /**
   * @return Number index theme
   */
  add (themeName, item) {
    if (!(themeName in this._profiles)) {
      this._profiles[themeName] = [];
    }
    this._profiles[themeName].push(item);
    this._save();
    return this._profiles[themeName].length - 1;
  }

  /**
   * @return Array [PaletteName, ThemeName, Vars]
   */
  parse (str) {
    const a = PROFILE_REGEX.exec(str);
    if (a) {
      return a.slice(2, 5);
    }
    return a;
  }

  isValidProfileString (str) {
    return PROFILE_REGEX.test(str);
  }

  has (key, id) {
    if (!(key in this._profiles)) {
      return false;
    }
    return this._profiles[key].find((e) => e.msgID === id);
  }


  _save () {
    writeFile(filePath, JSON.stringify(this._profiles, null, 2))
      .catch(console.error);
  }
};
