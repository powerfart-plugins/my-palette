const { React, i18n: { Messages } } = require('powercord/webpack');
const { FormTitle, Button } = require('powercord/components');
const { Modal } = require('powercord/components/modal');

module.exports = class MyPaletteModal extends React.PureComponent {
  render () {
    const { title, children, save, close } = this.props;

    return (
      <Modal className="powercord-text my-palette-modal" size={Modal.Sizes.SMALL}>
        <Modal.Header>
          <FormTitle tag="h4">{title}</FormTitle>
          <Modal.CloseButton onClick={() => close()}/>
        </Modal.Header>
        <Modal.Content>
          { children }
        </Modal.Content>
        <Modal.Footer>
          <Button onClick={() => save()}>
            {Messages.SAVE}
          </Button>
        </Modal.Footer>
      </Modal>
    );
  }
};
