/*
*  Credits: Powercord devs
*  Original:
*  https://github.com/powercord-org/powercord/blob/v2/src/Powercord/plugins/pc-moduleManager/components/manage/QuickCSS.jsx
*/

const { React, Flux, getModule, getModuleByDisplayName, i18n: { Messages } } = require('powercord/webpack');
const { AsyncComponent, Clickable, Tooltip, Icons: { Pin, Unpin, Close, ExternalLink } } = require('powercord/components');

const Reset = require('./icons/Reset');
const Save = require('./icons/Save');

const { scrollerBas, thin } = getModule([ 'scrollerBase' ], false);
const { backdrop } = getModule([ 'backdrop' ], false);
const { modal, inner } = getModule([ 'modal', 'inner' ], false);

const PlusAlt = getModuleByDisplayName('PlusAlt', false);
const Confirm = getModuleByDisplayName('ConfirmModal', false);
const HelpMessage = getModuleByDisplayName('HelpMessage', false);

// const Modals = getModuleByDisplayName('Modals', false);

const backdropStyle = {
  opacity: 0.85,
  backgroundColor: 'rgb(0, 0, 0)',
  zIndex: 1000,
  transform: 'translateZ(0px)'
};
const modalStyle = {
  opacity: 1,
  transform: 'scale(1) translateZ(0px)'
};


class SeparateWindow extends React.PureComponent {
  constructor (props) {
    super();

    this.ref = React.createRef();
    this.state = {
      modalThis: null,
      showReference: !props.getSetting('hideReferenceV1', false)
    };

    this._saveResizeHeight = global._.debounce(this._saveResizeHeight.bind(this), 500);
    this._handleResizeBegin = this._handleResizeBegin.bind(this);
    this._handleResizeEnd = this._handleResizeEnd.bind(this);
    this._handleResizeMove = this._handleResizeMove.bind(this);
    this.closeModal = this.closeModal.bind(this);
    this.openModal = this.openModal.bind(this);
  }

  componentWillUnmount () { // Just to be sure
    window.removeEventListener('mousemove', this._handleResizeMove);
    window.removeEventListener('mouseup', this._handleResizeEnd);
  }

