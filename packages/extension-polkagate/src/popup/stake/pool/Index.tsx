// Copyright 2019-2022 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import '@vaadin/icons';

import type { ApiPromise } from '@polkadot/api';
import type { DeriveBalancesAll } from '@polkadot/api-derive/types';
import type { Option, StorageKey } from '@polkadot/types';
import type { AccountId32 } from '@polkadot/types/interfaces';
import type { MembersMapEntry, MyPoolInfo, NominatorInfo, PoolInfo, PoolStakingConsts, SavedMetaData, StakingConsts, Validators } from '../../../util/types';

import { ArrowForwardIos as ArrowForwardIosIcon } from '@mui/icons-material';
import { Container, Divider, Grid, useTheme } from '@mui/material';
import React, { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router';
import { useHistory, useLocation } from 'react-router-dom';

import { DeriveAccountInfo, DeriveStakingQuery } from '@polkadot/api-derive/types';
import { Chain } from '@polkadot/extension-chains/types';
import { BN, BN_ZERO, bnMax } from '@polkadot/util';

import { ActionContext, FormatBalance, HorizontalMenuItem, ShowBalance } from '../../../components';
import { useApi, useChain, useEndpoint, useFormatted, useMapEntries, useMetadata, useTranslation } from '../../../hooks';
import { updateMeta } from '../../../messaging';
import { HeaderBrand } from '../../../partials';
import { getSubstrateAddress, prepareMetaData } from '../../../util/utils';
import { getValue } from '../../account/util';
import Info from './Info';

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

interface SessionIfo {
  eraLength: number;
  eraProgress: number;
  currentEra: number;
}

const options = { year: '2-digit', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
const workers: Worker[] = [];

export default function Index(): React.ReactElement {
  const { t } = useTranslation();
  const onAction = useContext(ActionContext);
  const theme = useTheme();
  const history = useHistory();
  const { pathname, state } = useLocation();
  const { address } = useParams<{ address: string }>();
  const formatted = useFormatted(address);
  const chain = useChain(address);
  const endpoint = useEndpoint(formatted, chain);

  const api = useApi(endpoint);

  const [apiToUse, setApiToUse] = useState<ApiPromise | undefined>(api || state?.api);
  const token = apiToUse && apiToUse.registry.chainTokens[0];
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
  const [currentEraIndex, setCurrentEraIndex] = useState<number | undefined>(state?.currentEraIndex);

  const poolsMembers: MembersMapEntry[] | undefined = useMapEntries(api?.query?.nominationPools?.poolMembers, OPT_ENTRIES);

  const [poolsInfo, setPoolsInfo] = useState<PoolInfo[] | undefined | null>(undefined);
  const [myPool, setMyPool] = useState<MyPoolInfo | undefined | null>(state?.myPool);
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
  const [redeemable, setRedeemable] = useState<BN | undefined>(state?.redeemable);
  const [unlockingAmount, setUnlockingAmount] = useState<BN | undefined>();
  const [balances, setBalances] = useState<DeriveBalancesAll | undefined>(state?.balances as DeriveBalancesAll);
  const [sessionInfo, setSessionInfo] = useState<SessionIfo>();
  const [toBeReleased, setToBeReleased] = useState<{ date: number, amount: BN }[]>();
  const [showUnlockings, setShowUnlockings] = useState<boolean>(false);
  const [showInfo, setShowInfo] = useState<boolean>(false);

  const staked = myPool === undefined ? undefined : new BN(myPool?.member?.points ?? 0);
  const claimable = useMemo(() => myPool === undefined ? undefined : new BN(myPool?.myClaimable ?? 0), [myPool]);

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

  const _toggleShowUnlockings = useCallback(() => setShowUnlockings(!showUnlockings), [showUnlockings]);

  useEffect(() => {
    api && !apiToUse && setApiToUse(api);
  }, [api, apiToUse]);

  useEffect(() => {
    api && api.derive.session?.progress().then((sessionInfo) => {
      setSessionInfo({
        currentEra: Number(sessionInfo.currentEra),
        eraLength: Number(sessionInfo.eraLength),
        eraProgress: Number(sessionInfo.eraProgress)
      });
    }).catch(console.error);
  }, [api]);

  useEffect(() => {
    /** get some staking constant like min Nominator Bond ,... */
    endpoint && getStakingConsts(chain, endpoint);
    endpoint && getPoolStakingConsts(endpoint);
  }, [chain, endpoint, getPoolStakingConsts, getStakingConsts]);

  useEffect(() => {
    endpoint && getPoolInfo(endpoint, formatted);

    endpoint && getPools(endpoint);
  }, [endpoint, formatted]);

  useEffect(() => {
    // eslint-disable-next-line no-void
    endpoint && apiToUse && void apiToUse.derive.balances?.all(formatted).then((b) => {
      setBalances(b);
    });
  }, [apiToUse, formatted, endpoint]);

  useEffect((): void => {
    // eslint-disable-next-line no-void
    api && void api.query.staking.currentEra().then((ce) => {
      setCurrentEraIndex(Number(ce));
    });
  }, [api]);

  useEffect(() => {
    if (myPool === undefined || !api || !currentEraIndex || !sessionInfo) {
      return;
    }

    let unlockingValue = BN_ZERO;
    let redeemValue = BN_ZERO;
    const toBeReleased = [];

    if (myPool !== null && myPool.member?.unbondingEras) { // if pool is fetched but account belongs to no pool then pool===null
      for (const [era, unbondingPoint] of Object.entries(myPool.member?.unbondingEras)) {
        const remainingEras = Number(era) - currentEraIndex;

        if (remainingEras < 0) {
          redeemValue = redeemValue.add(new BN(unbondingPoint as string));
        } else {
          const amount = new BN(unbondingPoint as string);

          unlockingValue = unlockingValue.add(amount);

          const secToBeReleased = (remainingEras * sessionInfo.eraLength + (sessionInfo.eraLength - sessionInfo.eraProgress)) * 6;

          toBeReleased.push({ amount, date: Date.now() + (secToBeReleased * 1000) });
        }
      }
    }

    setToBeReleased(toBeReleased);
    setRedeemable(redeemValue);
    setUnlockingAmount(unlockingValue);
  }, [myPool, api, currentEraIndex, sessionInfo]);

  useEffect(() => {
    /**  get nominator staking info to consider rebag ,... */
    endpoint && getNominatorInfo(endpoint, formatted);
  }, [endpoint, formatted]);

  useEffect(() => {
    if (!stakingConsts || !nominatorInfo?.minNominated) { return; }

    const minSolo = bnMax(new BN(stakingConsts.minNominatorBond.toString()), new BN(stakingConsts?.existentialDeposit.toString()), new BN(nominatorInfo.minNominated.toString()));

    setMinToReceiveRewardsInSolo(minSolo);
  }, [nominatorInfo?.minNominated, stakingConsts]);

  const onBackClick = useCallback(() => {
    onAction(state?.pathname ?? '/');
  }, [onAction, state]);

  const goToUnstake = useCallback(() => {
    history.push({
      pathname: `/pool/unstake/${address}`,
      state: { api, balances, claimable, myPool, pathname, redeemable, unlockingAmount }
    });
  }, [address, api, balances, claimable, history, pathname, redeemable, myPool, unlockingAmount]);

  const goToInfo = useCallback(() => {
    setShowInfo(true);
  }, []);

  const ToBeReleased = () => (
    <Grid container sx={{ borderTop: '1px solid', borderTopColor: 'secondary.main', fontSize: '16px', fontWeight: 500, ml: '10%', width: '85%' }}>
      <Grid item pt='10px' xs={12}>
        {t('To be released')}
      </Grid>
      {toBeReleased?.map(({ amount, date }) => (
        <Grid container item key={date} spacing='15px' sx={{ fontSize: '16px', fontWeight: 500 }}>
          <Grid fontWeight={300} item>
            {new Date(date).toLocaleDateString(undefined, options)}
          </Grid>
          <Grid fontWeight={400} item>
            <FormatBalance api={api} decimalPoint={2} value={amount} />
          </Grid>
        </Grid>))
      }
    </Grid>
  );

  const Row = ({ label, link1Text, link2Text, onLink1, onLink2, showDivider = true, value }: { label: string, value: BN | undefined, link1Text?: Text, onLink1?: () => void, link2Text?: Text, onLink2?: () => void, showDivider?: boolean }) => {
    return (
      <>
        <Grid alignItems='center' container justifyContent='space-between' p='10px 15px'>
          <Grid item sx={{ fontSize: '16px', fontWeight: 300, letterSpacing: '-0.015em' }} xs={5}>
            {label}
          </Grid>
          <Grid container item justifyContent='flex-end' xs>
            <Grid alignItems='flex-end' container direction='column' item xs>
              <Grid item sx={{ fontSize: '20px', fontWeight: 400, letterSpacing: '-0.015em', lineHeight: '20px' }} >
                <ShowBalance api={apiToUse} balance={value} decimalPoint={2} />
              </Grid>
              <Grid container item justifyContent='flex-end' sx={{ fontSize: '16px', fontWeight: 400, letterSpacing: '-0.015em' }}>
                {link1Text &&
                  <Grid item onClick={onLink1} sx={{ color: !value || value?.isZero() ? 'text.disabled' : 'inherit', cursor: 'pointer', letterSpacing: '-0.015em', lineHeight: '36px', textDecorationLine: 'underline' }} >
                    {link1Text}
                  </Grid>
                }
                {link2Text &&
                  <>
                    <Grid alignItems='center' item justifyContent='center' mx='6px'>
                      <Divider orientation='vertical' sx={{ bgcolor: 'text.primary', height: '19px', mt: '10px', width: '2px' }} />
                    </Grid>
                    <Grid item onClick={onLink2} sx={{ color: !value || value?.isZero() ? 'text.disabled' : 'inherit', cursor: 'pointer', letterSpacing: '-0.015em', lineHeight: '36px', textDecorationLine: 'underline' }} >
                      {link2Text}
                    </Grid>
                  </>
                }
              </Grid>
            </Grid>
            {label === 'Unstaking' &&
              <Grid
                alignItems='center'
                container
                item
                onClick={_toggleShowUnlockings}
                sx={{ ml: '25px' }}
                xs={1}
              >
                <ArrowForwardIosIcon
                  sx={{ color: 'secondary.light', fontSize: 18, m: 'auto', stroke: '#BA2882', strokeWidth: '2px', transform: showUnlockings ? 'rotate(-90deg)' : 'rotate(90deg)' }}
                />
              </Grid>
            }
          </Grid>
        </Grid>
        {label === 'Unstaking' && showUnlockings && !!toBeReleased?.length &&
          <ToBeReleased />
        }
        {showDivider &&
          <Grid container item justifyContent='center' xs={12}>
            <Divider sx={{ bgcolor: 'secondary.main', m: '2px auto', width: '90%' }} />
          </Grid>
        }
      </>
    );
  };

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
        sx={{ pt: '5px' }}
      >
        <Row label={t('Staked')} link1Text={t('Unstake')} onLink1={staked && !staked?.isZero() && goToUnstake} value={staked} />
        <Row label={t('Rewards')} link1Text={t('Withdraw')} link2Text={t('Stake')} value={claimable} />
        <Row label={t('Redeemable')} link1Text={t('Withdraw')} value={redeemable} />
        <Row label={t('Unstaking')} link1Text={t('Restake')} value={unlockingAmount} />
        <Row label={t('Available to stake')} showDivider={false} value={getValue('available', balances)} />
        <Grid
          container
          justifyContent='space-around'
          sx={{
            borderTop: '2px solid',
            borderTopColor: 'secondary.main',
            bottom: 0,
            left: '4%',
            position: 'absolute',
            py: '10px',
            width: '92%'
          }}
        >
          <HorizontalMenuItem
            divider
            icon={<vaadin-icon icon='vaadin:plus-circle' style={{ height: '28px', color: `${theme.palette.text.primary}` }} />}
            onClick={goToInfo}
            title={t<string>('Stake')}
          />
          <HorizontalMenuItem
            divider
            exceptionWidth={30}
            icon={<vaadin-icon icon='vaadin:hand' style={{ height: '28px', color: `${theme.palette.text.primary}`, m: 'auto' }} />}
            onClick={goToInfo}
            title={t<string>('Selected Validators')}
          />
          <HorizontalMenuItem
            divider
            icon={<vaadin-icon icon='vaadin:grid-small' style={{ height: '28px', color: `${theme.palette.text.primary}` }} />}
            onClick={goToInfo}
            title={t<string>('Pool')}
          />
          <HorizontalMenuItem
            icon={<vaadin-icon icon='vaadin:info-circle' style={{ height: '28px', color: `${theme.palette.text.primary}` }} />}
            onClick={goToInfo}
            title={t<string>('Info')}
          />
        </Grid>
      </Container>
      <Info api={apiToUse} setShowInfo={setShowInfo} info={poolStakingConsts} showInfo={showInfo} />
    </>
  );
}
