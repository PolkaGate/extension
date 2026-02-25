// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Grid, IconButton } from '@mui/material';
import { Edit, Trash } from 'iconsax-react';
import React, { memo } from 'react';

import { GradientDivider, Identity2 } from '@polkadot/extension-polkagate/src/components';
import { POLKADOT_GENESIS_HASH } from '@polkadot/extension-polkagate/src/util/constants';

interface Props {
    address: string;
    name: string;
    onRemove: () => void;
    onEdit: () => void;
}

function AddressBookItem({ address, name, onEdit, onRemove }: Props) {
    return (
        <>
            <Grid container item sx={{ alignItems: 'center', justifyContent: 'space-between' }}>
                <Identity2
                    address={address}
                    genesisHash={POLKADOT_GENESIS_HASH}
                    identiconSize={24}
                    name={name}
                    nameStyle={{ maxWidth: '100%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
                    socialStyles={{ mt: 0 }}
                    style={{
                        fontSize: '12px',
                        fontWeight: 500,
                        variant: 'B-1',
                        width: '75%'
                    }}
                    withShortAddress
                />
                <Grid container item sx={{ alignItems: 'center', gap: '8px', width: 'fit-content' }}>
                    <IconButton
                        onClick={onEdit}
                        sx={{ bgcolor: '#AA83DC26', borderRadius: '128px', m: 0, p: '6px' }}
                    >
                        <Edit color='#AA83DC' size='17' variant='Bulk' />
                    </IconButton>
                    <GradientDivider orientation='vertical' style={{ height: '25px' }} />
                    <IconButton
                        onClick={onRemove}
                        sx={{ bgcolor: '#FF165C26', borderRadius: '128px', m: 0, p: '6px' }}
                    >
                        <Trash color='#FF165C' size='16' variant='Bulk' />
                    </IconButton>
                </Grid>
            </Grid>
            <GradientDivider />
        </>
    );
}

export default memo(AddressBookItem);
