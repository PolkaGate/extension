// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import { Stack, Typography } from '@mui/material';
import { UserAdd } from 'iconsax-react';
import React, { type Dispatch, memo, type SetStateAction, useCallback } from 'react';

import { contactInfo } from '@polkadot/extension-polkagate/src/assets/animations';
import { ActionButton } from '@polkadot/extension-polkagate/src/components';
import { useTranslation } from '@polkadot/extension-polkagate/src/hooks';
import { setStorage } from '@polkadot/extension-polkagate/src/util';
import { STORAGE_KEY } from '@polkadot/extension-polkagate/src/util/constants';

import AddressBookItem from '../AddressBookItem';
import { type Contact, STEPS } from '../types';

interface Props {
    contacts: Contact[] | undefined;
    setContacts: Dispatch<SetStateAction<Contact[] | undefined>>;
    changeStep: (step: STEPS) => void;
    setContactAddress: Dispatch<SetStateAction<string | undefined>>;
    setName: Dispatch<SetStateAction<string | undefined>>;
    setStep: React.Dispatch<React.SetStateAction<STEPS>>;
}

function ContactsList({ changeStep, contacts, setContactAddress, setContacts, setName, setStep }: Props) {
    const { t } = useTranslation();

    const onRemove = useCallback((contactToDelete: string) => () => {
        if (!contacts) {
            return;
        }

        // no need to convert to substrate address here since they're the same in the address book
        const newList = contacts.filter(({ address }) => address !== contactToDelete);

        setStorage(STORAGE_KEY.ADDRESS_BOOK, newList)
            .then(() => {
                setContacts(newList);
            })
            .catch(console.error);
    }, [contacts, setContacts]);

    const onEdit = useCallback((contactToEdit: string) => () => {
        if (!contacts) {
            return;
        }

        // no need to convert to substrate address here since they're the same in the address book
        const contact = contacts.find(({ address }) => address === contactToEdit);

        if (!contact) {
            return;
        }

        setContactAddress(contact.address);
        setName(contact.name);
        setStep(STEPS.EDIT);
    }, [contacts, setContactAddress, setName, setStep]);

    return (
        <>
            <DotLottieReact
                autoplay
                loop={false}
                src={contactInfo as string}
                style={{ margin: '-53px -8px -45px auto' }}
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
    );
}

export default memo(ContactsList);
