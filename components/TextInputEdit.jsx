const { React, getModule, getModuleByDisplayName, i18n: { Messages } } = require('powercord/webpack');
const { Tooltip, Clickable } = require('powercord/components');

const { input } = getModule([ 'input' ], false);
const { h4, h5, defaultMarginh5 } = getModule([ 'h5', 'h4' ], false);
const Pencil = getModuleByDisplayName('Pencil', false);

const Modal = require('./Modal');
const ColorPicker = require('./TextInputEditColorPicker');
const Size = require('./TextInputEditSize');

const { isValid } = require('../utils/types');

/* eslint-disable no-use-before-define */
class TextInputWithEdit extends React.PureComponent {
  constructor (props) {
    super(props);
    this.delayInput = makeDelay(500);
    this.state = {
      input: null
    };

    this._openEdit = this._openEdit.bind(this);
  }

  render () {
    return (
      <div className='my-palette-input'>
        <div>
          <h5 className={`${h4} ${h5} ${defaultMarginh5}`}>{this.props.children}</h5>
          <div className={`input-wrap ${input}`}>
            <input
              tabIndex={1}
              type='text'
              value={(this.state.input === null) ? (this.props.value || this.props.defaultValue) : this.state.input}
              onChange={({ target: { value } }) => {
                this.setState({ input: value });
                this.delayInput(() => {
                  if (isValid(this.props.subType, value)) {
                    this.props.change(value);
                  }
                });
              }}
              onBlur={({ currentTarget, relatedTarget }) => {
                if (!currentTarget.contains(relatedTarget)) {
                  this.setState({ input: null });
                }
              }}
            />
            <Tooltip text={Messages.EDIT}>
              <Clickable className='button' onClick={this._openEdit}>
                <Pencil/>
              </Clickable>
            </Tooltip>
          </div>
          {/* <div className={`${description} ${formText}`}>{this.props.note}</div>*/}
        </div>
        { (this.props.type === 'color') &&
          <div
            className='color-preview'
            style={{ '--color': this.props.value || this.props.defaultValue }}
            onClick={this._openEdit}
          />
        }
      </div>
    );
  }

  _openEdit () {
    this.props.modal.open(() => React.createElement(EditModal, this.props));
  }
}

/* eslint-disable object-property-newline */
class EditModal extends React.PureComponent {
  render () {
    return (
      <Modal
        save={() => this._save()}
        close={() => this.props.modal.close()}
        title={Messages.EDIT}
      >
        { this.renderContent() }
      </Modal>
    );
  }

  renderContent () {
    const { defaultValue, value, isCssVar, subType: type, settings } = this.props;
    const convertBack = (callback) => this.getFromChild = callback;
    const props = { type, value, isCssVar, settings, convertBack, defaultValue };

    const modes = {
      color: React.createElement(ColorPicker, props),
      size: React.createElement(Size, props),
      default: Messages.MY_PALETTE_UNKNOWN
    };

    if (this.props.type in modes) {
      return modes[this.props.type];
    }
    return modes.default;
  }

  _save () {
    if (typeof this.getFromChild === 'function') {
      this.props.change(this.getFromChild());
    }
    this.props.modal.close();
  }
}


function makeDelay (ms) {
  let timer = 0;
  return function (callback) {
    clearTimeout(timer);
    timer = setTimeout(callback, ms);
  };
}

module.exports = TextInputWithEdit;
