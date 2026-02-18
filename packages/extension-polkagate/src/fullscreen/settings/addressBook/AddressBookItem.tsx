// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Grid, IconButton } from '@mui/material';
import { Trash } from 'iconsax-react';
import React, { memo } from 'react';

import { GradientDivider, Identity2 } from '@polkadot/extension-polkagate/src/components';
import { POLKADOT_GENESIS_HASH } from '@polkadot/extension-polkagate/src/util/constants';

interface Props {
    address: string;
    name: string;
    onRemove: () => void;
}

function AddressBookItem({ address, name, onRemove }: Props) {
    return (
        <>
            <Grid container item sx={{ alignItems: 'center', justifyContent: 'space-between' }}>
                <Identity2
                    address={address}
                    genesisHash={POLKADOT_GENESIS_HASH}
                    identiconSize={24}
                    name={name}
                    nameStyle={{ maxWidth: '100%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
                    showShortAddress
                    socialStyles={{ mt: 0 }}
                    style={{
                        fontSize: '12px',
                        fontWeight: 500,
                        variant: 'B-4',
                        width: '75%'
                    }}
                />
                <IconButton
                    onClick={onRemove}
                    sx={{ m: 0, p: '4px' }}
                >
                    <Trash color='#FF8A65' size='20' />
                </IconButton>
            </Grid>
            <GradientDivider />
        </>
    );
}

export default memo(AddressBookItem);
