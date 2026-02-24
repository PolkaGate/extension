// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { Contact } from '..';

import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import CheckIcon from '@mui/icons-material/Check';
import { ClickAwayListener, Fade, IconButton, Popper, Stack } from '@mui/material';
import { User } from 'iconsax-react';
import React, { memo, useCallback, useEffect, useRef, useState } from 'react';

import { checked } from '@polkadot/extension-polkagate/src/assets/animations';
import { MyTextField } from '@polkadot/extension-polkagate/src/components';
import { useTranslation } from '@polkadot/extension-polkagate/src/hooks';
import { updateStorage } from '@polkadot/extension-polkagate/src/util';
import { STORAGE_KEY } from '@polkadot/extension-polkagate/src/util/constants';

interface Props {
    address: string;
    addingContact: boolean;
    open: boolean;
    togglePopper: () => void;
    containerRef: React.RefObject<null>;
    setAddingContact: React.Dispatch<React.SetStateAction<boolean>>;
}

function AddContactPopper({ addingContact, address, containerRef, open, setAddingContact, togglePopper }: Props) {
    const { t } = useTranslation();
    const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const [name, setName] = useState<string | undefined>(undefined);

    const addToContacts = useCallback(() => {
        if (!address || !name) {
            return;
        }

        const newContact = {
            address,
            name
        } as Contact;

        setAddingContact(true);

        updateStorage(STORAGE_KEY.ADDRESS_BOOK, [newContact], true)
            .then(() => {
                timerRef.current = setTimeout(() => togglePopper(), 2_000); // after 2 seconds closes the popper
            })
            .catch(console.error);
    }, [address, name, setAddingContact, togglePopper]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (timerRef.current) {
                clearTimeout(timerRef.current);
            }
        };
    }, []);

    const onNameChange = useCallback((name: string) => setName(name), []);

    return (
        <ClickAwayListener disableReactTree onClickAway={togglePopper}>
            <Popper
                anchorEl={containerRef.current}
                open={open}
                placement='right'
                sx={[{ pl: '10px', zIndex: 1200 }]}
                transition
            >
                {({ TransitionProps }) => (
                    <Fade {...TransitionProps} timeout={350}>
                        <Stack
                            direction='row'
                            sx={{
                                alignItems: 'flex-end',
                                bgcolor: '#1B133C',
                                border: '1px solid #2D1E4A',
                                borderRadius: '6px',
                                // boxShadow: '0 0 5px 4px #2D1E4A',
                                gap: '10px',
                                justifyContent: 'space-between',
                                p: '6px'
                            }}
                        >
                            <MyTextField
                                Icon={User}
                                focused
                                iconSize={18}
                                inputValue={name}
                                onEnterPress={addToContacts}
                                onTextChange={onNameChange}
                                placeholder={t('Enter contact name')}
                                style={{ width: '240px' }}
                                title={t('Choose a name for this contact')}
                            />
                            {!addingContact &&
                                <IconButton
                                    disabled={!name}
                                    onClick={addToContacts}
                                    sx={{ m: 0, mb: '8px', p: '4px' }}
                                >
                                    <CheckIcon sx={{ color: 'success.light' }} />
                                </IconButton>}
                            {addingContact &&
                                <DotLottieReact
                                    autoplay
                                    loop={false}
                                    src={checked as string}
                                    style={{ height: 'auto', marginBottom: '10px', marginInline: '-7px', width: '45px' }}
                                />}
                        </Stack>
                    </Fade>
                )}
            </Popper>
        </ClickAwayListener>
    );
}

export default memo(AddContactPopper);
