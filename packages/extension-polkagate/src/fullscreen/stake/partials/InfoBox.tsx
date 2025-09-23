// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { Icon } from 'iconsax-react';

import { Box, Grid, type SxProps, type Theme, Typography } from '@mui/material';
import React, { type ReactNode, useMemo } from 'react';

import { type BN, isBn } from '@polkadot/util';

import { ShowValue } from '../../../components';
import AssetLogo from '../../../components/AssetLogo';
import { useChainInfo, useIsExtensionPopup } from '../../../hooks';
import { amountToHuman } from '../../../util';
import getLogo2 from '../../../util/getLogo2';

interface InfoBoxProps {
  value: number | string | BN | undefined;
  label: string;
  decimal?: number | undefined;
  InfoIcon?: Icon;
  genesisHash?: string;
  style?: SxProps<Theme>;
  Amount?: ReactNode;
}

export const InfoBox = ({ Amount, InfoIcon, decimal, genesisHash, label, style, value }: InfoBoxProps) => {
  const { token } = useChainInfo(genesisHash, true);
  const isExtension = useIsExtensionPopup();

  const logoInfo = useMemo(() => getLogo2(genesisHash, token), [genesisHash, token]);

  return (
    <Box sx={{ alignItems: 'center', bgcolor: '#05091C', borderRadius: '14px', display: 'flex', flexDirection: 'column', justifyContent: 'flex-start', p: '17px 24px', pr: '15px', rowGap: isExtension ? '6px' : 0, width: '154px', ...style }}>
      <Grid alignItems='center' container gap='6px' item>
        {
          InfoIcon &&
          <InfoIcon color='#AA83DC' size='24' variant='Bulk' />
        }
        {
          logoInfo &&
          <AssetLogo assetSize='24px' genesisHash={genesisHash} logo={logoInfo.logo} subLogo={undefined} token={token} />
        }
        {Amount}
        <Typography color='text.primary' fontFamily='OdibeeSans' variant='H-2'>
          {isBn(value)
            ? decimal && <>{amountToHuman(value, decimal)}</>
            : !Amount && <ShowValue value={value} width='75px' />
          }
        </Typography>
      </Grid>
      <Typography color='#AA83DC' textAlign='left' variant='B-4' width='100%'>
        {label}
      </Typography>
    </Box>
  );
};
