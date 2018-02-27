const React = require('react');
const { Menu, MenuItem, Divider } = require('~/peer-ui');
const { t } = require('peerio-translator');
const { getDataProps } = require('~/helpers/dom');

class FolderActions extends React.Component {
    render() {
        return (
            <Menu
                className="item-actions"
                icon="more_vert"
                position="bottom-right"
                onClick={this.props.onClick}
                disabled={this.props.disabled}
                {...getDataProps(this.props)}
            >
                {this.props.onShare
                    ? <MenuItem caption={t('button_share')}
                        icon="reply"
                        onClick={this.props.onShare}
                        className="reverse-icon"
                        disabled={this.props.shareDisabled}
                    />
                    : null
                }
                {this.props.moveable &&
                <MenuItem caption={t('button_move')}
                    customIcon="move"
                    onClick={this.props.onMove}
                />
                }
                <MenuItem caption={t('button_rename')}
                    icon="mode_edit"
                    onClick={this.props.onRename} />
                <Divider />
                <MenuItem caption={t('button_delete')}
                    icon="delete"
                    onClick={this.props.onDelete} />
            </Menu>
        );
    }
}

module.exports = FolderActions;
