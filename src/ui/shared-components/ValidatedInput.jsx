import React, { Component } from 'react';
import css from 'classnames';
import _ from 'lodash';
import { computed, reaction, when, isObservableProp, observable, action } from 'mobx';
import { observer } from 'mobx-react';

import { socket, t } from 'peerio-icebear';
import { Input } from 'peer-ui';

import OrderedFormStore from '~/stores/ordered-form-store';
import * as telemetry from '~/telemetry';

/**
 * Component meant to live inside a form with a store.
 *
 * Given a store (OrderedFormStore) with observable x, and configuring ValidatedInput
 * with name=x and some validator (and any additional properties desired), this
 * component will take care of validating the input on change and blur.
 * It will also create the following observables in the store:
 * - ${x}Valid
 * - ${x}Dirty
 *
 * .. for use outside of the ValidatedInput component (e.g. for computing
 * the validity of the form overall)
 *
 * Validators are expected to follow the format specified in peerio-icebear
 */
@observer
export default class ValidatedInput extends Component {
    @observable isFocused = false;

    @computed
    get validationMessage() {
        const errorMsg = this.props.store[this.fMsgText];
        if (this.props.store[this.fDirty] === true && errorMsg) {
            if (this.props.onError) this.props.onError(errorMsg);
            return t(errorMsg);
        }
        return null;
    }

    constructor(props) {
        super(props);
        // bind stuff
        this.toggleFocus = this.toggleFocus.bind(this);
        this.handleBlur = this.handleBlur.bind(this);
        this.handleChange = this.handleChange.bind(this);

        // ward off misuse
        if (!(this.props.store.constructor.prototype instanceof OrderedFormStore)) {
            throw new Error(
                'ValidatedInput expects a store property that inherits from OrderedFormStore'
            );
        }
        if (!this.props.name) {
            throw new Error('ValidatedInput expects a name property');
        }
        if (!isObservableProp(this.props.store, this.props.name)) {
            throw new Error(
                `ValidatedInput expects ${
                    this.props.name
                } to be an observable property in the (observable) store`
            );
        }

        // set property names
        this.fName = this.props.name;
        this.fDirty = `${this.fName}Dirty`;
        this.fValid = `${this.fName}Valid`;
        this.fFocused = `${this.fName}Focused`;
        this.fMsgText = `${this.fName}ValidationMessageText`;
        this.props.store.addField(this.props.name, this, this.props.position);

        // nothing validates offline
        this.validate = () => {
            when(() => socket.connected, () => this.validateConnected());
        };
    }

    componentWillMount() {
        reaction(() => this.props.store[this.props.name], () => this.validate(), {
            fireImmediately: true
        });
    }

    @observable inputRef;
    @action.bound
    setRef(ref) {
        if (ref) {
            this.inputRef = ref;
        }
    }

    @action.bound
    focus() {
        this.inputRef.focus();
    }

    @action
    validateConnected() {
        const value = this.props.store[this.props.name];
        const fieldValidators = Array.isArray(this.props.validator)
            ? this.props.validator
            : [this.props.validator];

        // reset message and valid state
        this.props.store[this.fValid] = false;
        this.props.store[this.fMsgText] = '';

        Promise.reduce(
            fieldValidators,
            (r, validator) => {
                if (!validator) return true;
                if (r === true) {
                    return validator
                        .action(value, this.props.validationArguments || {})
                        .then(rs => {
                            if (rs === undefined || rs === true) return rs;
                            return rs.message ? rs.message : validator.message;
                        });
                }
                return r;
            },
            true
        ).then(v => {
            if (this.props.store[this.props.name] !== value) {
                // console.log(`value changed ${this.props.name}, aborting`);
                return;
            }
            if (v === true) {
                this.props.store[this.fValid] = true;
                this.props.store[this.fMsgText] = '';
            } else {
                // computed message will only show up if field is dirty
                this.props.store[this.fValid] = false;
                this.props.store[this.fMsgText] = v;
            }
        });
    }

    @action
    toggleFocus() {
        this.props.store[this.fFocused] = !this.props.store[this.fFocused];
        if (this.props.propagateFocus !== undefined)
            this.props.propagateFocus(this.props.store[this.fFocused]);

        // currently only used for telemetry
        if (this.props.store[this.fFocused]) {
            telemetry.shared.validatedInputOnFocus(this.props.telemetry);
        }
    }

    @action
    handleBlur() {
        this.props.store[this.fDirty] = true;
        // mark all subsequent as dirty
        if (this.props.position !== undefined) {
            _.each(this.props.store.fieldOrders, (otherPosition, otherField) => {
                if (otherPosition < this.props.position) {
                    this.props.store[`${otherField}Dirty`] = true;
                }
            });
        }
        this.toggleFocus();

        // telemetry: send error on input blur
        if (!this.props.store[this.fFocused]) {
            telemetry.shared.validatedInputOnBlur(
                this.props.telemetry,
                this.props.store[this.fMsgText]
            );
        }
    }

    @action
    handleChange(val) {
        this.props.store[this.fName] = this.props.lowercase ? val.toLocaleLowerCase() : val;
        this.props.store[this.fDirty] = true;
    }

    onClear = () => {
        telemetry.shared.validatedInputOnClear(this.props.telemetry);
        this.props.onClear();
    };

    render() {
        return (
            <div
                className={css('validated-input', {
                    focused: this.props.store[this.fFocused]
                })}
            >
                <Input
                    testId={this.props.name}
                    type={this.props.type || 'text'}
                    value={this.props.store[this.props.name] || ''}
                    label={this.props.label}
                    onChange={this.handleChange}
                    onKeyPress={this.props.onKeyPress}
                    onClear={this.props.onClear ? this.onClear : null}
                    onBlur={this.handleBlur}
                    onFocus={this.toggleFocus}
                    error={this.validationMessage}
                    className={this.props.className}
                    maxLength={this.props.maxLength}
                    disabled={this.props.disabled}
                    hint={this.props.hint}
                    theme={this.props.theme}
                    ref={this.setRef}
                />
            </div>
        );
    }
}
