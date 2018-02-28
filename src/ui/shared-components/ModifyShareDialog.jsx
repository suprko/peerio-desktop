const React = require('react');
const { observable, computed, action } = require('mobx');
const { observer } = require('mobx-react');
const { Avatar, Dialog, List, ListItem, Button } = require('~/peer-ui');
const T = require('~/ui/shared-components/T');
const { t } = require('peerio-translator');
const { getContactByEvent } = require('~/helpers/icebear-dom');

/**
 * onSelectContact
 * onSelectChannel
 */
@observer
class ModifyShareDialog extends React.Component {
    @observable visible = false;

    @computed get contacts() {
        return this.props.contacts;
    }

    @action.bound async onContactClick(ev) {
        const contact = await getContactByEvent(ev);
        this.selectedUsers.set(contact.username, contact);
    }

    renderContact = (c) => {
        // caption={c.username}
        // legend={c.fullName}

        return (
            <div data-username={c.username} key={c.username}>
                <ListItem
                    leftContent={<Avatar key="a" contact={c} size="small" />}
                    onClick={this.onContactClick}
                    rightContent="">
                    <span className="full-name">{c.fullName}</span>
                    <span className="username">@{c.username}</span>
                </ListItem>
            </div>
        );
    }

    @action.bound show() {
        this.visible = true;
        return new Promise(resolve => { this.resolve = resolve; });
    }

    @action.bound close() {
        this.visible = false;
        this.resolve(null);
        this.resolve = null;
    }

    @action.bound share() {
        // TODO: this may be different is the dialog invoked
        // from different circumstances
        this.close();
    }

    render() {
        if (!this.visible) return false;
        const dialogActions = [
            { label: t('button_cancel'), onClick: this.close },
            { label: t('button_save'), onClick: this.close }
        ];

        return (
            <Dialog active noAnimation
                className="share-with-dialog share-folder modify-shared-with"
                actions={dialogActions}
                onCancel={this.close}
                title={t('title_sharedWith')}>
                <div className="share-with-contents">
                    <div className="chat-list-container">
                        <div className="list-dms-container">
                            <div className="p-list-heading">
                                <T k="title_contacts" />
                            &nbsp;({this.contacts.length})
                            </div>
                            <List className="list-chats list-dms" clickable>
                                {this.contacts.map(this.renderContact)}
                            </List>
                        </div>
                    </div>
                    <div className="receipt-wrapper">
                        <Button icon="person_add" label={t('title_shareWithOthers')} onClick={this.share} />
                    </div>
                </div>
            </Dialog>
        );
    }
}

module.exports = ModifyShareDialog;
