const React = require('react');
const { observable } = require('mobx');
const { observer } = require('mobx-react');
const { Dialog } = require('~/react-toolbox');
const { t } = require('peerio-translator');
const { User } = require('~/icebear');

@observer
class ChannelUpgradeDialog extends React.Component {
    @observable showDialog = false;

    show() {
        this.showDialog = true;
    }

    render() {
        const hide = () => (this.showDialog = false);
        const dialogActions = [
            { label: t('button_cancel'), onClick: hide },
            {
                label: t('button_upgrade'),
                onClick: () => {
                    console.log('Upgrade clicked');
                    hide();
                }
            }
        ];
        const limit = User.current ? User.current.channelLimit : 0;

        return (
            <Dialog
                active={this.showDialog}
                actions={dialogActions}
                onOverlayClick={hide}
                onEscKeyDown={hide}
                title={t('title_limitDialog')}
                className="dialog-warning">
                <p>{t('title_limitDialogText1', { limit })}</p>
                <br />
                <p>{t('title_limitDialogText2')}</p>
            </Dialog>
        );
    }
}

module.exports = ChannelUpgradeDialog;