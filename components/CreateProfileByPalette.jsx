const { React, i18n: { Messages } } = require('powercord/webpack');
const { TextInput } = require('powercord/components/settings');

const Modal = require('./Modal');

module.exports = class CreateProfileByPalette extends React.PureComponent {
  constructor () {
    super();

    this._inputText = '';
    this.state = { errorModal: null };
  }

  render () {
    return (
      <Modal
        save={() => this._save()}
        close={() => this.props.close()}
        title={Messages.MY_PALETTE_NEW_REMIX}
      >
        <TextInput
          className='my-palette-TextInput'
          autoFocus={true}
          error={this.state.errorModal}
          onChange={(v) => this._inputText = v}
        >{Messages.MY_PALETTE_NAME_NEW_REMIX}</TextInput>
      </Modal>
    );
  }

  _save () {
    const { _inputText: text } = this;
    const castError = (msg) => {
      this.setState({
        errorModal: msg
      });
    };
    castError(null);

    if (text.length > 32) {
      castError(Messages.MY_PALETTE_NAME_LESS_CREATE_PROFILE);
      return;
    }
    if (text.length === 0) {
      castError(Messages.MY_PALETTE_GIVE_A_NAME);
      return;
    }
    this.props.save(text);
    this.props.close();
  }
};
