const { React, getModuleByDisplayName, constants: { DEFAULT_ROLE_COLOR, ROLE_COLORS }, i18n: { Messages } } = require('powercord/webpack');
const { Divider, settings: { ColorPickerInput, RadioGroup, CheckboxInput } } = require('powercord/components');

const { ColorUtils } = require('../utils');

const HelpMessage = getModuleByDisplayName('HelpMessage', false);

/* eslint-disable object-property-newline */
module.exports = class EditColorPicker extends React.PureComponent {
  constructor (props) {
    super(props);

    const { value, defaultValue, isCssVar, convertBack, settings: { get, update } } = props;

    if (!get('lastSelectedColors', null)) {
      update('lastSelectedColors', ROLE_COLORS);
    }
    convertBack(() => this.convert());
    this.state = {
      checkbox: null,
      saveAs: get('defaultColorType', props.type),
      selectedColor: (value)
        ? this._getIntColor(value)
        : ((isCssVar) ? DEFAULT_ROLE_COLOR : this._getIntColor(defaultValue))
    };
  }

  render () {
    const { settings: { get, update }, isCssVar, type, defaultValue } = this.props;
    const saveAsDefault = get('defaultColorType', null);
    const colors = get('lastSelectedColors', ROLE_COLORS);

    return (
      <div className='color-picker-wrap'>
        <RadioGroup
          options={[
            { name: 'HEX', value: 'hex' },
            { name: 'RGB', value: 'rgb' },
            { name: 'RGBA', value: 'rgba' }
          ]}
          value={this.state.saveAs}
          onChange={({ value }) => {
            this.setState({
              saveAs: value,
              checkbox: (value === saveAsDefault)
            });
          }}
        >
          {Messages.MY_PALETTE_SAVE_FORMAT}
        </RadioGroup>
        { ((type !== this.state.saveAs) || saveAsDefault) &&
            <CheckboxInput
              value={this.state.checkbox}
              onChange={() => {
                const disable = (this.state.saveAs === saveAsDefault);
                update('defaultColorType', ((disable) ? null : this.state.saveAs));
                this.setState({ checkbox: !disable });
              }}
            >{Messages.DEFAULT}</CheckboxInput>
        }
        <ColorPickerInput
          default={(isCssVar) ? DEFAULT_ROLE_COLOR : this._getIntColor(defaultValue)}
          value={this.state.selectedColor}
          defaultColors={colors}
          onChange={(selectedColor) => this.setState({ selectedColor })}
        />

        { (this.state.saveAs === 'rgba') && <>
          <HelpMessage
            children={Messages.MY_PALETTE_BAD_SUPPORT_RGBA}
            messageType={0}
          />
          <Divider/>
        </>}
      </div>
    );
  }

  convert () {
    const { selectedColor } = this.state;
    let value = this._getNotIntColor(selectedColor);

    if (this.props.isCssVar && (selectedColor === DEFAULT_ROLE_COLOR)) {
      value = null;
    }
    if (value === this.props.defaultValue) {
      value = null;
    }

    this._updateUserPalette(selectedColor, value);
    return value;
  }

  async _updateUserPalette (color, v) {
    const colors = this.props.settings.get('lastSelectedColors', ROLE_COLORS);

    if (colors.includes(color) && (v === null)) {
      return;
    }
    this.props.settings.update('lastSelectedColors', [ color, ...colors.slice(0, colors.length - 1) ]);
  }

  _getIntColor (str) {
    const { type } = this.props;

    if (type === 'hex') {
      return ColorUtils.hex2int(str);
    }
    if (type === 'rgba') {
      return ColorUtils.rgba2int(str);
    }
    if (type === 'rgb') {
      return ColorUtils.rgb2int(str);
    }
  }

  _getNotIntColor (int) {
    const { saveAs } = this.state;

    if (saveAs === 'hex') {
      return ColorUtils.int2hex(int);
    }
    if (saveAs === 'rgba') {
      return ColorUtils.int2rgba(int);
    }
    if (saveAs === 'rgb') {
      return ColorUtils.int2rgb(int);
    }
  }
};
