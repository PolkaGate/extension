// Copyright 2019-2024 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { ApiPromise } from '@polkadot/api';
import type { BalancesInfo } from '@polkadot/extension-polkagate/util/types';

import { Boy as BoyIcon } from '@mui/icons-material';
import { Box, Slide, useTheme } from '@mui/material';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router';
import { useHistory, useLocation } from 'react-router-dom';

import { BN, bnMax } from '@polkadot/util';

import { PoolStakingIcon } from '../../components';
import { useApi, useMinToReceiveRewardsInSolo, usePoolConsts, useStakingConsts, useTranslation, useUnSupportedNetwork } from '../../hooks';
import { STAKING_CHAINS } from '../../util/constants';
import StakingOption from './partial/StakingOption';

interface Props {
  showStakingOptions: boolean;
  setShowStakingOptions: React.Dispatch<React.SetStateAction<boolean>>;
  balance: BalancesInfo | undefined
}

export default function Options({ balance, setShowStakingOptions, showStakingOptions }: Props): React.ReactElement {
  const { t } = useTranslation();
  const history = useHistory();
  const theme = useTheme();
  const { pathname, state } = useLocation<{ api: ApiPromise }>();
  const { address } = useParams<{ address: string }>();
  const api = useApi(address, state?.api);

  useUnSupportedNetwork(address, STAKING_CHAINS, () => setShowStakingOptions(false));
  const stakingConsts = useStakingConsts(address);
  const poolConsts = usePoolConsts(address);
  const minimumActiveStake = useMinToReceiveRewardsInSolo(address);

  const [minToReceiveRewardsInSolo, setMinToReceiveRewardsInSolo] = useState<BN | undefined>();

  const hasSoloStake = Boolean(balance?.soloTotal && !balance.soloTotal.isZero());
  const hasPoolStake = Boolean(balance?.pooledBalance && !balance.pooledBalance.isZero());

  const isMigrationEnabled = useMemo(() => !!api?.tx?.['nominationPools']?.['migrateDelegation'], [api]);
  const disableSolo = useMemo(() => isMigrationEnabled && hasPoolStake && !hasSoloStake, [hasPoolStake, hasSoloStake, isMigrationEnabled]);
  const disablePool = useMemo(() => isMigrationEnabled && hasSoloStake && !hasPoolStake, [hasPoolStake, hasSoloStake, isMigrationEnabled]);

  useEffect(() => {
    if (!stakingConsts || !minimumActiveStake) {
      return setMinToReceiveRewardsInSolo(undefined);
    }

    const minSolo = bnMax(new BN(stakingConsts.minNominatorBond.toString()), new BN(stakingConsts?.existentialDeposit.toString()), minimumActiveStake);

    setMinToReceiveRewardsInSolo(minSolo);
  }, [minimumActiveStake, stakingConsts]);

  const goToPoolStaking = useCallback(() => {
    address && history.push({
      pathname: `/pool/${address}/`,
      state: { api, pathname, poolConsts, stakingConsts }
    });
  }, [address, api, history, pathname, poolConsts, stakingConsts]);

  const goToSoloStaking = useCallback(() => {
    address && history.push({
      pathname: `/solo/${address}/`,
      state: { api, pathname, stakingConsts }
    });
  }, [address, api, history, pathname, stakingConsts]);

  return (
    <Slide
      direction='up'
      in={showStakingOptions}
      mountOnEnter
      unmountOnExit
    >
      <Box sx={{ zIndex: -1 }}>
        <StakingOption
          api={api}
          balance={poolConsts?.minJoinBond}
          balanceText={t('Minimum to join a pool')}
          buttonText={t<string>('Enter')}
          helperText={t('All the members of a pool act as a single nominator and the earnings of the pool are split pro rata to a member\'s stake in the bonded pool.')}
          isDisabled={disablePool}
          logo={<PoolStakingIcon color={theme.palette.text.primary} />}
          onClick={goToPoolStaking}
          showQuestionMark
          style={{
            m: '5px auto',
            width: '100%'
          }}
          text={t('Stakers (members) with a small amount of tokens can pool their funds together.')}
          title={t('Pool Staking')}
        />
        <StakingOption
          api={api}
          balance={minToReceiveRewardsInSolo}
          balanceText={t('Minimum to receive rewards')}
          buttonText={t<string>('Enter')}
          helperText={t('Each solo staker will be responsible to nominate validators and keep eyes on them to re-nominate if needed.')}
          isDisabled={disableSolo}
          logo={
            <BoyIcon
              sx={{
                color: 'text.primary',
                fontSize: '30px'
              }}
            />
          }
          onClick={goToSoloStaking}
          showQuestionMark
          style={{
            m: 'auto',
            width: '100%'
          }}
          text={t('Stakers (nominators) with a sufficient amount of tokens can choose solo staking.')}
          tipPlace='bottom'
          title={t('Solo Staking')}
        />
      </Box>
    </Slide>
  );
}
