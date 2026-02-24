// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { ExtensionPopupCloser } from '@polkadot/extension-polkagate/src/util/handleExtensionPopup';

import React, { memo, useCallback, useContext, useEffect, useMemo, useState } from 'react';

import { AccountContext } from '@polkadot/extension-polkagate/src/components';
import { useTranslation } from '@polkadot/extension-polkagate/src/hooks';
import { getAndWatchStorage, getSubstrateAddress, setStorage } from '@polkadot/extension-polkagate/src/util';
import { STORAGE_KEY } from '@polkadot/extension-polkagate/src/util/constants';

import { DraggableModal } from '../../components/DraggableModal';
import AddEditContact from './partials/AddEditContact';
import ContactsList from './partials/ContactsList';

interface Props {
    closePopup: ExtensionPopupCloser;
}

export interface Contact {
    address: string;
    name: string;
}

export enum STEPS {
    LIST,
    ADD,
    EDIT
}

function AddressBook({ closePopup }: Props): React.ReactElement {
    const { t } = useTranslation();
    const { accounts } = useContext(AccountContext);

    const [contacts, setContacts] = useState<Contact[] | undefined>(undefined);
    const [contactAddress, setContactAddress] = useState<string | undefined>();
    const [contactName, setName] = useState<string | undefined>();
    const [step, setStep] = useState<STEPS>(STEPS.LIST);

    const existingAccounts = useMemo(() =>
        accounts.map(({ address }) => address)
            .concat(
                contacts?.map(({ address }) => getSubstrateAddress(address) ?? address
                ) ?? []), [accounts, contacts]);

    const substrateContactAddress = getSubstrateAddress(contactAddress) ?? contactAddress;

    useEffect(() => {
        const unsubscribe = getAndWatchStorage(STORAGE_KEY.ADDRESS_BOOK, setContacts);

        return unsubscribe;
    }, []);

    const duplicatedError = useMemo(() => {
        if (substrateContactAddress && contacts && step === STEPS.ADD) {
            return existingAccounts.includes(substrateContactAddress); // duplicated, address already exists
        }

        return false;
    }, [contacts, existingAccounts, step, substrateContactAddress]);

    const onNameChange = useCallback((name: string) => setName(name), []);

    const reset = useCallback(() => {
        setContactAddress(undefined);
        setName(undefined);
    }, []);

    const changeStep = useCallback((newStep: STEPS) => {
        setStep(newStep);
        newStep === STEPS.LIST && reset();
    }, [reset]);

    const onAddContact = useCallback(() => {
        const trimmedName = contactName?.trim();

        if (!contactAddress || !trimmedName) {
            return;
        }

        let newList: Contact[] = [];

        if (step === STEPS.ADD) {
            newList = [...(contacts ?? []), { address: contactAddress, name: trimmedName }];
        } else {
            const filtered = contacts?.filter(({ address }) => getSubstrateAddress(address) !== substrateContactAddress) ?? [];

            newList = [...filtered, { address: contactAddress, name: trimmedName }];
        }

        setStorage(STORAGE_KEY.ADDRESS_BOOK, newList)
            .then(() => {
                setContacts(newList);
                changeStep(STEPS.LIST);
            })
            .catch(console.error);
    }, [contactName, contactAddress, step, contacts, substrateContactAddress, changeStep]);

    return (
        <DraggableModal
            // eslint-disable-next-line react/jsx-no-bind
            onClose={step === STEPS.LIST ? closePopup : () => changeStep(STEPS.LIST)}
            open
            showBackIconAsClose
            style={{ minHeight: '200px', padding: '16px' }}
            title={step === STEPS.LIST
                ? t('Address Book')
                : step === STEPS.EDIT
                    ? t('Edit Contact')
                    : t('Add Contact')}
        >
            <>
                {step === STEPS.LIST &&
                    <ContactsList
                        changeStep={changeStep}
                        contacts={contacts}
                        setContactAddress={setContactAddress}
                        setContacts={setContacts}
                        setName={setName}
                        setStep={setStep}
                    />
                }
                {[STEPS.ADD, STEPS.EDIT].includes(step) &&
                    <AddEditContact
                        contactAddress={contactAddress}
                        duplicatedError={duplicatedError}
                        name={contactName}
                        onAddContact={onAddContact}
                        onNameChange={onNameChange}
                        setContactAddress={setContactAddress}
                        step={step}
                    />
                }
            </>
        </DraggableModal>
    );
}

export default memo(AddressBook);
