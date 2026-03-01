// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Grid, Typography } from '@mui/material';
import { User } from 'iconsax-react';
import React, { type Dispatch, memo, type SetStateAction, useCallback, useMemo, useRef } from 'react';

import { AddressInput, DecisionButtons, Identity2, MyTextField } from '@polkadot/extension-polkagate/src/components';
import { useTranslation } from '@polkadot/extension-polkagate/src/hooks';
import { POLKADOT_GENESIS_HASH } from '@polkadot/extension-polkagate/src/util/constants';
import { getChainFromAddress } from '@polkadot/extension-polkagate/src/util/getChainFromAddress';

import { STEPS } from '../types';

interface Props {
    contactAddress?: string;
    name?: string;
    onAddContact: () => void;
    onNameChange: (name: string) => void;
    setContactAddress: Dispatch<SetStateAction<string | undefined>>;
    step: STEPS;
    duplicatedError: boolean;
    changeStep: (newStep: STEPS) => void;
}

const key = (name: string | undefined, address: string | undefined) => `${name}${address}`;

function AddEditContact({ changeStep, contactAddress, duplicatedError, name, onAddContact, onNameChange, setContactAddress, step }: Props) {
    const { t } = useTranslation();

    const changeRef = useRef(key(name, contactAddress));

    const disabled = useMemo(() => !name?.trim() || !contactAddress || duplicatedError, [contactAddress, duplicatedError, name]);
    const genesisHash = useMemo(() => getChainFromAddress(contactAddress)?.genesisHash ?? POLKADOT_GENESIS_HASH, [contactAddress]);
    const notChanged = useMemo(() => changeRef.current === key(name, contactAddress), [contactAddress, name]);

    const onCancel = useCallback(() => changeStep(STEPS.LIST), [changeStep]);

    return (
        <>
            <Typography color='text.secondary' py='20px' textAlign='left' variant='B-4'>
                {t('Keep your trusted addresses organized.')}
            </Typography>
            {step === STEPS.EDIT &&
                <Grid container item sx={{ alignItems: 'center', backgroundColor: 'background.paper', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', my: '20px', p: '12px 20px' }}>
                    <Identity2
                        address={contactAddress}
                        genesisHash={genesisHash}
                        name={name}
                        withShortAddress
                    />
                </Grid>}
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
            <DecisionButtons
                cancelButton
                direction='vertical'
                disabled={disabled || notChanged}
                onPrimaryClick={onAddContact}
                onSecondaryClick={onCancel}
                primaryBtnText={step === STEPS.ADD ? t('Add') : t('Apply')}
                secondaryBtnText={t('Cancel')}
                style={{ marginTop: '50px' }}
            />
        </>
    );
}

export default memo(AddEditContact);
