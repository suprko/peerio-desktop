const React = require('react');
const { fileStore } = require('peerio-icebear');
const { observer } = require('mobx-react');
const { observable, computed, action } = require('mobx');
const { Dialog, ProgressBar } = require('~/react-toolbox');
const FileLine = require('./FileLine');
const FolderLine = require('./FolderLine');
const uiStore = require('../../../stores/ui-store');
const Search = require('~/ui/shared-components/Search');
const Breadcrumb = require('./Breadcrumb');
const { t } = require('peerio-translator');
const { getFolderByEvent, getFileByEvent } = require('~/helpers/icebear-dom');

const DEFAULT_RENDERED_ITEMS_COUNT = 15;

@observer
class FilePicker extends React.Component {
    @observable currentFolder = fileStore.folders.root;

    @observable renderedItemsCount = DEFAULT_RENDERED_ITEMS_COUNT;
    pageSize = DEFAULT_RENDERED_ITEMS_COUNT;

    componentWillUnmount() {
        fileStore.clearFilter();
    }

    checkScrollPosition = () => {
        console.log('check scroll position');
        if (!this.container) return;
        if (this.renderedItemsCount >= this.items.length) {
            this.renderedItemsCount = this.items.length;
            return;
        }

        const distanceToBottom = this.container.scrollHeight - this.container.scrollTop - this.container.clientHeight;
        if (distanceToBottom < 250) {
            this.renderedItemsCount += this.pageSize;
        }
    };

    enqueueCheck = () => {
        window.requestAnimationFrame(this.checkScrollPosition);
    };

    setScrollerRef = ref => {
        if (!ref) return;
        const node = ref.querySelector('ul.file-picker-scroll-container');
        if (this.container === node) return;
        if (!node) return;
        node.addEventListener('scroll', this.enqueueCheck, false);
        node.scrollListener = true;
        this.container = node;
    }

    handleClose = () => {
        fileStore.clearSelection();
        this.props.onClose();
    };

    handleShare = () => {
        const selected = fileStore.getSelectedFiles();
        if (!selected.length) return;
        this.props.onShare(selected);
    };

    handleSearch = val => {
        if (val === '') {
            fileStore.clearFilter();
            return;
        }
        fileStore.filterByName(val);
    };

    get breadCrumbsHeader() {
        return (
            <Breadcrumb currentFolder={this.currentFolder} noActions
                onSelectFolder={this.changeFolder} />
        );
    }

    get searchResultsHeader() {
        return (
            <div className="search-results-header">
                {t('title_searchResults')}
            </div>
        );
    }

    @computed get items() {
        return fileStore.currentFilter ?
            fileStore.visibleFilesAndFolders
            : this.currentFolder.foldersAndFilesDefaultSorting;
    }

    render() {
        const actions = [
            { label: t('button_cancel'), onClick: this.handleClose },
            {
                label: t('button_share'),
                onClick: this.handleShare,
                primary: true,
                disabled: !fileStore.hasSelectedFiles
            }
        ];

        const { currentFolder } = uiStore;
        const items = [];
        const data = this.items;
        for (let i = 0; i < this.renderedItemsCount && i < data.length; i++) {
            const f = data[i];
            items.push(f.isFolder ?
                <FolderLine
                    key={f.folderId}
                    folder={f}
                    onChangeFolder={this.changeFolder}
                    checkboxPlaceholder
                /> :
                <FileLine
                    key={f.fileId}
                    file={f}
                    currentFolder={currentFolder}
                    checkbox
                    selected={f.selected}
                    onToggleSelect={this.toggleSelect}
                    clickToSelect
                />);
        }

        return (
            <Dialog title={t('title_shareFromFiles')}
                className="file-picker"
                actions={actions}
                active={this.props.active}
                onEscKeyDown={this.handleClose}
                onOverlayClick={this.handleClose}>
                {!fileStore.loading && this.props.active ?
                    <div ref={this.setScrollerRef} className="file-picker-body">
                        <Search onChange={this.handleSearch} query={fileStore.currentFilter} />
                        {fileStore.currentFilter ? this.searchResultsHeader : this.breadCrumbsHeader}
                        <div className="file-table-wrapper">
                            <div className="file-table-body">
                                {items}
                            </div>
                        </div>
                    </div> : null}
                {fileStore.loading && this.renderLoader()}
            </Dialog>
        );
    }

    renderLoader() {
        return (
            <div className="text-center">
                <ProgressBar type="linear" mode="indeterminate" />
            </div>
        );
    }

    @action.bound changeFolder(ev) {
        const folder = getFolderByEvent(ev);
        this.currentFolder = folder;
        fileStore.clearFilter();
    }

    @action.bound toggleSelect(ev) {
        const file = getFileByEvent(ev);
        file.selected = !file.selected;
    }
}


module.exports = FilePicker;
