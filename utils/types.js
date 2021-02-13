
const regexes = {
  color: {
    hex: /^#.+/,
    rgba: /^rgba\(.+\)/,
    rgb: /^rgb\(.+\)/
  },
  size:{
    abs: /.*\s?px$/,
    rlt: /.*\s?%$/
  },
  global: {
    cssVar: /var\(--.+?\)/
  },
  url: /url\(.+\)/
};

function isValidColor (str) {
  const style = new Option();
  style.color = str;
  return (style.color === str);
}

function getType (v) {
  for (const [ keyType, valueType ] of Object.entries(regexes)) {
    if (valueType.constructor === Object) {
      for (const [ keySubType, regexSubType ] of Object.entries(valueType)) {
        if (regexSubType.test(v)) {
          return [ keyType, keySubType ];
        }
      }
    } else if (valueType.test(v)) {
      return [ null, keyType ];
    }
  }
  return [ null, null ];
}

function isValid (subType, value) {
  for (const [ keyType, valueType ] of Object.entries(regexes)) {
    if (valueType.constructor === Object) {
      for (const [ keySubType, regexSubType ] of Object.entries(valueType)) {
        if ((keySubType === subType) && regexSubType.test(value)) {
          return true;
        }
      }
      if ((keyType === 'color') && isValidColor(value)) {
        return true;
      }
      return regexes.global.cssVar.test(value);
    } else if ((valueType === subType) && valueType.test(value)) {
      return true;
    }
  }
  return true; // неизвестный тип, чтобы не блокировать ввод
}

module.exports = {
  getType,
  isValid
};
