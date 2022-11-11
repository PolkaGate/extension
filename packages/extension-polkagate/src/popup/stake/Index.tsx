// Copyright 2019-2022 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { ApiPromise } from '@polkadot/api';
import type { NominatorInfo, PoolStakingConsts, SavedMetaData, StakingConsts, Validators } from '../../util/types';

import React, { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router';
import { useHistory, useLocation } from 'react-router-dom';

import { Chain } from '@polkadot/extension-chains/types';
import { BN, bnMax } from '@polkadot/util';

import { ActionContext } from '../../components';
import { useApi, useApi2, useChain, useEndpoint, useEndpoint2, useFormatted, useMetadata, useNominator, usePoolConsts, useStakingConsts, useTranslation } from '../../hooks';
import { updateMeta } from '../../messaging';
import { HeaderBrand } from '../../partials';
import { getSubstrateAddress, prepareMetaData } from '../../util/utils';
import Option from './partial/Option';

const workers: Worker[] = [];

export default function Index(): React.ReactElement {
  const { t } = useTranslation();
  const onAction = useContext(ActionContext);
  const history = useHistory();
  const { state, pathname } = useLocation();
  const { address } = useParams<{ address: string }>();
  const api = useApi2(address, state?.api);
  const stakingConsts = useStakingConsts(address);
  const poolConsts = usePoolConsts(address);
  const nominatorInfo = useNominator(address);

  const [minToReceiveRewardsInSolo, setMinToReceiveRewardsInSolo] = useState<BN | undefined>();
  const [validatorsInfo, setValidatorsInfo] = useState<Validators | undefined>(); // validatorsInfo is all validators (current and waiting) information
  const [currentEraIndexOfStore, setCurrentEraIndexOfStore] = useState<number | undefined>();
  const [gettingNominatedValidatorsInfoFromChain, setGettingNominatedValidatorsInfoFromChain] = useState<boolean>(true);
  const [validatorsInfoIsUpdated, setValidatorsInfoIsUpdated] = useState<boolean>(false);
  const [validatorsIdentitiesIsFetched, setValidatorsIdentitiesIsFetched] = useState<boolean>(false);
  const [validatorsIdentities, setValidatorsIdentities] = useState<DeriveAccountInfo[] | undefined>();
  const [localStrorageIsUpdate, setStoreIsUpdate] = useState<boolean>(false);

  const onBackClick = useCallback(() => {
    onAction(state?.pathname ?? '/');
  }, [onAction, state?.pathname]);

  useEffect(() => {
    if (!stakingConsts || !nominatorInfo?.minNominated) { return; }

    const minSolo = bnMax(new BN(stakingConsts.minNominatorBond.toString()), new BN(stakingConsts?.existentialDeposit.toString()), new BN(nominatorInfo.minNominated.toString()));

    setMinToReceiveRewardsInSolo(minSolo);
  }, [nominatorInfo?.minNominated, stakingConsts]);

  const goToPoolStaking = useCallback(() => {
    address && history.push({
      pathname: `/pool/${address}/`,
      state: { api, pathname }
    });
  }, [address, api, history, pathname]);

  return (
    <>
      <HeaderBrand
        onBackClick={onBackClick}
        showBackArrow
        showClose
        text={t<string>('Staking')}
      />
      <Option
        api={api}
        balance={poolConsts?.minJoinBond}
        balanceText={t('Minimum to join a pool')}
        buttonText={t<string>('Enter')}
        onClick={goToPoolStaking}
        style={{
          m: '15px auto',
          width: '92%'
        }}
        text={t('Stakers (members) with a small amount of tokens can pool their funds together and act as a single nominator. The earnings of the pool are split pro rata to a member\'s stake in the bonded pool.')}
        title={t('Pool Staking')}
      />
      <Option
        api={api}
        balance={minToReceiveRewardsInSolo}
        balanceText={t('Minimum to receive rewards')}
        buttonText={t<string>('Enter')}
        onClick={goToPoolStaking}
        style={{
          m: 'auto',
          width: '92%'
        }}
        text={t('Stakers (nominators) with sufficient amount of tokens can choose solo staking. Each solo staker will be responsible to nominate validators and keep eyes on them to re-nominate if needed.')}
        title={t('Solo Staking')}
      />
    </>
  );
}
