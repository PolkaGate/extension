// Copyright 2019-2022 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import '@vaadin/icons';

import type { ApiPromise } from '@polkadot/api';
import type { DeriveAccountRegistration, DeriveBalancesAll } from '@polkadot/api-derive/types';
import type { Option, StorageKey } from '@polkadot/types';
import type { AccountId32 } from '@polkadot/types/interfaces';
import type { AccountsBalanceType, MembersMapEntry, MyPoolInfo, NominatorInfo, PoolInfo, PoolStakingConsts, SavedMetaData, StakingConsts, Validators } from '../../../util/types';

import { faHistory, faMinusCircle, faPlusCircle } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { ArrowForwardIos as ArrowForwardIosIcon } from '@mui/icons-material';
import { Container, Divider, Grid, IconButton, MenuItem, Typography, useTheme } from '@mui/material';
import React, { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router';
import { useLocation } from 'react-router-dom';

import { DeriveAccountInfo, DeriveStakingQuery } from '@polkadot/api-derive/types';
import { Chain } from '@polkadot/extension-chains/types';
import { BN, BN_ZERO, bnMax } from '@polkadot/util';

import { ActionContext, FormatBalance, PButton, ShowBalance } from '../../../components';
import { useApi, useEndpoint, useMapEntries, useMetadata, useTranslation } from '../../../hooks';
import { updateMeta } from '../../../messaging';
import { HeaderBrand } from '../../../partials';
import { getSubstrateAddress, prepareMetaData } from '../../../util/utils';
import { getValue } from '../../account/util';

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
  const [currentEraIndex, setCurrentEraIndex] = useState<number | undefined>(state?.currentEraIndex);


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
  const [redeemable, setRedeemable] = useState<BN | undefined>();
  const [unlockingAmount, setUnlockingAmount] = useState<BN | undefined>();
  const [balances, setBalances] = useState<DeriveBalancesAll | undefined>(state?.balances as DeriveBalancesAll);
  const [sessionInfo, setSessionInfo] = useState<SessionIfo>();
  const [toBeReleased, setToBeReleased] = useState<{ date: number, amount: BN }[]>();
  const [showUnlockings, setShowUnlockings] = useState<boolean>(false);

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
          console.log('sessionInfo.eraLength', sessionInfo.eraLength);
          console.log('sessionInfo.eraProgres', sessionInfo.eraProgres);
          console.log('remainingEras', remainingEras);
          console.log('secToBeReleased', secToBeReleased);
          toBeReleased.push({ amount, date: Date.now() + (secToBeReleased * 1000) });
        }
      }
    }

    setToBeReleased(toBeReleased);
    setRedeemable(redeemValue);
    setUnlockingAmount(unlockingValue);
  }, [myPool, api, currentEraIndex, sessionInfo]);

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

  const ToBeReleased = () => (
    <Grid container sx={{ fontSize: '16px', fontWeight: 500, ml: '35px' }}>
      <Grid item container>
        <Divider sx={{ borderColor: 'secondary.main', borderWidth: '1px', mb: '2px', px: '5px', width: '85%' }} />
      </Grid>
      <Grid item pt='10px' xs={12}>
        {t('To be released')}
      </Grid>
      {toBeReleased?.map(({ amount, date }) => (
        <Grid container key={date} sx={{ fontSize: '16px', fontWeight: 500 }} spacing='15px' item>
          <Grid item fontWeight={300}>
            {new Date(date).toLocaleDateString(undefined, options)}
          </Grid>
          <Grid item fontWeight={400}>
            <FormatBalance api={api} value={amount} decimalPoint={2} />
          </Grid>
        </Grid>))
      }
    </Grid>
  );

  const staked = myPool === undefined ? undefined : new BN(myPool?.member?.points ?? 0);
  const claimable = useMemo(() => myPool === undefined ? undefined : new BN(myPool?.myClaimable ?? 0), [myPool]);

  const Row = ({ label, link1Text, link2Text, onLink1, onLink2, showDivider = true, value }: { label: string, value: BN | undefined, link1Text?: Text, onLink1?: () => void, link2Text?: Text, onLink2?: () => void, showDivider?: boolean }) => {
    return (
      <>
        <Grid alignItems='center' p='10px 15px' container justifyContent='space-between'>
          <Grid item sx={{ fontSize: '16px', fontWeight: 300, letterSpacing: '-0.015em' }} xs={5}>
            {label}
          </Grid>
          <Grid container item xs justifyContent='flex-end'>
            <Grid container direction='column' item xs alignItems='flex-end'>
              <Grid item sx={{ fontSize: '20px', fontWeight: 400, letterSpacing: '-0.015em', lineHeight: '20px' }} >
                <ShowBalance api={api} balance={value} decimalPoint={2} />
              </Grid>
              <Grid container item justifyContent='flex-end' sx={{ fontSize: '16px', fontWeight: 400, letterSpacing: '-0.015em' }}>
                {link1Text &&
                  <Grid item sx={{ color: !value || value?.isZero() ? 'text.disabled' : 'inherit', cursor: 'pointer', letterSpacing: '-0.015em', lineHeight: '36px', textDecorationLine: 'underline' }} >
                    {link1Text}
                  </Grid>
                }
                {link2Text &&
                  <>
                    <Grid alignItems='center' item justifyContent='center' mx='6px'>
                      <Divider orientation='vertical' sx={{ borderColor: 'text.primary', height: '19px', mt: '10px', width: '2px' }} />
                    </Grid>
                    <Grid item sx={{ color: !value || value?.isZero() ? 'text.disabled' : 'inherit', cursor: 'pointer', letterSpacing: '-0.015em', lineHeight: '36px', textDecorationLine: 'underline' }} >
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
        {label === 'Unstaking' && showUnlockings &&
          <ToBeReleased />
        }
        {showDivider &&
          <Grid item container justifyContent='center' xs={12}>
            <Divider sx={{ borderColor: 'secondary.main', borderWidth: '1px', mb: '2px', px: '5px', width: '90%' }} />
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
        <Row label={t('Staked')} value={staked} />
        <Row label={t('Rewards')} value={claimable} link1Text={t('Claim')} link2Text={t('Stake')} />
        <Row label={t('Redeemable')} value={redeemable} link1Text={t('Withdraw')} />
        <Row label={t('Unstaking')} value={unlockingAmount} link1Text={t('Restake')} />
        <Row label={t('Available to stake')} value={getValue('available', balances)} showDivider={false} />
        <Menu />
      </Container>
    </>
  );
}
