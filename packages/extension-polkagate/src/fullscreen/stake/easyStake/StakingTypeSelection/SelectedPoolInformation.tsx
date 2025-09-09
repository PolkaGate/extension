// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { PoolInfo } from '../../../../util/types';

import { Collapse, Container, Grid, Stack, useTheme } from '@mui/material';
import { ArrowRight2 } from 'iconsax-react';
import React, { useMemo } from 'react';

import { FormatBalance2, ScrollingTextBox } from '../../../../components';
import { useChainInfo } from '../../../../hooks';
import { PoolIdenticon } from '../../../../popup/staking/partial/PoolIdenticon';
import { isHexToBn } from '../../../../util/utils';
import { LoadingPoolInformation } from './LoadingPoolInformation';

interface SelectedPoolInformationProps {
  genesisHash: string | undefined;
  poolDetail: PoolInfo | null | undefined;
  onClick: (event: React.MouseEvent) => void;
  open: boolean;
  isExtension: boolean;
}

export const SelectedPoolInformation = ({ genesisHash, isExtension, onClick, open, poolDetail }: SelectedPoolInformationProps) => {
  const theme = useTheme();
  const { decimal, token } = useChainInfo(genesisHash, true);

  const textColor = useMemo(() => isExtension ? theme.palette.text.highlight : '#AA83DC', [isExtension, theme.palette.text.highlight]);

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
              <ScrollingTextBox
                text={poolDetail.metadata ?? ''}
                textStyle={{
                  color: theme.palette.text.primary,
                  ...theme.typography['B-2']
                }}
                width={isExtension ? 230 : 250}
              />
              <FormatBalance2
                decimals={[decimal ?? 0]}
                style={{ ...theme.typography['B-4'], color: textColor, width: 'fit-content' }}
                tokenColor={textColor}
                tokens={[token ?? '']}
                value={isHexToBn(poolDetail.bondedPool?.points.toString() ?? '0')}
              />
            </Stack>
            <Grid container item sx={{ bgcolor: '#2D1E4A', borderRadius: '6px', p: '20px 10px', width: 'fit-content' }}>
              <ArrowRight2 color={textColor} size='18' variant='Bold' />
            </Grid>
          </Container>)
        : <LoadingPoolInformation />}
    </Collapse>
  );
};
