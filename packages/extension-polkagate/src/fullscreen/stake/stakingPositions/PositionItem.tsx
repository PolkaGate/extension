// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Container, Grid, Typography } from '@mui/material';
import { ArrowRight2 } from 'iconsax-react';
import React, { memo, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router';

import { type BN } from '@polkadot/util';

import { ChainLogo, CryptoFiatBalance } from '../../../components';
import { useChainInfo, useSelectedAccount, useTranslation } from '../../../hooks';
import { StakingBadge, TestnetBadge } from '../../../popup/staking/StakingPositions';
import { updateStorage } from '../../../util';
import { ACCOUNT_SELECTED_CHAIN_NAME_IN_STORAGE, TEST_NETS } from '../../../util/constants';
import { amountToHuman } from '../../../util/utils';

interface TokenInfoProps {
  genesisHash: string;
}

const TokenInfo = ({ genesisHash }: TokenInfoProps) => {
  const { chainName, token } = useChainInfo(genesisHash, true);

  return (
    <Grid container item sx={{ alignItems: 'center', flexWrap: 'nowrap', gap: '6px', width: '100px' }}>
      <ChainLogo genesisHash={genesisHash} size={24} />
      <Grid container item sx={{ alignItems: 'flex-start', display: 'flex', flexDirection: 'column', width: 'fit-content' }}>
        <Typography color='text.primary' textTransform='uppercase' variant='B-2'>
          {token}
        </Typography>
        <Typography color='#AA83DC' variant='B-5'>
          {chainName}
        </Typography>
      </Grid>
    </Grid>
  );
};

const ArrowButton = ({ onClick }: { onClick: () => void }) => {
  return (
    <Grid container item onClick={onClick} sx={{ alignItems: 'center', bgcolor: '#2D1E4A', borderRadius: '8px', cursor: 'pointer', height: '36px', justifyContent: 'center', m: 'auto', mr: 0, width: '36px' }}>
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
  const { t } = useTranslation();
  const value = useMemo(() => amountToHuman(balance.muln(price), decimal), [balance, decimal, price]);

  return (
    <Grid container item sx={{ alignItems: 'center', display: 'flex', flexDirection: 'row', flexWrap: 'nowrap', gap: '18px', mr: '6%', width: '150px' }}>
      <Typography color='#AA83DC' variant='B-2'>
        {t('Staked')}:
      </Typography>
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

interface Props extends TokenInfoProps {
  type: 'pool' | 'solo';
  balance: BN;
  price: number;
  decimal: number;
  token: string;
  isSelected?: boolean;
}

function PositionItem ({ balance, decimal, genesisHash, isSelected, price, token, type }: Props) {
  const selectedAccount = useSelectedAccount();
  const navigate = useNavigate();
  const hasPoolStaking = useMemo(() => type === 'pool', [type]);
  const isTestNet = useMemo(() => TEST_NETS.includes(genesisHash), [genesisHash]);

  const onClick = useCallback(() => {
    if (!selectedAccount?.address) {
      return;
    }

    updateStorage(ACCOUNT_SELECTED_CHAIN_NAME_IN_STORAGE, { [selectedAccount.address]: genesisHash })
      .then(() => navigate('/fullscreen-stake/' + type + '/' + genesisHash) as void)
      .catch(console.error);
  }, [genesisHash, navigate, selectedAccount?.address, type]);

  return (
    <Container disableGutters sx={{ alignItems: 'center', bgcolor: isSelected ? '#6743944D' : '#05091C', borderRadius: '14px', display: 'flex', flexDirection: 'row', gap: '100px', justifyContent: 'space-between', p: '4px', pl: '18px' }}>
      <TokenInfo genesisHash={genesisHash} />
      <StakingBadge hasPoolStaking={hasPoolStaking} isFullscreen style={{ mr: '6%' }} />
      <Staked balance={balance} decimal={decimal} price={price} token={token} />
      <TestnetBadge style={{ mt: 0, visibility: isTestNet ? 'visible' : 'hidden' }} />
      <ArrowButton onClick={onClick} />
    </Container>
  );
}

export default memo(PositionItem);
