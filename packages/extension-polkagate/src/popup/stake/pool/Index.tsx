// Copyright 2019-2022 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import '@vaadin/icons';

import type { ApiPromise } from '@polkadot/api';
import type { Option, StorageKey } from '@polkadot/types';
import type { AccountId32 } from '@polkadot/types/interfaces';
import type { AccountsBalanceType, MembersMapEntry, MyPoolInfo, NominatorInfo, PoolInfo, PoolStakingConsts, SavedMetaData, StakingConsts, Validators } from '../../../util/types';

import { faHistory, faMinusCircle, faPlusCircle } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Container, Divider, Grid, IconButton, MenuItem, Typography, useTheme } from '@mui/material';
import React, { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router';
import { useLocation } from 'react-router-dom';

import { DeriveAccountInfo, DeriveStakingQuery } from '@polkadot/api-derive/types';
import { Chain } from '@polkadot/extension-chains/types';
import { BN, BN_ZERO, bnMax } from '@polkadot/util';

import { ActionContext, PButton, ShowBalance } from '../../../components';
import { useApi, useEndpoint, useMapEntries, useMetadata, useTranslation } from '../../../hooks';
import { updateMeta } from '../../../messaging';
import { HeaderBrand } from '../../../partials';
import { getSubstrateAddress, prepareMetaData } from '../../../util/utils';

const OPT_ENTRIES = {
  transform: (entries: [StorageKey<[AccountId32]>, Option<PalletNominationPoolsPoolMember>][]): MembersMapEntry[] =>
    entries.reduce((all: MembersMapEntry[], [{ args: [accountId] }, optMember]) => {
      if (optMember.isSome) {
        const member = optMember.unwrap();
        const poolId = member.poolId.toString();

        if (!all[poolId]) {
          all[poolId] = [];
        }

        all[poolId].push({
          accountId: accountId.toString(),
          member
        });
      }

      return all;
    }, {})
};


const workers: Worker[] = [];

export default function Index(): React.ReactElement {
  const { t } = useTranslation();
  const onAction = useContext(ActionContext);
  const theme = useTheme();

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


  const poolsMembers: MembersMapEntry[] | undefined = useMapEntries(api?.query?.nominationPools?.poolMembers, OPT_ENTRIES);

  const [poolsInfo, setPoolsInfo] = useState<PoolInfo[] | undefined | null>(undefined);
  const [myPool, setMyPool] = useState<MyPoolInfo | undefined | null>(undefined);
  const [newPool, setNewPool] = useState<MyPoolInfo | undefined>(); // new or edited Pool
  const [nextPoolId, setNextPoolId] = useState<BN | undefined>();
  const [showConfirmStakingModal, setConfirmStakingModalOpen] = useState<boolean>(false);
  const [showSelectValidatorsModal, setSelectValidatorsModalOpen] = useState<boolean>(false);
  const [amount, setAmount] = useState<BN>(BN_ZERO);
  const [currentlyStaked, setCurrentlyStaked] = useState<BN | undefined | null>();
  const [selectedValidators, setSelectedValidatorsAcounts] = useState<DeriveStakingQuery[] | null>(null);
  const [nominatedValidatorsId, setNominatedValidatorsId] = useState<string[] | undefined>();
  const [noNominatedValidators, setNoNominatedValidators] = useState<boolean | undefined>();// if TRUE, shows that nominators are fetched but is empty
  const [nominatedValidators, setNominatedValidatorsInfo] = useState<DeriveStakingQuery[] | null>(null);
  const [tabValue, setTabValue] = useState(4);
  const [oversubscribedsCount, setOversubscribedsCount] = useState<number | undefined>();
  const [activeValidator, setActiveValidator] = useState<DeriveStakingQuery>();


  const getStakingConsts = useCallback((chain: Chain, endpoint: string) => {
    /** 1- get some staking constant like min Nominator Bond ,... */
    const getStakingConstsWorker: Worker = new Worker(new URL('../../../util/workers/getStakingConsts.js', import.meta.url));

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
    const getPoolStakingConstsWorker: Worker = new Worker(new URL('../../../util/workers/getPoolStakingConsts.js', import.meta.url));

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
    const getNominatorInfoWorker: Worker = new Worker(new URL('../../../util/workers/getNominatorInfo.js', import.meta.url));

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
    const getValidatorsInfoWorker: Worker = new Worker(new URL('../../../util/workers/getValidatorsInfo.js', import.meta.url));

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

  /** get all information regarding the created/joined pool */
  const getPoolInfo = (endpoint: string, stakerAddress: string, id: number | undefined = undefined) => {
    const getPoolWorker: Worker = new Worker(new URL('../../../util/workers/getPool.js', import.meta.url));

    workers.push(getPoolWorker);

    getPoolWorker.postMessage({ endpoint, id, stakerAddress });

    getPoolWorker.onerror = (err) => {
      console.log(err);
    };

    getPoolWorker.onmessage = (e: MessageEvent<any>) => {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const info: string = e.data;

      if (!info) {
        setNoNominatedValidators(true);
        setMyPool(null);

        return;
      }

      const parsedInfo = JSON.parse(info) as MyPoolInfo;

      setNoNominatedValidators(!parsedInfo?.stashIdAccount?.nominators?.length);

      console.log('*** My pool info returned from worker is:', parsedInfo);

      // id ? setSelectedPool(parsedInfo) :
      setMyPool(parsedInfo);
      !id && setNominatedValidatorsId(parsedInfo?.stashIdAccount?.nominators);
      getPoolWorker.terminate();
    };
  };

  const getPools = (endpoint: string) => {
    const getPoolsWorker: Worker = new Worker(new URL('../../../util/workers/getPools.js', import.meta.url));

    workers.push(getPoolsWorker);

    getPoolsWorker.postMessage({ endpoint });

    getPoolsWorker.onerror = (err) => {
      console.log(err);
    };

    getPoolsWorker.onmessage = (e: MessageEvent<any>) => {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const poolsInfo: string = e.data;

      if (!poolsInfo) {
        return setPoolsInfo(null);// noo pools found, probably never happens
      }

      const parsedPoolsInfo = JSON.parse(poolsInfo);
      const info = parsedPoolsInfo.info as PoolInfo[];

      setNextPoolId(new BN(parsedPoolsInfo.nextPoolId));

      info?.forEach((p: PoolInfo) => {
        if (p?.bondedPool?.points) {
          p.bondedPool.points = new BN(String(p.bondedPool.points));
        }

        p.poolId = new BN(p.poolId);
      });

      setPoolsInfo(info);

      getPoolsWorker.terminate();
    };
  };

  useEffect(() => {
    endpoint && getPoolInfo(endpoint, formatted);

    endpoint && getPools(endpoint);
  }, [endpoint, formatted]);

  const onBackClick = useCallback(() => {
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

  const MenuItem = ({ icon, noDivider = false, onClick, title }: { icon: any, title: string, noDivider?: boolean, onClick: () => void }) => (
    <>
      <Grid container direction='column' item justifyContent='center' mt='5px' xs={2}>
        <Grid item width='fit-content' mx='5px'>
          <IconButton
            onClick={onClick}
            sx={{ alignSelf: 'center', transform: 'scale(0.9)', py: 0 }}
          >
            {icon}
          </IconButton>
        </Grid>
        <Grid item textAlign='center' sx={{ fontSize: '12px', fontWeight: 300, letterSpacing: '-0.015em' }}>
          {title}
        </Grid>
      </Grid>
      {!noDivider &&
        <Grid alignItems='center' item justifyContent='center' mx='6px'>
          <Divider orientation='vertical' sx={{ borderColor: 'text.primary', height: '30px', mt: '5px', width: '2px' }} />
        </Grid>
      }
    </>
  );

  const Menu = () => (
    <Grid container item sx={{ bottom: '10px', position: 'absolute' }}>
      <Grid item container justifyContent='center' xs={12}>
        <Divider sx={{ borderColor: 'secondary.main', borderWidth: '1.5px', mb: '5px', px: '15px', width: '90%' }} />
      </Grid>
      <Grid item container flexWrap='nowrap'>
        <MenuItem
          icon={<vaadin-icon icon='vaadin:plus-circle' style={{ height: '28px', color: `${theme.palette.text.primary}` }} />}
          // onClick={goToSend}
          title={'Stake'}
        />
        <MenuItem
          icon={<vaadin-icon icon='vaadin:minus-circle' style={{ height: '28px', color: `${theme.palette.text.primary}` }} />}
          // onClick={goToSend}
          title={'Unstake'}
        />
        <MenuItem
          icon={<vaadin-icon icon='vaadin:grid-small' style={{ height: '28px', color: `${theme.palette.text.primary}` }} />}
          // onClick={goToReceive}
          title={'Pool'}
        />
        <MenuItem
          icon={<vaadin-icon icon='vaadin:hand' style={{ height: '28px', color: `${theme.palette.text.primary}` }} />}
          // onClick={goToStaking}
          title={'Nomination'}
        />
        <MenuItem
          noDivider
          icon={<vaadin-icon icon='vaadin:info-circle' style={{ height: '28px', color: `${theme.palette.text.primary}` }} />}
          // onClick={goToHistory}
          title={'Info'}
        />
      </Grid>
    </Grid>
  );

  const staked = myPool === undefined ? undefined : new BN(myPool?.member?.points ?? 0);

  const Staked = () => (
    <Grid item p='13px 15px'>
      <Grid alignItems='center' container justifyContent='space-between'>
        <Grid item sx={{ fontSize: '16px', fontWeight: 300, letterSpacing: '-0.015em' }} xs={3}>
          {t('Staked')}
        </Grid>
        <Grid item sx={{ fontSize: '20px', fontWeight: 400, letterSpacing: '-0.015em', lineHeight: '20px' }} textAlign='right'>
          <ShowBalance api={api} balance={staked} decimalPoint={2} />
        </Grid>
      </Grid>
    </Grid>
  );

  return (
    <>
      <HeaderBrand
        onBackClick={onBackClick}
        showBackArrow
        showClose
        text={t<string>('Pool Staking')}
      />
      <Container
        disableGutters
      >
        <Staked />
        <Grid item container justifyContent='center' xs={12}>
          <Divider sx={{ borderColor: 'secondary.main', borderWidth: '1px', mb: '5px', px: '5px', width: '90%' }} />
        </Grid>

        <Menu />
      </Container>
    </>
  );
}
