// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Grid, Stack, Typography } from '@mui/material';
import { BookSaved } from 'iconsax-react';
import React, { memo, useCallback, useContext, useEffect, useRef, useState } from 'react';

import { AccountContext } from '@polkadot/extension-polkagate/src/components';
import { useAddressBook, useTranslation } from '@polkadot/extension-polkagate/src/hooks';
import useIsHovered from '@polkadot/extension-polkagate/src/hooks/useIsHovered2';
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
    const { isHovered, ref } = useIsHovered();
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

        accounts.forEach(({ address }) => existingAddresses.add(getSubstrateAddress(address) ?? address));
        contacts.forEach(({ address }) => existingAddresses.add(getSubstrateAddress(address) ?? address));

        const isAlreadyAdded = existingAddresses.has(substrate);

        setAvailable(!!isAlreadyAdded);
    }, [accounts, addingContact, contacts, substrate]);

    const togglePopper = useCallback((e?: React.MouseEvent) => {
        e?.stopPropagation();
        setOpen((isOpen) => !isOpen);
    }, []);

    if (alreadyExists || !substrate || !input) {
        return null;
    }

    return (
        <Grid container justifyContent='end' ref={ref}>
            <Stack
                direction='row'
                onClick={togglePopper}
                ref={containerRef}
                sx={{
                    ':hover': {
                        borderColor: '#2D1E4A',
                        opacity: 1,
                        transition: 'all 250ms ease-out'
                    },
                    alignItems: 'center',
                    bgcolor: '#1B133C',
                    border: '1px solid',
                    borderColor: openPopper ? '#2D1E4A' : 'transparent',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    gap: isHovered || openPopper ? '12px' : 0,
                    justifyContent: 'space-between',
                    mt: '7px',
                    opacity: addingContact && !openPopper ? 0 : openPopper ? 1 : 0.5,
                    p: '2px 4px',
                    transition: 'all 250ms ease-out',
                    width: 'fit-content'
                }}
            >
                <Typography
                    color='primary.main'
                    sx={{
                        maxWidth: isHovered || openPopper ? '140px' : '0px',
                        opacity: isHovered || openPopper ? 1 : 0,
                        overflow: 'hidden',
                        transform: isHovered || openPopper ? 'translateX(0)' : 'translateX(-8px)',
                        transition: 'max-width 250ms ease, opacity 200ms ease, transform 250ms ease',
                        whiteSpace: 'nowrap'
                    }}
                    variant='B-5'
                >
                    {t('Add to address book')}
                </Typography>
                <BookSaved color='#AA83DC' size='20' variant='Linear' />
            </Stack>
            <AddContactPopper
                addingContact={addingContact}
                contactAddress={input}
                containerRef={containerRef}
                open={openPopper}
                setAddingContact={setAddingContact}
                togglePopper={togglePopper}
            />
        </Grid>
    );
}

export default memo(AddToAddressBook);
