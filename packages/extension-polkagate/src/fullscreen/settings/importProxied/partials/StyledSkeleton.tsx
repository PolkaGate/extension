// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Container, Grid } from '@mui/material';
import React from 'react';

import { GradientDivider, MySkeleton } from '@polkadot/extension-polkagate/src/components';

const StyledSkeleton = ({ index }: { index: number }) => {
    return (
        <Grid alignItems='center' container gap='4px'>
            <Container disableGutters sx={{ alignItems: 'center', display: 'flex', flexDirection: 'row', justifyContent: 'space-between' }}>
                <Grid alignItems='center' container item sx={{ gap: '6px' }}>
                    <MySkeleton height={24} style={{ borderRadius: '999px', width: 24 }} />
                    <MySkeleton height={16} style={{ borderRadius: '6px', width: `${120 + ((index % 2) * 40)}px` }} />
                </Grid>
                <MySkeleton height={24} style={{ borderRadius: '50px', width: '40px' }} />
            </Container>
            <GradientDivider />
        </Grid>
    );
};

export default StyledSkeleton;
