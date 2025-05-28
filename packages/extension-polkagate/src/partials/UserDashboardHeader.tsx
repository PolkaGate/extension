// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { Proxy } from '../util/types';

import CachedIcon from '@mui/icons-material/Cached';
import { Container, Grid, IconButton, Typography } from '@mui/material';
import { Data } from 'iconsax-react';
import React, { useMemo } from 'react';

import { HomeButton } from '../components';
import { useAccountName, useMyAccountIdentity2 } from '../hooks';
import AccountSelection from '../popup/home/partial/AccountSelection';
import { PolkaGateIdenticon } from '../style';
import { getSubstrateAddress } from '../util/utils';
import FullscreenModeButton from './FullscreenModeButton';
import { ConnectedDapp } from '.';

interface SignerInformation {
  selectedProxy?: Proxy;
  onClick: () => void;
}

const SelectedProxy = ({ genesisHash, signerInformation }: { signerInformation: SignerInformation; genesisHash: string | undefined }) => {
  const signerAddress = getSubstrateAddress(signerInformation.selectedProxy?.delegate) ?? '';
  const signerId = useMyAccountIdentity2(signerAddress, genesisHash);
  const signerName = useAccountName(signerAddress);

  return (
    <Container disableGutters sx={{ alignItems: 'center', bgcolor: '#809ACB26', borderRadius: '10px', display: 'flex', justifyContent: 'space-between', p: '2px', width: 'fit-content' }}>
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

interface Props {
  homeType?: 'default' | 'active';
  noSelection?: boolean;
  signerInformation?: SignerInformation;
  genesisHash?: string | null | undefined;
}

function UserDashboardHeader ({ genesisHash, homeType, noSelection = false, signerInformation }: Props) {
  const isConnectedDapp = useMemo(() => document.getElementsByClassName('ConnectedDapp'), []);

  return (
    <Container disableGutters sx={{ display: 'flex', justifyContent: 'space-between', p: '10px 15px' }}>
      <Grid columnGap='6px' container item width='fit-content'>
        <Grid container item width='fit-content'>
          <HomeButton type={homeType || (isConnectedDapp.length ? 'default' : 'active')} />
          {
            !noSelection &&
            <ConnectedDapp />
          }
        </Grid>
        {
          !(signerInformation?.selectedProxy && genesisHash) && !noSelection &&
          <AccountSelection noSelection={noSelection} /> /** Should not display the selected account while the selected proxy account is being shown. */
        }
        {
          signerInformation?.selectedProxy && genesisHash &&
          <SelectedProxy genesisHash={genesisHash} signerInformation={signerInformation} />
        }
      </Grid>
      <FullscreenModeButton />
    </Container>
  );
}

export default UserDashboardHeader;
