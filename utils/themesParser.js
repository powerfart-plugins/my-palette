const getDiscordTheme = () => (
  document.documentElement.classList.contains('theme-dark') ? 'theme-dark' : 'theme-light'
);

const filterSheet = ({ href, ownerNode: { id } }) => (
  (href && href.startsWith(window.location.origin)) || id.startsWith('theme-')
);

const getRule = (acc, { style }) => acc.concat(
  [ ...style ]
    .filter((prop) => prop.startsWith('--'))
    .map((prop) => [
      prop.trim().substring(2),
      style.getPropertyValue(prop).trim()
    ])
);

const getRules = (selector, acc, { cssRules }) => acc.concat(
  [ ...cssRules ]
    .filter(({ selectorText }) => (selectorText) ? selectorText.includes(selector) : null)
    .reduce(getRule, [])
);

const MapWithRules = (sheet) => {
  const { id } = sheet.ownerNode;
  const discordTheme = getDiscordTheme();
  const selector = (id) ? ':root' : `.${discordTheme}`;
  const key = (id) ? sheet.ownerNode.id : `discord-${discordTheme}`;

  return {
    [key]: [ sheet ]
      .reduce((...args) => getRules(selector, ...args), [])
      .reduce((Map, arr) => Map.set(...arr), new Map())
  };
};

const filterVoidThemes = (obj) => {
  const [ key ] = Object.keys(obj);
  return obj[key].size;
};

const styleSheetsToMap = (Map, elem) => {
  const [ key ] = Object.keys(elem);
  return Map.set(key, elem[key]);
};

function getThemes () {
  return [ ...document.styleSheets ]
    .filter(filterSheet);
}

function getThemesVars () {
  return getThemes()
    .map(MapWithRules)
    .filter(filterVoidThemes)
    .reduce(styleSheetsToMap, new Map());
}

module.exports = {
  getThemes,
  getThemesVars
};
