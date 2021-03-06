import React from 'react';
import { observer } from 'mobx-react';
import T from '~/ui/shared-components/T';

interface ZeroFilesProps {
    isRoot?: boolean; // means absolute FS root, volumes count as folders
}

@observer
export default class ZeroFiles extends React.Component<ZeroFilesProps> {
    render() {
        return (
            <div className="zero-files">
                {this.props.isRoot ? (
                    <React.Fragment>
                        <T k="title_zeroFiles" className="headline" />
                        <T k="title_zeroFilesSubtitle" />
                    </React.Fragment>
                ) : (
                    <T k="title_emptyFolder" className="headline" />
                )}

                <img
                    src="./static/img/illustrations/zero-files.svg"
                    className="illustration"
                    draggable={false}
                />
                <div className="instructions">
                    <T k="title_zeroFilesDescription" className="instructions">
                        {{
                            uploadMockButton: text => <span className="mock-button">{text}</span>
                        }}
                    </T>
                </div>
            </div>
        );
    }
}
