// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import CachedIcon from '@mui/icons-material/Cached';
import { Container, IconButton, Typography, useTheme } from '@mui/material';
import { Data } from 'iconsax-react';
import React from 'react';

import { useAccountName, useIsBlueish, useMyAccountIdentity } from '../hooks';
import { PolkaGateIdenticon } from '../style';
import { getSubstrateAddress } from '../util';

export interface SignerInformation {
  selectedProxyAddress: string | undefined;
  onClick: () => void;
}

interface Props {
  signerInformation: SignerInformation;
  genesisHash: string | undefined;
  style?: React.CSSProperties;
  textMaxWidth?: string;
}

const SelectedProxy = ({ genesisHash, signerInformation, style = {}, textMaxWidth }: Props) => {
  const signerAddress = getSubstrateAddress(signerInformation.selectedProxyAddress) ?? '';
  const signerId = useMyAccountIdentity(signerAddress, genesisHash);
  const signerName = useAccountName(signerAddress);
  const isBlueish = useIsBlueish();
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === 'dark';

  const chipBackground = isDarkMode
    ? isBlueish ? '#809ACB26' : '#4E2B7259'
    : isBlueish ? 'rgba(128, 154, 203, 0.12)' : '#F1ECFA';
  const actionBackground = isDarkMode
    ? isBlueish ? '#809ACB26' : '#4E2B7259'
    : isBlueish ? 'rgba(128, 154, 203, 0.16)' : 'rgba(116, 94, 159, 0.12)';
  const iconColor = isBlueish
    ? theme.palette.text.highlight
    : isDarkMode ? theme.palette.primary.main : '#745E9F';

  return (
    <Container disableGutters sx={{ alignItems: 'center', bgcolor: chipBackground, border: isDarkMode ? 'none' : '1px solid #D9D0EA', borderRadius: '10px', display: 'flex', justifyContent: 'space-between', p: '2px', width: 'fit-content', ...style }}>
      <Container disableGutters sx={{ alignItems: 'center', columnGap: '4px', display: 'flex', px: '8px' }}>
        <PolkaGateIdenticon
          address={signerAddress}
          size={18}
        />
        <Data color={theme.palette.success.main} size='18' variant='Bold' />
        <Typography color={isDarkMode ? 'text.primary' : '#3D315F'} sx={{ maxWidth: textMaxWidth ?? '85px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} variant='B-2'>
          {signerId?.display ?? signerName}
        </Typography>
      </Container>
      <IconButton
        onClick={signerInformation.onClick}
        sx={{ bgcolor: actionBackground, borderRadius: '8px', m: 0, p: '3.5px' }}
      >
        <CachedIcon sx={{ color: iconColor, fontSize: '18px' }} />
      </IconButton>
    </Container>
  );
};

export default SelectedProxy;
