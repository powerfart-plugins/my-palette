const { React, i18n: { Messages } } = require('powercord/webpack');
const { Clickable } = require('powercord/components');
const { getThemes } = require('../utils/themesParser');

const MSG_REGEX = /```(?:s?css)\n?([\s\S]*)```/;

module.exports = class SnippetButton extends React.Component {
  constructor () {
    super();
    this.state = {
      notFound: false,
      isInstalled: false
    };
  }

  render () {
    return (
      <div className='powercord-snippet-apply'>
        <Clickable onClick={() => this._chpock()}>
          {
            (this.state.notFound)
              ? Messages.MY_PALETTE_THEME_NOT_FOUND
              : ((this.state.isInstalled) ? Messages.MY_PALETTE_INSTALLED : Messages.MY_PALETTE_ADD_REMIX)
          }
        </Clickable>
      </div>
    );
  }

  async _chpock () {
    if (this.state.notFound && this.state.isInstalled) {
      return;
    }
    const { message: { content, id: msgID, author }, Config, Profiles } = this.props;
    const msg = MSG_REGEX.exec(content);
    const userThemes = [
      'discord-theme-dark', 'discord-theme-light',
      ...getThemes()
        .filter((e) => e.ownerNode.id)
        .map((e) => e.ownerNode.id)
    ];

    if (!msg && !Profiles.isValidProfileString(msg[1])) {
      console.log('error');
      return;
    }

    const [ name, key, vars ] = Profiles.parse(msg[1]);
    if (!userThemes.includes(key)) {
      this.setState({
        notFound: true
      });
      return;
    }
    if (Profiles.has(key, msgID)) {
      this.setState({
        isInstalled: true
      });
      return;
    }

    const pIndex = Profiles.add(key, {
      name,
      msgID,
      creator: author.id,
      vars
    });
    Config.setParam(key, 'profile', pIndex);
    Config.applyVars(key, vars);
    Config.save();

    this.setState({
      isInstalled: true
    });
  }
};
