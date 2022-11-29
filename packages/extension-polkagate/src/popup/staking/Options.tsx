// Copyright 2019-2022 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Box, Slide } from '@mui/material';
import React, { useCallback, useEffect, useState } from 'react';
import { useParams } from 'react-router';
import { useHistory, useLocation } from 'react-router-dom';

import { BN, bnMax } from '@polkadot/util';

import { useApi, useNominator, usePoolConsts, useStakingConsts, useTranslation } from '../../hooks';
import Option from './partial/Option';

interface Props {
  showStakingOptions: boolean
}

export default function Options({ showStakingOptions }: Props): React.ReactElement {
  const { t } = useTranslation();
  const history = useHistory();
  const { pathname, state } = useLocation();
  const { address } = useParams<{ address: string }>();
  const api = useApi(address, state?.api);
  const stakingConsts = useStakingConsts(address);
  const poolConsts = usePoolConsts(address);
  const nominatorInfo = useNominator(address);

  const [minToReceiveRewardsInSolo, setMinToReceiveRewardsInSolo] = useState<BN | undefined>();

  useEffect(() => {
    if (!stakingConsts || !nominatorInfo?.minNominated) { return; }

    const minSolo = bnMax(new BN(stakingConsts.minNominatorBond.toString()), new BN(stakingConsts?.existentialDeposit.toString()), new BN(nominatorInfo.minNominated.toString()));

    setMinToReceiveRewardsInSolo(minSolo);
  }, [nominatorInfo?.minNominated, stakingConsts]);

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
    <Slide direction='up' mountOnEnter unmountOnExit in={showStakingOptions}>
      <Box sx={{ zIndex: -1 }}>
        <Option
          api={api}
          balance={poolConsts?.minJoinBond}
          balanceText={t('Minimum to join a pool')}
          buttonText={t<string>('Enter')}
          onClick={goToPoolStaking}
          style={{
            m: '5px auto',
            width: '100%'
          }}
          text={t('Stakers (members) with a small amount of tokens can pool their funds together.')}
          title={t('Pool Staking')}
        />
        <Option
          api={api}
          balance={minToReceiveRewardsInSolo}
          balanceText={t('Minimum to receive rewards')}
          buttonText={t<string>('Enter')}
          onClick={goToSoloStaking}
          style={{
            m: 'auto',
            width: '100%'
          }}
          text={t('Stakers (nominators) with sufficient amount of tokens can choose solo staking.')}
          title={t('Solo Staking')}
        />
      </Box>
    </Slide>
  );
}
