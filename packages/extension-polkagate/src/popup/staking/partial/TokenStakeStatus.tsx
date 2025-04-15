// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Container, Grid, Skeleton, type SxProps, type Theme, Typography } from '@mui/material';
import React, { useMemo } from 'react';

import { type BN } from '@polkadot/util';

import { AssetLogo, FormatBalance2 } from '../../../components';
import getLogo2 from '../../../util/getLogo2';

export interface Props {
  amount: BN | undefined;
  decimal: number | undefined;
  token: string | undefined;
  text: string;
  style?: SxProps<Theme>;
  genesisHash: string | undefined;
}

export default function TokenStakeStatus ({ amount, decimal, genesisHash, style, text, token }: Props): React.ReactElement {
  const logoInfo = useMemo(() => getLogo2(genesisHash, token), [genesisHash, token]);

  return (
    <Container disableGutters sx={{ alignItems: 'center', bgcolor: '#110F2A', borderRadius: '14px', columnGap: '8px', display: 'flex', p: '10px', width: '100%', ...style }}>
      <AssetLogo assetSize='36px' baseTokenSize='0' genesisHash={genesisHash} logo={logoInfo?.logo} subLogo={undefined} />
      <Container disableGutters sx={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
        {amount
          ? (
            <FormatBalance2
              decimalPoint={4}
              decimals={[decimal ?? 0]}
              style={{
                color: '#ffffff',
                fontFamily: 'Inter',
                fontSize: '14px',
                fontWeight: 600,
                width: 'max-content'
              }}
              tokens={[token ?? '']}
              value={amount}
            />)
          : (
            <Skeleton
              animation='wave'
              height='18px'
              sx={{ borderRadius: '50px', fontWeight: 'bold', transform: 'none', width: '55px' }}
              variant='text'
            />
          )
        }
        <Typography color='text.highlight' variant='B-4' width='fit-content'>
          {text}
        </Typography>
      </Container>
    </Container>
  );
}
