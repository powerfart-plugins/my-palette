const { React, getModule, getModuleByDisplayName, i18n: { Messages } } = require('powercord/webpack');
const { open: openModal, close: closeModal } = require('powercord/modal');
const {
  Clickable, Tooltip,
  modal: { Confirm },
  settings: { RadioGroup, TextInput },
  Icons: { Copy, Bin }
} = require('powercord/components');

const Modal = require('./Modal');

const { getUser } = getModule([ 'getUser' ], false);
const PlusAlt = getModuleByDisplayName('PlusAlt', false);

/* eslint-disable no-use-before-define */
class Profiles extends React.PureComponent {
  render () {
    let { profiles, theme } = this.props;
    if (!profiles) {
      profiles = [];
    }

    return (
      <RadioGroup
        options={profiles.map((item, index) => ({
          name: <ProfileItem
            data={item}
            copy={() => this.props.onCopy(index)}
            remove={(v) => this.openConfirmRemove(item.name, v)}
          />,
          value: index
        }))}
        value={theme.params.profile}
        onChange={({ value: selected }) => {
          this.setState({ selected }, () => this.props.onChange(selected));
        }}
      >
        <div className='my-palette-profiles-head'>
          <div>{Messages.MY_PALETTE_REMIXES}</div>
          <Tooltip text={Messages.ADD}>
            <Clickable onClick={() => this.openAddModal()}>
              <PlusAlt/>
            </Clickable>
          </Tooltip>
        </div>
      </RadioGroup>
    );
  }

  openConfirmRemove (name, v) {
    openModal(() => (
      <Confirm
        confirmText={Messages.REMOVE}
        cancelText={Messages.CANCEL}
        header={Messages.MY_PALETTE_REMOVE_REMIX}
        onConfirm={() => this.props.onRemove(v)}
      >
        <div className='powercord-text'>
          {`${Messages.REMOVE} "${name}" ?`}
        </div>
      </Confirm>
    ));
  }

  openAddModal () {
    const { isValid, add } = this.props;
    openModal(() => (
      // eslint-disable-next-line object-property-newline
      React.createElement(ProfileModalInput, { isValid, add })
    ));
  }
}

class ProfileItem extends React.PureComponent {
  constructor (props) {
    super(props);
    this.state = { user: {} };

    if (props.data.creator) {
      getUser(props.data.creator)
        .then((user) => this.setState({ user }))
        .catch(console.error);
    }
  }

  render () {
    const { username, discriminator } = this.state.user;

    return (
      <div className='my-palette-profile-item'>
        <div className='title'>
          <span>{this.props.data.name}</span>
          {username && <p>by {username}#{discriminator}</p>}
        </div>
        <div className='buttons'>
          <Tooltip text={Messages.COPY}>
            <Clickable onClick={(e) => {
              e.stopPropagation();
              this.props.copy();
            }}>
              <Copy width={20}/>
            </Clickable>
          </Tooltip>
          <Tooltip text={Messages.REMOVE}>
            <Clickable onClick={(e) => {
              e.stopPropagation();
              this.props.remove();
            }}>
              <Bin width={25}/>
            </Clickable>
          </Tooltip>
        </div>
      </div>
    );
  }
}

class ProfileModalInput extends React.PureComponent {
  constructor () {
    super();

    this._inputText = null;
    this.useForceAdd = false;
    this.state = { errorModal: null };
  }

  render () {
    return (
      <Modal
        save={() => this._save()}
        close={closeModal}
        title={Messages.MY_PALETTE_NEW_REMIX}
      >
        <TextInput
          className='my-palette-TextInput'
          error={this.state.errorModal}
          onChange={(v) => this._inputText = v}
          autoFocus={true}
        >{Messages.MY_PALETTE_ADD_REMIX}</TextInput>
      </Modal>
    );
  }

  _save () {
    const { useForceAdd, _inputText: input, props: { isValid, add } } = this;

    if (isValid(input)) {
      const isAdded = add(input, useForceAdd);

      if (!isAdded && !useForceAdd) {
        this.setState({
          errorModal: Messages.MY_PALETTE_NOT_SELF_THEME
        });
        this.useForceAdd = true;
        return;
      }

      closeModal();
    } else {
      this.setState({
        errorModal: Messages.MY_PALETTE_INVALID_REMIX
      });
    }
  }
}

module.exports = Profiles;
