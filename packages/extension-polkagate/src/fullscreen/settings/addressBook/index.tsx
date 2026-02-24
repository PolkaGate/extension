// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { ExtensionPopupCloser } from '@polkadot/extension-polkagate/src/util/handleExtensionPopup';

import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import { Stack, Typography } from '@mui/material';
import { Add, Edit, User, UserAdd } from 'iconsax-react';
import React, { type Dispatch, memo, type SetStateAction, useCallback, useContext, useEffect, useMemo, useState } from 'react';

import { contactInfo } from '@polkadot/extension-polkagate/src/assets/animations';
import { AccountContext, ActionButton, AddressInput, MyTextField } from '@polkadot/extension-polkagate/src/components';
import { useTranslation } from '@polkadot/extension-polkagate/src/hooks';
import { getAndWatchStorage, getSubstrateAddress, setStorage } from '@polkadot/extension-polkagate/src/util';
import { STORAGE_KEY } from '@polkadot/extension-polkagate/src/util/constants';

import { DraggableModal } from '../../components/DraggableModal';
import AddressBookItem from './AddressBookItem';

interface Props {
    closePopup: ExtensionPopupCloser;
}

export interface Contact {
    address: string;
    name: string;
}

enum STEPS {
    LIST,
    ADD,
    EDIT
}

function AddressBook({ closePopup }: Props): React.ReactElement {
    const { t } = useTranslation();
    const { accounts } = useContext(AccountContext);

    const [contacts, setContacts] = useState<Contact[] | undefined>(undefined);
    const [contactAddress, setContactAddress] = useState<string | undefined>();
    const [name, setName] = useState<string | undefined>();
    const [step, setStep] = useState<STEPS>(STEPS.LIST);

    const existingAccounts = useMemo(() => accounts.map(({ address }) => address).concat(contacts?.map(({ address }) => address) ?? []), [accounts, contacts]);
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

    const onRemove = useCallback((addressToDelete: string) => () => {
        if (!contacts) {
            return;
        }

        const newList = contacts.filter(({ address }) => address !== addressToDelete);

        setStorage(STORAGE_KEY.ADDRESS_BOOK, newList)
            .then(() => {
                setContacts(newList);
            })
            .catch(console.error);
    }, [contacts]);

    const onEdit = useCallback((addressToEdit: string) => () => {
        if (!contacts) {
            return;
        }

        const contact = contacts.find(({ address }) => address === addressToEdit);

        if (!contact) {
            return;
        }

        setContactAddress(contact.address);
        setName(contact.name);
        setStep(STEPS.EDIT);
    }, [contacts]);

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
        const trimmedName = name?.trim();

        if (!substrateContactAddress || !trimmedName) {
            return;
        }

        let newList: Contact[] = [];

        if (step === STEPS.ADD) {
            newList = [...(contacts ?? []), { address: substrateContactAddress, name: trimmedName }];
        } else {
            const filtered = contacts?.filter(({ address }) => address !== substrateContactAddress) ?? [];

            newList = [...filtered, { address: substrateContactAddress, name: trimmedName }];
        }

        setStorage(STORAGE_KEY.ADDRESS_BOOK, newList)
            .then(() => {
                setContacts(newList);
                changeStep(STEPS.LIST);
            })
            .catch(console.error);
    }, [name, substrateContactAddress, step, contacts, changeStep]);

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
                    <>
                        <DotLottieReact
                            autoplay
                            loop
                            src={contactInfo as string}
                            style={{ height: 'auto', margin: '-60px -50px', marginLeft: '-58px', width: '500px' }}
                        />
                        <Typography color='text.secondary' pt='20px' textAlign='left' variant='B-4'>
                            {t('Save trusted addresses with a custom name to make transfers faster and safer. Contacts are stored locally in your wallet.')}
                        </Typography>
                        <Stack direction='column' sx={{ background: '#05091C', borderRadius: '14px', gap: '12px', height: '250px', m: '16px 6px', maxHeight: '250px', overflowY: 'auto', p: '16px' }}>
                            {contacts?.map(({ address, name }) => (
                                <AddressBookItem
                                    address={address}
                                    key={address}
                                    name={name}
                                    onEdit={onEdit(address)}
                                    onRemove={onRemove(address)}
                                />
                            ))}
                            {(!contacts || contacts.length === 0) &&
                                <Typography color='text.secondary' m='auto' textAlign='center' variant='B-4'>
                                    {t('Save wallet addresses here to avoid copy-paste errors and send funds with confidence.')}
                                </Typography>
                            }
                        </Stack>
                        <ActionButton
                            StartIcon={UserAdd}
                            contentPlacement='center'
                            // eslint-disable-next-line react/jsx-no-bind
                            onClick={() => changeStep(STEPS.ADD)}
                            style={{
                                borderRadius: '8px',
                                marginBlock: '8px',
                                width: 'fit-content'
                            }}
                            text={t('Add New Contact')}
                            variant='contained'
                        />
                    </>
                }
                {[STEPS.ADD, STEPS.EDIT].includes(step) &&
                    <>
                        <Typography color='text.secondary' py='20px' textAlign='left' variant='B-4'>
                            {t('Keep your trusted addresses organized.')}
                        </Typography>
                        <AddressInput
                            addWithQr
                            address={contactAddress}
                            label={t('Contact Account ID')}
                            placeHolder={t('Contact Account ID')}
                            setAddress={setContactAddress as Dispatch<SetStateAction<string | null | undefined>>}
                            style={{ m: '30px 0 0', width: '370px' }}
                        />
                        {duplicatedError &&
                            <Typography color='warning.main' sx={{ display: 'block', mt: '8px', textAlign: 'left', width: '100%' }} variant='B-1'>
                                {t('Address already exists')}
                            </Typography>
                        }
                        <MyTextField
                            Icon={User}
                            iconSize={18}
                            inputValue={name}
                            onEnterPress={onAddContact}
                            onTextChange={onNameChange}
                            placeholder={t('Enter contact name')}
                            style={{ margin: '20px 0', width: '370px' }}
                            title={t('Choose a name for this account')}
                        />
                        <ActionButton
                            StartIcon={step === STEPS.ADD ? Add : Edit}
                            contentPlacement='center'
                            disabled={!name?.trim() || !contactAddress || duplicatedError}
                            onClick={onAddContact}
                            style={{
                                borderRadius: '8px',
                                marginBlock: '8px',
                                width: 'fit-content'
                            }}
                            text={step === STEPS.ADD
                                ? t('Add Contact')
                                : t('Edit Contact')}
                            variant='contained'
                        />
                    </>
                }
            </>
        </DraggableModal>
    );
}

export default memo(AddressBook);
