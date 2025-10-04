// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Container, type SxProps, type Theme, Typography, useTheme } from '@mui/material';
import React, { useMemo } from 'react';

import { type BN } from '@polkadot/util';

import { AssetLogo, DisplayBalance } from '../../../components';
import { useIsExtensionPopup } from '../../../hooks';
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
  const theme = useTheme();
  const logoInfo = useMemo(() => getLogo2(genesisHash, token), [genesisHash, token]);
  const isExtension = useIsExtensionPopup();

  const textColor = isExtension ? theme.palette.text.highlight : theme.palette.primary.main;

  return (
    <Container disableGutters sx={{ alignItems: 'center', bgcolor: isExtension ? '#110F2A' : '#05091C', borderRadius: '14px', columnGap: '10px', display: 'flex', p: '8.5px 10px', width: '100%', ...style }}>
      <AssetLogo assetSize='36px' baseTokenSize='0' genesisHash={genesisHash} logo={logoInfo?.logo} subLogo={undefined} />
      <Container disableGutters sx={{ display: 'flex', flexDirection: 'column' }}>
        <DisplayBalance
          balance={amount}
          decimal={decimal}
          skeletonStyle={{ marginBottom: '5px', width: '100px' }}
          style={{
            color: '#ffffff',
            fontFamily: 'Inter',
            fontSize: '14px',
            fontWeight: 600,
            width: 'max-content'
          }}
          token={token}
          tokenColor={textColor}
        />
        <Typography color={textColor} variant='B-4' width='fit-content'>
          {text}
        </Typography>
      </Container>
    </Container>
  );
}
