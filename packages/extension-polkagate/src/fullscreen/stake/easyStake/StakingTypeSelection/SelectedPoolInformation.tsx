// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { PoolInfo } from '../../../../util/types';

import { Collapse, Container, Grid, Stack, Typography, useTheme } from '@mui/material';
import { ArrowRight2 } from 'iconsax-react';
import React from 'react';

import { FormatBalance2 } from '../../../../components';
import { useChainInfo } from '../../../../hooks';
import { PoolIdenticon } from '../../../../popup/staking/partial/PoolIdenticon';
import { isHexToBn } from '../../../../util/utils';
import { LoadingPoolInformation } from './LoadingPoolInformation';

interface SelectedPoolInformationProps {
  genesisHash: string | undefined;
  poolDetail: PoolInfo | null | undefined;
  onClick: (event: React.MouseEvent) => void;
  open: boolean;
}

export const SelectedPoolInformation = ({ genesisHash, onClick, open, poolDetail }: SelectedPoolInformationProps) => {
  const theme = useTheme();
  const { decimal, token } = useChainInfo(genesisHash);

  return (
    <Collapse in={open}>
      {poolDetail
        ? (
          <Container disableGutters onClick={onClick} sx={{ alignItems: 'center', bgcolor: '#1B133C', borderRadius: '10px', cursor: 'pointer', display: 'flex', flexDirection: 'row', p: '2px', pl: '16px' }}>
            <PoolIdenticon
              poolInfo={poolDetail}
              size={24}
            />
            <Stack direction='column' sx={{ ml: '10px', mr: 'auto', width: 'fit-content' }}>
              <Typography color='text.primary' sx={{ maxWidth: '250px', overflow: 'hidden', textAlign: 'left', textOverflow: 'ellipsis', textWrap: 'noWrap' }} variant='B-2'>
                {poolDetail.metadata}
              </Typography>
              <FormatBalance2
                decimals={[decimal ?? 0]}
                style={{ ...theme.typography['B-4'], color: '#AA83DC', width: 'fit-content' }}
                tokenColor='#AA83DC'
                tokens={[token ?? '']}
                value={isHexToBn(poolDetail.bondedPool?.points.toString() ?? '0')}
              />
            </Stack>
            <Grid container item sx={{ bgcolor: '#2D1E4A', borderRadius: '6px', p: '20px 10px', width: 'fit-content' }}>
              <ArrowRight2 color='#AA83DC' size='18' variant='Bold' />
            </Grid>
          </Container>)
        : <LoadingPoolInformation />}
    </Collapse>
  );
};
