const React = require('react');
const { observable } = require('mobx');
const { observer } = require('mobx-react');
const { Button, Dialog } = require('~/react-toolbox');
const { t } = require('peerio-translator');
const version = require('electron').remote.app.getVersion();
const Terms = require('~/ui/shared-components/Terms');
const urls = require('~/config').translator.urlMap;

@observer
class About extends React.Component {
    @observable termsDialogOpen = false;

    hideTermsDialog = () => {
        this.termsDialogOpen = false;
    };

    showTermsDialog = () => {
        this.termsDialogOpen = true;
    };


    render() {
        const termsDialogActions = [
            { label: t('button_ok'), onClick: this.hideTermsDialog }
        ];
        return (
            <div>
                <section className="section-divider">
                    <img alt="" className="logo" src="static/img/logo-blue.png" />
                    <p>
                        {t('title_version')} <strong>{version}</strong>
                    </p>

                </section>

                <section>
                    <div className="title">{t('title_help')}</div>
                    <p>
                        {t('title_helpText')}
                        {/* Other users can find you... */}
                    </p>
                    <div className="flex-row">
                        <Button href={urls.helpCenter} label={t('button_HC')} flat primary />
                        <Button href={urls.contactSupport} label={t('button_contact')} flat primary />
                    </div>
                </section>
                <section>
                    &copy; 2017 Peerio Technologies, Inc. All rights reserved.
                    <br /><br />
                    {t('title_appName')} <Button onClick={this.showTermsDialog} label={t('button_terms')} />
                </section>

                <Dialog active={this.termsDialogOpen}
                        actions={termsDialogActions}
                        onOverlayClick={this.hideTermsDialog}
                        onEscKeyDown={this.hideTermsDialog}
                        className="terms">
                    <Terms />
                </Dialog>
            </div>
        );
    }
  }

module.exports = About;