  render () {
    return (
      <div
        className={[
          'powercord-quickcss', this.props.popout && 'popout', !this.props.popout && this.props.guestWindow && 'popped-out'
        ].filter(Boolean).join(' ')}
        style={{ '--editor-height': `${this.props.getSetting('mpm-height', 500)}px` }}
        // onKeyPress={({ nativeEvent: { code }, ctrlKey }) => {
        //   if (code === 'KeyS' && ctrlKey) {
        //     console.log('save');
        //     this.props.save();
        //   }
        // }}
        ref={this.ref}
      >

        {this.state.modalThis && // среда для модальных окон
          <>
            <div className={backdrop} style={backdropStyle} onClick={this.closeModal}/>
            <div className={modal} style={modalStyle}>
              <div className={inner} role="dialog" tabIndex="-1" aria-modal="true">
                {this.state.modalThis}
              </div>
            </div>
          </>
        }

        {!this.props.popout && this.props.guestWindow
          ? <div className='powercord-quickcss-popped'>{Messages.POWERCORD_QUICKCSS_POPPED_OUT}</div>
          : <>
            <div className='powercord-quickcss-header'>
              <div>
                <Tooltip text={Messages.MY_PALETTE_SAVE} position='right'>
                  <Clickable onClick={this.props.save} className='button'>
                    <Save/>
                  </Clickable>
                </Tooltip>
                <Tooltip text={Messages.MY_PALETTE_RESET} position='right'>
                  <Clickable onClick={() => this.openResetModal()} className='button'>
                    <Reset/>
                  </Clickable>
                </Tooltip>
                <Tooltip text={Messages.MY_PALETTE_SAVE_AS_REMIX} position='right'>
                  <Clickable onClick={() => this.props.saveAsProfile(this.openModal, this.closeModal)} className='button'>
                    <PlusAlt/>
                  </Clickable>
                </Tooltip>
              </div>
              <div>
                {this.props.popout &&
                    <Tooltip
                      text={this.props.windowOnTop ? Messages.POPOUT_REMOVE_FROM_TOP : Messages.POPOUT_STAY_ON_TOP}
                      position='left'
                    >
                      <Clickable
                        onClick={async () => {
                          const popoutModule = await getModule([ 'setAlwaysOnTop', 'open' ]);
                          popoutModule.setAlwaysOnTop('DISCORD_POWERCORD_PLUGIN_MY_PALETTE', !this.props.windowOnTop);
                        }}
                        className='button'
                      >
                        {this.props.windowOnTop ? <Unpin/> : <Pin/>}
                      </Clickable>
                    </Tooltip>}
                <Tooltip text={this.props.popout ? Messages.CLOSE_WINDOW : Messages.POPOUT_PLAYER} position='left'>
                  <Clickable
                    onClick={() => this.props.popout
                      ? getModule([ 'setAlwaysOnTop', 'open' ], false).close('DISCORD_POWERCORD_PLUGIN_MY_PALETTE')
                      : this.props.openPopout()}
                    className='button'
                  >
                    {this.props.popout ? <Close/> : <ExternalLink/>}
                  </Clickable>
                </Tooltip>
              </div>
            </div>
            <div className={`powercord-quickcss-editor children ${scrollerBas} ${thin}`}>

              { this.state.showReference &&
              <div className='reference'>
                <HelpMessage messageType={1}>
                  {Messages.MY_PALETTE_REFERENCE}
                </HelpMessage>
                <Clickable
                  onClick={() => this.setState(
                    { showReference: false },
                    () => this.props.updateSetting('hideReferenceV1', true)
                  )}
                  className='button'
                >
                  <Close/>
                </Clickable>
              </div>}

              {this.props.children({
                open: this.openModal,
                close: this.closeModal
              })}

            </div>
            {!this.props.popout && <div className='powercord-quickcss-resizer' onMouseDown={this._handleResizeBegin}/>}
          </>}
      </div>
    );
  }

  openResetModal () {
    this.openModal(() => (
      <Confirm
        confirmText={Messages.MY_PALETTE_CONFIRM}
        cancelText={Messages.CANCEL}
        header={Messages.MY_PALETTE_RESET}
        onConfirm={() => this.props.reset()}
        onClose={() => this.closeModal()}
        transitionState={1}
      >
        <div className='powercord-text'>
          {Messages.MY_PALETTE_DELETE_ALL_CHANGES}
        </div>
      </Confirm>
    ));
  }

  _handleResizeBegin () {
    window.addEventListener('mousemove', this._handleResizeMove);
    window.addEventListener('mouseup', this._handleResizeEnd);
  }

  _handleResizeEnd () {
    window.removeEventListener('mousemove', this._handleResizeMove);
    window.removeEventListener('mouseup', this._handleResizeEnd);
  }

  _handleResizeMove (e) {
    if (this.ref.current === null) {
      return; // внезапно может начать спамить ошибку, TODO рефакторинг
    }
    const height = e.clientY - this.ref.current.getBoundingClientRect().y;
    this.ref.current.setAttribute('style', `--editor-height: ${height}px`);
    this._saveResizeHeight(height);
  }

  _saveResizeHeight (height) {
    this.props.updateSetting('mpm-height', height);
  }

  closeModal () {
    this.setState({ modalThis: null });
  }

  openModal (component) {
    this.setState({ modalThis: component() });
  }
}

module.exports = AsyncComponent.from((async () => {
  const windowStore = await getModule([ 'getWindow' ]);
  return Flux.connectStores([ windowStore, powercord.api.settings.store ], () => ({
    guestWindow: windowStore.getWindow('DISCORD_POWERCORD_PLUGIN_MY_PALETTE'),
    windowOnTop: windowStore.getIsAlwaysOnTop('DISCORD_POWERCORD_PLUGIN_MY_PALETTE'),
    ...powercord.api.settings._fluxProps('my-palette')
  }))(SeparateWindow);
})());
