const { getModule } = require('powercord/webpack');
const discordUtils = getModule([ 'isValidHex', 'getDarkness' ], false);

module.exports = class ColorUtils {
  static hex2int (hex) {
    return discordUtils.hex2int(hex);
  }

  static hex2rgb (hex) {
    return discordUtils.hex2rgb(hex);
  }

  static isValidHex (hex) {
    return discordUtils.isValidHex(hex);
  }


  static rgb2int (rgb) {
    return this.rgba2int(rgb);
  }


  static rgba2int (rgba) {
    const [ red, green, blue, alpha ] = rgba
      .replace(/rgba?\((.+?)\)/, '$1')
      .split(', ')
      .map(Number);

    return (alpha * 225 << 24) + (red << 16) + (green << 8) + blue;
  }


  static int2hex (int) {
    return discordUtils.int2hex(int);
  }

  static int2rgba (int, alpha = 1) {
    return discordUtils.int2rgba(int, alpha);
  }

  static int2rgb (int) {
    return this.int2rgba(int, 666)
      .replace('rgba', 'rgb')
      .replace(', 666', '');
  }

  static int2hsv (int) { // навсяк
    return discordUtils.int2hsv(int);
  }


  static isColor (color) {
    const { style } = new Option();
    style.color = color;
    return (style.color === color);
  }
};
