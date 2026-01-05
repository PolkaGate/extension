// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import CachedIcon from '@mui/icons-material/Cached';
import { Container, IconButton, Typography } from '@mui/material';
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

  return (
    <Container disableGutters sx={{ alignItems: 'center', bgcolor: isBlueish ? '#809ACB26' : '#4E2B7259', borderRadius: '10px', display: 'flex', justifyContent: 'space-between', p: '2px', width: 'fit-content', ...style }}>
      <Container disableGutters sx={{ alignItems: 'center', columnGap: '4px', display: 'flex', px: '8px' }}>
        <PolkaGateIdenticon
          address={signerAddress}
          size={18}
        />
        <Data color='#82FFA5' size='18' variant='Bold' />
        <Typography color='text.primary' sx={{ maxWidth: textMaxWidth ?? '85px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} variant='B-2'>
          {signerId?.display ?? signerName}
        </Typography>
      </Container>
      <IconButton
        onClick={signerInformation.onClick}
        sx={{ bgcolor: isBlueish ? '#809ACB26' : '#4E2B7259', borderRadius: '8px', m: 0, p: '3.5px' }}
      >
        <CachedIcon sx={{ color: isBlueish ? 'text.highlight' : 'primary.main', fontSize: '18px' }} />
      </IconButton>
    </Container>
  );
};

export default SelectedProxy;
