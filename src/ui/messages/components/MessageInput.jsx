const React = require('react');
const { IconMenu, MenuItem, Input, IconButton } = require('react-toolbox');
const { observable } = require('mobx');
const { observer } = require('mobx-react');
const { t } = require('peerio-translator');
const Snackbar = require('../../shared-components/Snackbar');
const EmojiPicker = require('emoji-mart').Picker;
const emojiStore = require('emoji-mart').store;
const emojione = require('emojione');
const User = require('../../../icebear').User;

emojione.ascii = true;

// this makes it impossible to have 2 MessageInput rendered at the same time
// for the sake of emoji picker performance.
// But we probably never want to render 2 inputs anyway.
let cachedPicker;
let currentInstance;

function onEmojiPicked(emoji) {
    currentInstance.onEmojiPicked(emoji);
}

@observer
class MessageInput extends React.Component {
    @observable text = '';
    @observable emojiPickerVisible = false;

    constructor() {
        super();
        currentInstance = this;
        if (!cachedPicker) {
            emojiStore.setNamespace(User.current.username);

            cachedPicker = (
                <EmojiPicker set="emojione"
                        onClick={onEmojiPicked}
                        title="Pick your emoji…"
                        emoji="point_up"
                        style={{ position: 'absolute', bottom: '75px', right: '75px' }}
                        color="#2C95CF"
                        perLine={11}
                        sheetSize={32}
                        backgroundImageFn={() => './static/img/emojis.png'}
                />
            );
        }
    }

    handleTextChange = newVal => {
        this.text = newVal;
        this.inputIsEmpty = !(this.text && this.text.trim().length > 0);
        this.messageInput.refs.wrappedInstance.handleAutoresize();
    };

    handleKeyPress = ev => {
        if (ev.key === 'Enter' && !ev.shiftKey && this.text.trim().length) {
            this.props.onSend(emojione.shortnameToUnicode(this.text));
            ev.preventDefault();
            this.handleTextChange('');
        }
    };

    setTextareaRef = (input) => {
        this.messageInput = input;
    };

    toggleEmojiPicker = () => {
        this.emojiPickerVisible = !this.emojiPickerVisible;
    };

    hideEmojiPicker = () => {
        this.emojiPickerVisible = false;
    };

    // getPicker() {
    //     if (!this.picker) {
    //         this.picker = (<EmojiPicker search onChange={this.onEmojiPicked}
    //                                     emojione={{ imageType: 'png', sprites: true }} />);
    //     }
    //     return this.picker;
    // }

    onEmojiPicked = (emoji) => {
        this.hideEmojiPicker();
        const pos = this.messageInput.refs.wrappedInstance.refs.input.selectionStart;
        const val = this.text;
        this.text = val.slice(0, pos) + emoji.colons + val.slice(pos);
        this.messageInput.refs.wrappedInstance.refs.input.focus();
    };

    render() {
        if (!this.props.show) return null;
        return (
            <div className="message-input">
                <Snackbar location="chat" priority="1" />
                <IconMenu icon="add_circle_outline">
                    <MenuItem value="share" caption="Share from files" disabled />
                    <MenuItem value="upload" caption="Upload to DM" disabled />
                </IconMenu>
                <Input multiline value={this.text} placeholder={t('enterYourMessage')}
                       onKeyPress={this.handleKeyPress} onChange={this.handleTextChange}
                       onFocus={this.hideEmojiPicker} ref={this.setTextareaRef} />
                <IconButton icon="mood" onClick={this.toggleEmojiPicker} />

                {this.text === ''
                    ? <IconButton icon="thumb_up" onClick={this.props.onAck} className="color-brand" />
                    : null }

                {this.emojiPickerVisible ? cachedPicker : null }
            </div>
        );
    }
}
module.exports = MessageInput;
