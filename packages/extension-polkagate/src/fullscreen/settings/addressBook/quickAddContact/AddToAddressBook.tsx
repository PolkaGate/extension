// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';
import { Stack, Typography } from '@mui/material';
import React, { memo, useCallback, useContext, useEffect, useRef, useState } from 'react';

import { AccountContext } from '@polkadot/extension-polkagate/src/components';
import { useAddressBook, useTranslation } from '@polkadot/extension-polkagate/src/hooks';
import { getSubstrateAddress } from '@polkadot/extension-polkagate/src/util';

import AddContactPopper from './AddContactPopper';

interface Props {
    input: string | undefined;
}

function AddToAddressBook({ input }: Props) {
    const { t } = useTranslation();
    const contacts = useAddressBook(); // default value is [], and when it's undefined means it's fetching!
    const { accounts } = useContext(AccountContext);

    const containerRef = useRef(null);

    const [alreadyExists, setAvailable] = useState<boolean>(true);
    const [addingContact, setAddingContact] = useState<boolean>(false);
    const [openPopper, setOpen] = useState<boolean>(false);

    const substrate = getSubstrateAddress(input);

    useEffect(() => {
        // We include `addingContact` to prevent the component from being removed
        // immediately after the address is added to the address book.
        // This allows the UI transition (fade-out) to complete smoothly.
        if (!substrate || !contacts || addingContact) {
            return;
        }

        const existingAddresses = new Set<string>();

        accounts.forEach(({ address }) => existingAddresses.add(address));
        contacts.forEach(({ address }) => existingAddresses.add(address));

        const isAlreadyAdded = existingAddresses.has(substrate);

        setAvailable(!!isAlreadyAdded);
    }, [accounts, addingContact, contacts, substrate]);

    const togglePopper = useCallback((e?: React.MouseEvent) => {
        e?.stopPropagation();
        setOpen((isOpen) => !isOpen);
    }, []);

    if (alreadyExists || !substrate) {
        return null;
    }

    return (
        <>
            <Stack
                direction='row'
                onClick={togglePopper}
                ref={containerRef}
                sx={{
                    ':hover': {
                        opacity: 1,
                        transition: 'all 250ms ease-out'
                    },
                    alignItems: 'center',
                    bgcolor: '#1B133C',
                    border: '1px solid #2D1E4A',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    gap: '12px',
                    justifyContent: 'space-between',
                    m: 'auto',
                    mt: '7px',
                    opacity: addingContact && !openPopper ? 0 : openPopper ? 1 : 0.5,
                    p: '2px 4px',
                    transition: 'all 250ms ease-out',
                    width: 'fit-content'
                }}
            >
                <Typography color='primary.main' variant='B-5'>
                    {t('Add to address book')}
                </Typography>
                <KeyboardArrowRightIcon sx={{ color: 'primary.main', fontSize: '20px', opacity: 0.7 }} />
            </Stack>
            <AddContactPopper
                addingContact={addingContact}
                address={substrate}
                containerRef={containerRef}
                open={openPopper}
                setAddingContact={setAddingContact}
                togglePopper={togglePopper}
            />
        </>
    );
}

export default memo(AddToAddressBook);
