// Copyright 2019-2022 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { ApiPromise } from '@polkadot/api';
import type { AccountsBalanceType, NominatorInfo, PoolStakingConsts, SavedMetaData, StakingConsts, Validators } from '../../util/types';

import { Container, Grid } from '@mui/material';
import React, { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router';
import { useHistory, useLocation } from 'react-router-dom';

import { Chain } from '@polkadot/extension-chains/types';
import { BN, bnMax } from '@polkadot/util';

import { ActionContext, ButtonWithCancel, PButton, ShowBalance } from '../../components';
import { useApi, useEndpoint, useMetadata, useTranslation } from '../../hooks';
import { editAccount, updateMeta } from '../../messaging';
import { HeaderBrand } from '../../partials';
import { getSubstrateAddress, prepareMetaData } from '../../util/utils';

const workers: Worker[] = [];

export default function Index(): React.ReactElement {
  const { t } = useTranslation();
  const onAction = useContext(ActionContext);

  const { state } = useLocation();
  const { formatted, genesisHash } = useParams<{ formatted: string, genesisHash: string }>();
  const address = useMemo(() => getSubstrateAddress(formatted), [formatted]);
  const chain = useMetadata(genesisHash, true);
  const endpoint = useEndpoint(formatted, chain);

  const api = useApi(endpoint);

  const [apiToUse, setApiToUse] = useState<ApiPromise | undefined>(state?.api);

  const [stakingConsts, setStakingConsts] = useState<StakingConsts | undefined>();
  const [nominatorInfo, setNominatorInfo] = useState<NominatorInfo | undefined>();
  const [poolStakingOpen, setPoolStakingOpen] = useState<boolean>(false);
  const [soloStakingOpen, setSoloStakingOpen] = useState<boolean>(false);
  const [poolStakingConsts, setPoolStakingConsts] = useState<PoolStakingConsts | undefined>();
  const [stakingType, setStakingType] = useState<string | undefined>(undefined);
  const [minToReceiveRewardsInSolo, setMinToReceiveRewardsInSolo] = useState<BN | undefined>();
  const [validatorsInfo, setValidatorsInfo] = useState<Validators | undefined>(); // validatorsInfo is all validators (current and waiting) information
  const [currentEraIndexOfStore, setCurrentEraIndexOfStore] = useState<number | undefined>();
  const [gettingNominatedValidatorsInfoFromChain, setGettingNominatedValidatorsInfoFromChain] = useState<boolean>(true);
  const [validatorsInfoIsUpdated, setValidatorsInfoIsUpdated] = useState<boolean>(false);
  const [validatorsIdentitiesIsFetched, setValidatorsIdentitiesIsFetched] = useState<boolean>(false);
  const [validatorsIdentities, setValidatorsIdentities] = useState<DeriveAccountInfo[] | undefined>();
  const [localStrorageIsUpdate, setStoreIsUpdate] = useState<boolean>(false);
  const [currentEraIndex, setCurrentEraIndex] = useState<number | undefined>();

  const getStakingConsts = useCallback((chain: Chain, endpoint: string) => {
    /** 1- get some staking constant like min Nominator Bond ,... */
    const getStakingConstsWorker: Worker = new Worker(new URL('../../util/workers/getStakingConsts.js', import.meta.url));

    workers.push(getStakingConstsWorker);

    getStakingConstsWorker.postMessage({ endpoint });

    getStakingConstsWorker.onerror = (err) => {
      console.log(err);
    };

    getStakingConstsWorker.onmessage = (e: MessageEvent<any>) => {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const c: StakingConsts = e.data;

      if (c) {
        c.existentialDeposit = new BN(c.existentialDeposit);
        c.minNominatorBond = new BN(c.minNominatorBond);
        setStakingConsts(c);

        if (formatted) {
          // eslint-disable-next-line no-void
          void updateMeta(address, prepareMetaData(chain, 'stakingConsts', JSON.stringify(c)));
        }
      }

      getStakingConstsWorker.terminate();
    };
  }, [address, formatted]);

  const getPoolStakingConsts = useCallback((endpoint: string) => {
    const getPoolStakingConstsWorker: Worker = new Worker(new URL('../../util/workers/getPoolStakingConsts.js', import.meta.url));

    workers.push(getPoolStakingConstsWorker);

    getPoolStakingConstsWorker.postMessage({ endpoint });

    getPoolStakingConstsWorker.onerror = (err) => {
      console.log(err);
    };

    getPoolStakingConstsWorker.onmessage = (e: MessageEvent<any>) => {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const c: PoolStakingConsts = e.data;

      if (c) {
        c.lastPoolId = new BN(c.lastPoolId);
        c.minCreateBond = new BN(c.minCreateBond);
        c.minCreationBond = new BN(c.minCreationBond);
        c.minJoinBond = new BN(c.minJoinBond);
        c.minNominatorBond = new BN(c.minNominatorBond);

        setPoolStakingConsts(c);

        console.log('poolStakingConst:', c);

        if (formatted) {
          // eslint-disable-next-line no-void
          void updateMeta(address, prepareMetaData(chain, 'poolStakingConsts', JSON.stringify(c)));
        }
      }

      getPoolStakingConstsWorker.terminate();
    };
  }, [address, chain, formatted]);

  const getNominatorInfo = (endpoint: string, stakerAddress: string) => {
    const getNominatorInfoWorker: Worker = new Worker(new URL('../../util/workers/getNominatorInfo.js', import.meta.url));

    workers.push(getNominatorInfoWorker);

    getNominatorInfoWorker.postMessage({ endpoint, stakerAddress });

    getNominatorInfoWorker.onerror = (err) => {
      console.log(err);
    };

    getNominatorInfoWorker.onmessage = (e: MessageEvent<any>) => {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const nominatorInfo: NominatorInfo = e.data;

      console.log('nominatorInfo for solo:', nominatorInfo);

      setNominatorInfo(nominatorInfo);
      getNominatorInfoWorker.terminate();
    };
  };

  const getValidatorsInfo = (chain: Chain, endpoint: string, validatorsInfoFromStore: SavedMetaData) => {
    const getValidatorsInfoWorker: Worker = new Worker(new URL('../../util/workers/getValidatorsInfo.js', import.meta.url));

    workers.push(getValidatorsInfoWorker);

    getValidatorsInfoWorker.postMessage({ endpoint });

    getValidatorsInfoWorker.onerror = (err) => {
      console.log(err);
    };

    getValidatorsInfoWorker.onmessage = (e) => {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const fetchedValidatorsInfo: Validators | null = e.data;

      setGettingNominatedValidatorsInfoFromChain(false);

      if (fetchedValidatorsInfo && JSON.stringify(validatorsInfoFromStore?.metaData) !== JSON.stringify(fetchedValidatorsInfo)) {
        setValidatorsInfo(fetchedValidatorsInfo);

        // eslint-disable-next-line no-void
        void updateMeta(address, prepareMetaData(chain, 'validatorsInfo', fetchedValidatorsInfo));
      }

      setValidatorsInfoIsUpdated(true);
      getValidatorsInfoWorker.terminate();
    };
  };

  useEffect(() => {
    /** get some staking constant like min Nominator Bond ,... */
    endpoint && getStakingConsts(chain, endpoint);
    endpoint && getPoolStakingConsts(endpoint);
  }, [chain, endpoint, getPoolStakingConsts, getStakingConsts]);

  const _onBackClick = useCallback(() => {
    onAction(state?.pathname ?? '/');
  }, [onAction, state?.pathname]);

  useEffect(() => {
    /**  get nominator staking info to consider rebag ,... */
    endpoint && getNominatorInfo(endpoint, formatted);
  }, [endpoint, formatted]);

  useEffect(() => {
    if (!stakingConsts || !nominatorInfo?.minNominated) { return; }

    const minSolo = bnMax(new BN(stakingConsts.minNominatorBond.toString()), new BN(stakingConsts?.existentialDeposit.toString()), new BN(nominatorInfo.minNominated.toString()));

    setMinToReceiveRewardsInSolo(minSolo);
  }, [nominatorInfo?.minNominated, stakingConsts]);

  const Option = ({ title, text, minText, balance }: { balance?: BN, title: string, text: string, minText: string }) => (
    <Grid container direction='column' justifyContent='center' alignItems='center' sx={{ border: '0.5px solid #BA2882', backgroundColor: 'background.paper', borderRadius: '5%', px: '14px', py: '15px', mt: '15px', letterSpacing: '-1.5%' }}>
      <Grid item sx={{ fontSize: '20px', fontWeight: 400 }}>
        {title}
      </Grid>
      <Grid item sx={{ fontSize: '14px', pt: '5px' }}>
        {text}
      </Grid>
      <Grid container justifyContent='space-between' item sx={{ fontSize: '14px', fontWeight: 400, pt: '10px' }}>
        <Grid item sx={{ fontSize: '14px', fontWeight: 400 }}>
          {minText}
        </Grid>
        <Grid item sx={{ fontSize: '14px', fontWeight: 400 }}>
          <ShowBalance
            api={apiToUse || api}
            balance={balance}
          />
        </Grid>
      </Grid>
      <PButton
        // _isBusy={isBusy}
        _mt={'15px'}
        _ml={0}
        _width={100}
        // _onClick={_onCreate}
        // disabled={!password || !name}
        text={t('Enter')}
      />
    </Grid>
  );

  return (
    <>
      <HeaderBrand
        onBackClick={_onBackClick}
        showBackArrow
        text={t<string>('Staking')}
      />
      <Container
        disableGutters
        sx={{ px: '10px' }}
      >
        <Option
          balance={poolStakingConsts?.minJoinBond}
          minText={t('Minimum to join a pool')}
          text={t('Stakers (members) with a small amount of tokens can pool their funds together and act as a single nominator. The earnings of the pool are split pro rata to a member\'s stake in the bonded pool.')}
          title={t('Pool Staking')}
        />
        <Option
          balance={minToReceiveRewardsInSolo}
          minText={t('Minimum to receive rewards')}
          text={t('Stakers (nominators) with sufficient amount of tokens can choose solo staking. Each solo staker will be responsible to nominate validators and keep eyes on them to re-nominate if needed.')}
          title={t('Solo Staking')}
        />
      </Container>
    </>
  );
}
