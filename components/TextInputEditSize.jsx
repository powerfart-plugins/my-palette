const { React, i18n: { Messages } } = require('powercord/webpack');
const { RadioGroup, SliderInput } = require('powercord/components/settings');

/* eslint-disable object-property-newline */
module.exports = class EditColorPicker extends React.PureComponent { // TODO сброс до дефолта
  constructor (props) {
    super(props);

    const { value, defaultValue, isCssVar, convertBack } = props;

    convertBack(() => this.convert());
    this.state = {
      saveAs: props.type,
      selectedNumbers: (value) ? this._discharges(value) : this._discharges(defaultValue)
    };
  }

  render () {
    return (
      <div className='color-picker-wrap'>
        <RadioGroup
          options={[
            { name: Messages.MY_PALETTE_ABSOLUTE, value: 'abs' },
            { name: Messages.MY_PALETTE_RELATIVE, value: 'rlt' }
          ]}
          value={this.state.saveAs}
          onChange={({ value }) => {
            this.setState({ saveAs: value });
          }}
        >
          {Messages.MY_PALETTE_SAVE_FORMAT}
        </RadioGroup>
        {(this.state.saveAs === 'abs') && this.renderSliders(3, 'px')}
        {(this.state.saveAs === 'rlt') && this.renderSliders(2, '%', [ 10, 11 ])}
      </div>
    );
  }

  renderSliders (numSliders, endMarker, arraySizes = 10) {
    return (
      Array.from({ length: numSliders }, (_, intIndex) => {
        const int = 10 ** intIndex;
        return (
          <SliderInput
            stickToMarkers
            keyboardStep= {1}
            onMarkerRender={(e) => `${e * int}${endMarker}`}
            initialValue={ this.state.selectedNumbers[intIndex] * int || 0 }
            markers={Array.from(
              { length: Array.isArray(arraySizes) ? arraySizes[intIndex] : arraySizes },
              (e, i) => i)
            }
            onValueChange={(v) =>
              this.setState((prevState) => {
                const selectedNumbers = [ ...prevState.selectedNumbers ];
                selectedNumbers[intIndex] = v;
                return { selectedNumbers };
              })}
          />
        );
      })
    );
  }

  _discharges (v) {
    return v
      .replace(/(\d*).*/, '$1')
      .split('')
      // .reverse()
      .map(Number);
  }

  convert () {
    const sn = this.state.selectedNumbers;
    const total = [ ...Array.from({ length: sn.length }, (_, i) => sn[i] * (10 ** i) || 0) ]
      .reduce((acc, e) => acc + e, 0);

    return total + ((this.state.saveAs === 'abs') ? 'px' : '%');
  }
};
