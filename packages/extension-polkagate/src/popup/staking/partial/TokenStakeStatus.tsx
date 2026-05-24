// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Container, type SxProps, type Theme, Typography, useTheme } from '@mui/material';
import React, { useMemo } from 'react';

import { type BN } from '@polkadot/util';

import { Logo, DisplayBalance } from '../../../components';
import { useIsExtensionPopup } from '../../../hooks';
import resolveLogoInfo from '../../../util/logo/resolveLogoInfo';

export interface Props {
  amount: BN | undefined;
  decimal: number | undefined;
  token: string | undefined;
  text: string;
  style?: SxProps<Theme>;
  genesisHash: string | undefined;
}

export default function TokenStakeStatus({ amount, decimal, genesisHash, style, text, token }: Props): React.ReactElement {
  const theme = useTheme();
  const logoInfo = useMemo(() => resolveLogoInfo(genesisHash, token), [genesisHash, token]);
  const isExtension = useIsExtensionPopup();
  const isLight = theme.palette.mode === 'light';

  const textColor = isLight ? '#6F5A96' : isExtension ? theme.palette.text.highlight : theme.palette.primary.main;

  return (
    <Container disableGutters sx={{ alignItems: 'center', bgcolor: isLight ? '#FFFFFF' : isExtension ? '#110F2A' : '#05091C', border: isLight ? '1px solid #DDE3F4' : 'none', borderRadius: '14px', boxShadow: isLight ? '0px 10px 24px rgba(148, 163, 184, 0.12)' : 'none', columnGap: '10px', display: 'flex', p: '8.5px 10px', width: '100%', ...style }}>
      <Logo assetSize='36px' baseTokenSize='0' genesisHash={genesisHash} logo={logoInfo?.logo} subLogo={undefined} />
      <Container disableGutters sx={{ display: 'flex', flexDirection: 'column' }}>
        <DisplayBalance
          balance={amount}
          decimal={decimal}
          skeletonStyle={{ marginBottom: '5px', width: '100px' }}
          style={{
            color: isLight ? theme.palette.text.primary : '#ffffff',
            fontFamily: 'Inter',
            fontSize: '14px',
            fontWeight: 600,
            width: 'max-content'
          }}
          token={token}
          tokenColor={textColor}
          useAdaptiveDecimalPoint
        />
        <Typography color={textColor} variant='B-4' width='fit-content'>
          {text}
        </Typography>
      </Container>
    </Container>
  );
}
