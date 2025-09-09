// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Container, Grid, Typography } from '@mui/material';
import { ArrowRight2 } from 'iconsax-react';
import React, { memo, useCallback, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router';

import { mapHubToRelay } from '@polkadot/extension-polkagate/src/util/migrateHubUtils';
import { type BN, noop } from '@polkadot/util';

import { ChainLogo, CryptoFiatBalance } from '../../../components';
import { useChainInfo } from '../../../hooks';
import { StakingBadge, TestnetBadge } from '../../../popup/staking/StakingPositions';
import { updateStorage } from '../../../util';
import { ACCOUNT_SELECTED_CHAIN_NAME_IN_STORAGE, TEST_NETS } from '../../../util/constants';
import { amountToHuman } from '../../../util/utils';

interface TokenInfoProps {
  genesisHash: string;
}

export const TokenInfo = ({ genesisHash }: TokenInfoProps) => {
  const { chainName, token } = useChainInfo(genesisHash, true);
  const _chainName = chainName?.replace('AssetHub', '');
  const _genesisHash = mapHubToRelay(genesisHash);

  return (
    <Grid container item sx={{ alignItems: 'center', flexWrap: 'nowrap', gap: '6px', minWidth: '100px', width: 'fit-content' }}>
      <ChainLogo genesisHash={_genesisHash} size={24} />
      <Grid container item sx={{ alignItems: 'flex-start', display: 'flex', flexDirection: 'column', width: 'fit-content' }}>
        <Typography color='text.primary' textTransform='uppercase' variant='B-2'>
          {token}
        </Typography>
        <Typography color='#AA83DC' variant='B-5'>
          {_chainName}
        </Typography>
      </Grid>
    </Grid>
  );
};

const ArrowButton = ({ onClick }: { onClick: () => void }) => {
  return (
    <Grid container item onClick={onClick} sx={{ alignItems: 'center', bgcolor: '#1B133C', borderRadius: '8px', cursor: 'pointer', height: '36px', justifyContent: 'center', width: '36px' }}>
      <ArrowRight2 color='#AA83DC' size='16' variant='Bold' />
    </Grid>
  );
};

interface StakedProps {
  balance: BN;
  decimal: number;
  token: string;
  price: number;
}

const Staked = ({ balance, decimal, price, token }: StakedProps) => {
  const value = useMemo(() => amountToHuman(balance.muln(price), decimal), [balance, decimal, price]);

  return (
    <Grid container item sx={{ alignItems: 'center', justifyContent: 'flex-end', minWidth: '100px', width: 'fit-content' }}>
      <CryptoFiatBalance
        cryptoBalance={balance}
        decimal={decimal}
        fiatBalance={parseFloat(value)}
        skeletonAlignment='flex-end'
        style={{ alignItems: 'end', rowGap: '2px', textAlign: 'right' }}
        token={token}
      />
    </Grid>
  );
};

export const ChainIdentifier = ({ genesisHash }: TokenInfoProps) => {
  const { displayName } = useChainInfo(genesisHash, true);

  return (
    <Container disableGutters sx={{ alignItems: 'center', display: 'flex', flexDirection: 'row', gap: '6px', m: 0, minWidth: '200px', width: 'fit-content' }}>
      <ChainLogo genesisHash={genesisHash} size={24} />
      <Typography color='text.secondary' variant='B-2'>
        {displayName}
      </Typography>
    </Container>
  );
};

interface Props extends TokenInfoProps {
  type: 'pool' | 'solo';
  balance: BN;
  price: number;
  decimal: number;
  token: string;
  isSelected?: boolean;
}

function PositionItem ({ balance, decimal, genesisHash, isSelected, price, token, type }: Props) {
  const { address } = useParams<{ address: string }>();
  const navigate = useNavigate();
  const hasPoolStaking = useMemo(() => type === 'pool', [type]);
  const isTestNet = useMemo(() => TEST_NETS.includes(genesisHash), [genesisHash]);

  const onClick = useCallback(() => {
    if (!address) {
      return;
    }

    updateStorage(ACCOUNT_SELECTED_CHAIN_NAME_IN_STORAGE, { [address]: genesisHash })
      .then(() => navigate('/fullscreen-stake/' + type + '/' + address + '/' + genesisHash) as void)
      .catch(console.error);
  }, [genesisHash, navigate, address, type]);

  return (
    <Container disableGutters onClick={onClick} sx={{ alignItems: 'center', bgcolor: isSelected ? '#2D1E4A' : '#05091C', borderRadius: '14px', cursor: 'pointer', display: 'flex', flexDirection: 'row', justifyContent: 'space-between', p: '4px', pl: '18px' }}>
      <TokenInfo genesisHash={genesisHash} />
      <StakingBadge hasPoolStaking={hasPoolStaking} isFullscreen />
      <TestnetBadge style={{ mt: 0, visibility: isTestNet ? 'visible' : 'hidden' }} />
      <ChainIdentifier genesisHash={genesisHash} />
      <Staked balance={balance} decimal={decimal} price={price} token={token} />
      <ArrowButton onClick={noop} />
    </Container>
  );
}

export default memo(PositionItem);
