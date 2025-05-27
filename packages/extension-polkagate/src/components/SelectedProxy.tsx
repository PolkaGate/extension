// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { Proxy } from '../util/types';

import CachedIcon from '@mui/icons-material/Cached';
import { Container, IconButton, Typography } from '@mui/material';
import { Data } from 'iconsax-react';
import React from 'react';

import { useAccountName, useMyAccountIdentity2 } from '../hooks';
import { PolkaGateIdenticon } from '../style';
import { getSubstrateAddress } from '../util/utils';

export interface SignerInformation {
  selectedProxyAddress: string | undefined;
  onClick: () => void;
}

interface Props {
  signerInformation: SignerInformation;
  genesisHash: string | undefined;
  style?: React.CSSProperties;
}

const SelectedProxy = ({ genesisHash, signerInformation, style = {} }: Props) => {
  const signerAddress = getSubstrateAddress(signerInformation.selectedProxyAddress) ?? '';
  const signerId = useMyAccountIdentity2(signerAddress, genesisHash);
  const signerName = useAccountName(signerAddress);

  return (
    <Container disableGutters sx={{ alignItems: 'center', bgcolor: '#809ACB26', borderRadius: '10px', display: 'flex', justifyContent: 'space-between', p: '2px', width: 'fit-content', ...style }}>
      <Container disableGutters sx={{ alignItems: 'center', columnGap: '4px', display: 'flex', px: '8px' }}>
        <PolkaGateIdenticon
          address={signerAddress}
          size={18}
        />
        <Data color='#82FFA5' size='18' variant='Bold' />
        <Typography color='text.primary' sx={{ maxWidth: '85px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} variant='B-2'>
          {signerId?.display ?? signerName}
        </Typography>
      </Container>
      <IconButton
        onClick={signerInformation.onClick}
        sx={{ bgcolor: '#809ACB26', borderRadius: '8px', m: 0, p: '3.5px' }}
      >
        <CachedIcon sx={{ color: 'text.highlight', fontSize: '18px' }} />
      </IconButton>
    </Container>
  );
};

export default SelectedProxy;
