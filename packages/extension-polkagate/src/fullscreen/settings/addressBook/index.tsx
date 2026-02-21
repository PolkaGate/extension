// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { ExtensionPopupCloser } from '@polkadot/extension-polkagate/src/util/handleExtensionPopup';

import { Stack, Typography } from '@mui/material';
import { Add, User, UserAdd } from 'iconsax-react';
import React, { type Dispatch, memo, type SetStateAction, useCallback, useEffect, useState } from 'react';

import { ActionButton, AddressInput, MyTextField } from '@polkadot/extension-polkagate/src/components';
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

function AddressBook({ closePopup }: Props): React.ReactElement {
    const { t } = useTranslation();

    const [addresses, setAddresses] = useState<Contact[] | undefined>(undefined);
    const [contactAddress, setContactAddress] = useState<string | undefined>();
    const [name, setName] = useState<string | undefined>();
    const [step, setStep] = useState<1 | 2>(1);
    const [duplicatedError, setDuplicatedError] = useState<boolean>(false);

    useEffect(() => {
        const unsubscribe = getAndWatchStorage(STORAGE_KEY.ADDRESS_BOOK, setAddresses);

        return unsubscribe;
    }, []);

    useEffect(() => {
        if (contactAddress && addresses) {
            const substrate = getSubstrateAddress(contactAddress);

            setDuplicatedError(!!addresses.find(({ address }) => address === substrate)); // duplicated, address already exists
        }

        if (!contactAddress) {
            setDuplicatedError(false);
        }
    }, [addresses, contactAddress]);

    const onRemove = useCallback((addressToDelete: string) => () => {
        if (!addresses) {
            return;
        }

        const newList = addresses.filter(({ address }) => address !== addressToDelete);

        setStorage(STORAGE_KEY.ADDRESS_BOOK, newList)
            .then(() => {
                setAddresses(newList);
            })
            .catch(console.error);
    }, [addresses]);

    const onNameChange = useCallback((name: string) => setName(name), []);

    const reset = useCallback(() => {
        setContactAddress(undefined);
        setName(undefined);
    }, []);

    const toggleStep = useCallback(() => {
        setStep((prev) => prev > 1 ? 1 : 2);
        reset();
    }, [reset]);

    const onAddContact = useCallback(() => {
        const trimmedName = name?.trim();

        if (!contactAddress || !trimmedName) {
            return;
        }

        const address = getSubstrateAddress(contactAddress) ?? contactAddress;

        const newList = [...(addresses ?? []), { address, name: trimmedName }];

        setStorage(STORAGE_KEY.ADDRESS_BOOK, newList)
            .then(() => {
                setAddresses(newList);
                toggleStep();
            })
            .catch(console.error);
    }, [addresses, contactAddress, name, toggleStep]);

    return (
        <DraggableModal
            onClose={step === 1 ? closePopup : toggleStep}
            open
            showBackIconAsClose={step === 2}
            style={{ minHeight: '200px', padding: '16px' }}
            title={step === 1 ? t('Address Book') : t('Add Contact')}
        >
            <>
                {step === 1 &&
                    <>
                        <Typography color='text.secondary' pt='20px' textAlign='left' variant='B-4'>
                            {t('Save trusted addresses with a custom name to make transfers faster and safer. Contacts are stored locally in your wallet.')}
                        </Typography>
                        <Stack direction='column' sx={{ background: '#05091C', borderRadius: '14px', gap: '12px', height: '250px', m: '16px 6px', maxHeight: '250px', overflowY: 'auto', p: '16px' }}>
                            {addresses?.map(({ address, name }) => (
                                <AddressBookItem
                                    address={address}
                                    key={address}
                                    name={name}
                                    onRemove={onRemove(address)}
                                />
                            ))}
                            {(!addresses || addresses.length === 0) &&
                                <Typography color='text.secondary' m='auto' textAlign='center' variant='B-4'>
                                    {t('Save wallet addresses here to avoid copy-paste errors and send funds with confidence.')}
                                </Typography>
                            }
                        </Stack>
                        <ActionButton
                            StartIcon={UserAdd}
                            contentPlacement='center'
                            onClick={toggleStep}
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
                {step === 2 &&
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
                            StartIcon={Add}
                            contentPlacement='center'
                            disabled={!name?.trim() || !contactAddress || duplicatedError}
                            onClick={onAddContact}
                            style={{
                                borderRadius: '8px',
                                marginBlock: '8px',
                                width: 'fit-content'
                            }}
                            text={t('Add Contact')}
                            variant='contained'
                        />
                    </>
                }
            </>
        </DraggableModal>
    );
}

export default memo(AddressBook);
