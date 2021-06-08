/* eslint-disable no-use-before-define */
module.exports = class ThemesParser {
  static get themes () {
    return [ ...document.styleSheets ]
      .filter(filterSheet);

    function filterSheet ({ href, ownerNode: { id } }) {
      return (href && href.startsWith(window.location.origin)) || id.startsWith('theme-');
    }
  }

  static get discordTheme () {
    return document.documentElement.classList.contains('theme-dark') ? 'theme-dark' : 'theme-light';
  }

  static get themesVars () {
    return ThemesParser.themes
      .map(MapWithRules)
      .filter(filterVoidThemes)
      .reduce(styleSheetsToMap, new Map());


    function MapWithRules (sheet) {
      const { id } = sheet.ownerNode;
      const selector = (id) ? ':root' : `.${ThemesParser.discordTheme}`;
      const key = (id) ? sheet.ownerNode.id : `discord-${ThemesParser.discordTheme}`;

      return {
        [key]: [ sheet ]
          .reduce((...args) => getRules(selector, ...args), [])
          .reduce((Map, arr) => Map.set(...arr), new Map())
      };

      function getRules (selector, acc, { cssRules }) {
        return acc.concat(
          [ ...cssRules ]
            .filter(({ selectorText }) => (selectorText) ? selectorText.includes(selector) : null)
            .reduce(getRule, [])
        );

        function getRule (acc, { style }) {
          return acc.concat(
            [ ...style ]
              .filter((prop) => prop.startsWith('--'))
              .map((prop) => [
                prop.trim().substring(2),
                style.getPropertyValue(prop).trim()
              ])
          );
        }
      }
    }

    function filterVoidThemes (obj) {
      const [ key ] = Object.keys(obj);
      return obj[key].size;
    }

    function styleSheetsToMap (Map, elem) {
      const [ key ] = Object.keys(elem);
      return Map.set(key, elem[key]);
    }
  }
};
