// Copyright 2019-2023 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import type { ApiPromise } from '@polkadot/api';
import type { MyPoolInfo } from '../../../../util/types';

import { faPenToSquare, faPersonCircleXmark } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { ArrowForwardIos as ArrowForwardIosIcon, AutoDelete as AutoDeleteIcon, KeyboardDoubleArrowLeft as KeyboardDoubleArrowLeftIcon, KeyboardDoubleArrowRight as KeyboardDoubleArrowRightIcon, LockOpenRounded as UnblockIcon, LockPersonRounded as BlockIcon } from '@mui/icons-material';
import { Divider, Grid, Typography, useTheme } from '@mui/material';
import { Circle } from 'better-react-spinkit';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router';
import { useHistory, useLocation } from 'react-router-dom';

import { PButton, Select, Warning } from '../../../../components';
import { useApi, useChain, useFormatted, useMyPools, usePool, useTranslation, useUnSupportedNetwork } from '../../../../hooks';
import { HeaderBrand, SubTitle } from '../../../../partials';
import { STAKING_CHAINS } from '../../../../util/constants';
import ShowPool from '../../partial/ShowPool';
import ShowRoles from '../../partial/ShowRoles';
import EditPool from './editPool';
import RemoveAll from './removeAll';
import SetState from './SetState';

interface State {
  api: ApiPromise | undefined;
  pool?: MyPoolInfo;
}

interface ButtonsProps {
  children: any;
  disabled?: boolean;
  text: string;
  showDivider?: boolean;
  onClick: () => void;
}

interface ArrowsProps {
  onPrevious: () => void;
  onNext: () => void;
}

// eslint-disable-next-line @typescript-eslint/no-empty-function
const noop = () => { };

export default function Pool (): React.ReactElement {
  const { t } = useTranslation();
  const theme = useTheme();

  const { address } = useParams<{ address: string }>();
  const { state } = useLocation<State>();
  const api = useApi(address, state?.api);
  const [refresh, setRefresh] = useState<boolean>(false);
  const pool = usePool(address, undefined, refresh);
  const history = useHistory();
  const chain = useChain(address);
  const formatted = useFormatted(address);

  useUnSupportedNetwork(address, STAKING_CHAINS);
  const myOtherPools = useMyPools(address);

  const [poolIndex, setPoolIndex] = useState<number>(0);
  const [goChange, setGoChange] = useState<boolean>(false);
  const [changeState, setChangeState] = useState<'Open' | 'Blocked' | 'Destroying'>();
  const [showEdit, setShowEdit] = useState<boolean>(false);
  const [showRemoveAll, setShowRemoveAll] = useState<boolean>(false);
  const [roleToShow, setRoleToShow] = useState<string>('all');
  const [poolsToShow, setPoolsToShow] = useState<(MyPoolInfo | null | undefined)[] | null | undefined>();
  const [showPoolNavigation, setShowPoolNavigation] = useState<boolean>(false);

  const POOL_ROLES = useMemo(() => ([
    { text: t<string>('All'), value: 'all' },
    { text: t<string>('Depositor'), value: 'depositor' },
    { text: t<string>('Root'), value: 'root' },
    { text: t<string>('Nominator'), value: 'nominator' },
    { text: t<string>('Bouncer'), value: 'bouncer' }
  ]), [t]);

  const allMyPools = useMemo(() => {
    if (pool === undefined && myOtherPools === undefined) {
      return;
    }

    if (pool === null && myOtherPools === null) {
      return null;
    }

    if (pool && !myOtherPools?.length) {
      return [pool];
    }

    if (pool === null && myOtherPools?.length) {
      myOtherPools.length > 1 && setShowPoolNavigation(true);

      return myOtherPools;
    }

    if (pool && myOtherPools?.length) {
      const filtered = myOtherPools.filter((other) => Number(other.poolId) !== Number(pool.poolId));

      myOtherPools.length > 1 && setShowPoolNavigation(true);

      return [pool, ...filtered];
    }

    return undefined;
  }, [myOtherPools, pool]);

  useEffect(() => {
    if (allMyPools === undefined) {
      return;
    }

    if (allMyPools === null) {
      setPoolsToShow(null);

      return;
    }

    if (roleToShow !== 'all') {
      const filteredPools = allMyPools.filter((pool) => pool?.bondedPool?.roles[roleToShow] === formatted);

      setPoolsToShow([...filteredPools]);

      return;
    }

    setPoolsToShow([...allMyPools]);
  }, [allMyPools, formatted, roleToShow]);

  useEffect(() => {
    setPoolIndex(0);
  }, [roleToShow]);

  const poolState = poolsToShow && poolsToShow[poolIndex]?.bondedPool?.state?.toString();
  const canChangeState = useMemo(() => poolsToShow && poolsToShow[poolIndex]?.bondedPool && formatted && [String(poolsToShow[poolIndex]?.bondedPool?.roles?.root), String(poolsToShow[poolIndex]?.bondedPool?.roles?.bouncer)].includes(String(formatted)), [poolsToShow, formatted, poolIndex]);
  const poolRoot = useMemo(() => poolsToShow && poolsToShow[poolIndex]?.bondedPool && formatted && String(poolsToShow[poolIndex]?.bondedPool?.roles?.root) === (String(formatted)), [poolsToShow, formatted, poolIndex]);
  const poolBouncer = useMemo(() => poolsToShow && poolsToShow[poolIndex]?.bondedPool && formatted && String(poolsToShow[poolIndex]?.bondedPool?.roles?.bouncer) === (String(formatted)), [formatted, poolIndex, poolsToShow]);
  const disabledItems = useMemo(() => {
    if (!allMyPools || allMyPools.length === 1) {
      return;
    }

    const allRoles = ['depositor', 'root', 'nominator', 'bouncer'];
    const toDisable: string[] = [];

    allRoles.forEach((role, index) => {
      const available = allMyPools.find((pool) => pool?.bondedPool?.roles[role] === formatted);

      !available && toDisable.push(allRoles[index]);
    });

    return toDisable;
  }, [allMyPools, formatted]);

  const blockHelperText = t<string>('The pool state will be changed to Blocked, and no member will be able to join and only some admin roles can remove members.');
  const destroyHelperText = t<string>('No one can join and all members can be removed without permissions. Once in destroying state, it cannot be reverted to another state.');
  const unblockHelperText = t<string>('The pool state will be changed to Open, and any member will be able to join the pool.');
  const isRemoveAllDisabled = !['Destroying', 'Blocked'].includes(poolState ?? '') || (poolsToShow && Number(poolsToShow[poolIndex]?.bondedPool?.memberCounter) === 1);

  const backToStake = useCallback(() => {
    history.push({
      pathname: `/pool/${address}`,
      state: { ...state }
    });
  }, [address, history, state]);

  const goToPoolStake = useCallback(() => {
    history.push({
      pathname: `/pool/stake/${address}`,
      state: { pool: null }
    });
  }, [address, history]);

  const goBlock = useCallback(() => {
    if (poolState === 'Destroying' || poolState === 'Blocked') {
      return;
    }

    setGoChange(true);
    setChangeState('Blocked');
  }, [poolState]);

  const goUnlock = useCallback(() => {
    if (poolState === 'Destroying' || poolState !== 'Blocked') {
      return;
    }

    setGoChange(true);
    setChangeState('Open');
  }, [poolState]);

  const goDestroying = useCallback(() => {
    if (poolState === 'Destroying') {
      return;
    }

    setGoChange(true);
    setChangeState('Destroying');
  }, [poolState]);

  const goEdit = useCallback(() => {
    setShowEdit(!showEdit);
  }, [showEdit]);

  const goRemoveAll = useCallback(() => {
    setShowRemoveAll(!showRemoveAll);
  }, [showRemoveAll]);

  const goNextPool = useCallback(() => {
    poolsToShow && poolIndex !== (poolsToShow.length - 1) && setPoolIndex(poolIndex + 1);
  }, [poolsToShow, poolIndex]);

  const goPreviousPool = useCallback(() => {
    poolIndex !== 0 && setPoolIndex(poolIndex - 1);
  }, [poolIndex]);

  const onSelectionMethodChange = useCallback((value: string): void => {
    setRoleToShow(value);
  }, []);

  const onShowAllMyPools = useCallback((): void => {
    myOtherPools?.length && myOtherPools.length > 1 && setShowPoolNavigation(!showPoolNavigation);
  }, [myOtherPools, showPoolNavigation]);

  const Arrows = ({ onNext, onPrevious }: ArrowsProps) => (
    <Grid container justifyContent='space-between' m='15px auto 10px' width='92%'>
      <Grid alignItems='center' container item justifyContent='flex-start' maxWidth='35%' onClick={onPrevious} sx={{ cursor: (!poolsToShow?.length || poolIndex === 0) ? 'default' : 'pointer' }} width='fit_content'>
        <KeyboardDoubleArrowLeftIcon sx={{ color: (!poolsToShow?.length || poolIndex === 0) ? 'secondary.contrastText' : 'secondary.light', fontSize: '25px' }} />
        <Divider orientation='vertical' sx={{ bgcolor: (!poolsToShow?.length || poolIndex === 0) ? 'secondary.contrastText' : 'text.primary', height: '22px', ml: '3px', mr: '7px', my: 'auto', width: '1px' }} />
        <Grid container item xs={7}>
          <Typography color={(!poolsToShow?.length || poolIndex === 0) ? 'secondary.contrastText' : 'secondary.light'} fontSize='14px' fontWeight={400}>
            {t<string>('Previous')}
          </Typography>
        </Grid>
      </Grid>
      <Grid alignItems='center' container item justifyContent='center' width='30%'>
        {poolsToShow?.length &&
          <>
            <Typography fontSize='16px' fontWeight={400}>
              {`${poolIndex + 1} of ${poolsToShow.length}`}
            </Typography>
            {myOtherPools === undefined &&
              <div style={{ paddingLeft: '5px' }}>
                <Circle color={theme.palette.secondary.light} scaleEnd={0.7} scaleStart={0.4} size={20} />
              </div>
            }
          </>
        }
      </Grid>
      <Grid alignItems='center' container item justifyContent='flex-end' maxWidth='35%' onClick={onNext} sx={{ cursor: (!poolsToShow?.length || poolIndex === poolsToShow?.length - 1) ? 'default' : 'pointer' }} width='fit_content'>
        <Grid container item justifyContent='right' xs={7}>
          <Typography color={(!poolsToShow?.length || poolIndex === poolsToShow.length - 1) ? 'secondary.contrastText' : 'secondary.light'} fontSize='14px' fontWeight={400} textAlign='left'>
            {t<string>('Next')}
          </Typography>
        </Grid>
        <Divider orientation='vertical' sx={{ bgcolor: (!poolsToShow?.length || poolIndex === poolsToShow.length - 1) ? 'secondary.contrastText' : 'text.primary', height: '22px', ml: '7px', mr: '3px', my: 'auto', width: '1px' }} />
        <KeyboardDoubleArrowRightIcon sx={{ color: (!poolsToShow?.length || poolIndex === poolsToShow?.length - 1) ? 'secondary.contrastText' : 'secondary.light', fontSize: '25px' }} />
      </Grid>
    </Grid>
  );

  const ActionBtn = ({ children, disabled, onClick, showDivider, text }: ButtonsProps) => (
    <>
      <Grid alignItems='center' container direction='row' item onClick={!disabled ? onClick : noop} sx={{ cursor: disabled ? 'default' : 'pointer' }} width='fit-content'>
        {children}
        <Typography fontSize='14px' fontWeight={400} sx={{ color: disabled ? 'action.disabledBackground' : 'text.primary', pl: '5px', textDecorationLine: 'underline' }} width='fit-content'>
          {text}
        </Typography>
      </Grid>
      {showDivider &&
        <Divider orientation='vertical' sx={{ bgcolor: 'text.primary', height: '19px', m: 'auto 2px', width: '2px' }} />
      }
    </>
  );

  const AllMyPoolsButton = () => (
    <Grid alignItems='center' container item justifyContent='center' position='relative'>
      <Grid alignItems='center' container item justifyContent='center' lineHeight='36px' mb={`${showPoolNavigation ? '10px' : '30px'}`} onClick={onShowAllMyPools} sx={{ cursor: 'pointer', color: `${(!myOtherPools || myOtherPools?.length <= 1) ? theme.palette.text.disabled : ''}`, borderBottom: `2px solid ${theme.palette.secondary.light}` }} width='30%'>
        <Grid item>
          <Typography fontSize='14px' fontWeight={400}>
            {t('All My Pools')}
          </Typography>
        </Grid>
        <Grid item>
          <ArrowForwardIosIcon sx={{ color: `${!myOtherPools ? theme.palette.text.disabled : 'secondary.light'}`, fontSize: 16, ml: '2px', mt: '12px', stroke: `${(!myOtherPools || myOtherPools?.length <= 1) ? theme.palette.text.disabled : '#BA2882'}`, strokeWidth: '2px', transform: showPoolNavigation ? 'rotate(-90deg)' : 'rotate(90deg)', transitionDuration: '0.3s', transitionProperty: 'transform' }} />
        </Grid>

      </Grid>
      {myOtherPools === undefined &&
        <Grid item ml='5px' position='absolute' right='93px' mb='32px'>
          <Circle color={theme.palette.primary.main} scaleEnd={0.7} scaleStart={0.4} size={25} />
        </Grid>
      }
    </Grid>
  );

  return (
    <>
      <HeaderBrand
        onBackClick={backToStake}
        shortBorder
        showBackArrow
        showClose
        text={t<string>('Pool Staking')}
      />
      <SubTitle label={t<string>('Pool')} />
      {poolsToShow === undefined &&
        <>
          <Grid alignItems='center' container justifyContent='center' mt='100px'>
            <Circle color='#99004F' scaleEnd={0.7} scaleStart={0.4} size={125} />
          </Grid>
          <Typography fontSize='18px' fontWeight={300} m='60px auto 0' textAlign='center' width='80%'>
            {t<string>('Loading pool information...')}
          </Typography>
        </>
      }
      {poolsToShow === null &&
        <>
          <Grid container justifyContent='center' py='15px'>
            <Warning
              fontWeight={400}
              theme={theme}
            >
              {t<string>('You\'re not in any pools!')}
            </Warning>
          </Grid>
          <PButton
            _onClick={goToPoolStake}
            text={t<string>('Stake')}
          />
        </>
      }
      {poolsToShow?.length &&
        <Grid container justifyContent='center'>
          <AllMyPoolsButton />
          {myOtherPools && showPoolNavigation &&
            <>
              <Grid width='92%'>
                <Select
                  defaultValue={POOL_ROLES[0].value}
                  disabledItems={disabledItems}
                  isDisabled={allMyPools?.length === 1}
                  label={t('Select role')}
                  onChange={onSelectionMethodChange}
                  options={POOL_ROLES}
                />
              </Grid>
              <Arrows onNext={goNextPool} onPrevious={goPreviousPool} />
            </>
          }
          <ShowPool
            api={api}
            chain={chain}
            mode='Default'
            pool={poolsToShow[poolIndex]}
            showInfo
            style={{
              m: '0 auto',
              width: '92%'
            }}
          />
          <ShowRoles
            api={api}
            chain={chain}
            label={t<string>('Roles')}
            mode='Roles'
            pool={poolsToShow[poolIndex]}
            style={{ m: '15px auto', width: '92%' }}
          />
          {canChangeState &&
            <Grid alignItems='center' bottom='10px' container justifyContent='space-between' m='auto' position='absolute' width='92%'>
              <ActionBtn disabled={poolState === 'Destroying' || (!poolRoot && !poolBouncer)} onClick={goDestroying} showDivider text={t<string>('Destroy')}>
                <AutoDeleteIcon sx={{ color: poolState === 'Destroying' || (!poolRoot && !poolBouncer) ? 'action.disabledBackground' : 'text.primary', fontSize: '21px' }} />
              </ActionBtn>
              {poolState === 'Blocked'
                ? (<ActionBtn onClick={goUnlock} disabled={(!poolRoot && !poolBouncer)} showDivider text={t<string>('Unblock')}>
                  <UnblockIcon sx={{ color: (!poolRoot && !poolBouncer) ? 'action.disabledBackground' : 'text.primary', fontSize: '18px' }} />
                </ActionBtn>)
                : (<ActionBtn disabled={poolState === 'Destroying' || (!poolRoot && !poolBouncer)} onClick={goBlock} showDivider text={t<string>('Block')}>
                  <BlockIcon sx={{ color: poolState === 'Destroying' || (!poolRoot && !poolBouncer) ? 'action.disabledBackground' : 'text.primary', fontSize: '21px' }} />
                </ActionBtn>)
              }
              <ActionBtn disabled={isRemoveAllDisabled || (!poolRoot && !poolBouncer)} onClick={goRemoveAll} showDivider text={t<string>('Remove all')}>
                <FontAwesomeIcon color={isRemoveAllDisabled || (!poolRoot && !poolBouncer) ? theme.palette.action.disabledBackground : theme.palette.text.primary} fontSize='18px' icon={faPersonCircleXmark} />
              </ActionBtn>
              <ActionBtn disabled={poolState === 'Destroying' || !poolRoot} onClick={goEdit} text={t<string>('Edit')}>
                <FontAwesomeIcon color={poolState === 'Destroying' || !poolRoot ? theme.palette.action.disabledBackground : theme.palette.text.primary} fontSize='18px' icon={faPenToSquare} />
              </ActionBtn>
            </Grid>
          }
        </Grid>
      }
      {goChange && changeState && poolsToShow?.length && formatted &&
        <SetState
          address={address}
          formatted={formatted}
          headerText={changeState === 'Blocked' ? t('Block Pool') : changeState === 'Open' ? t('Unblock Pool') : t('Destroy Pool')}
          helperText={changeState === 'Blocked' ? blockHelperText : changeState === 'Open' ? unblockHelperText : destroyHelperText}
          pool={poolsToShow[poolIndex]}
          setRefresh={setRefresh}
          setShow={setGoChange}
          show={goChange}
          state={changeState}
        />
      }
      {showEdit && poolsToShow?.length &&
        <EditPool
          address={address}
          pool={poolsToShow[poolIndex]}
          setRefresh={setRefresh}
          setShowEdit={setShowEdit}
          showEdit={showEdit}
        />
      }
      {showRemoveAll && poolsToShow?.length &&
        <RemoveAll
          address={address}
          pool={poolsToShow[poolIndex]}
          setRefresh={setRefresh}
          setShowRemoveAll={setShowRemoveAll}
          showRemoveAll={showRemoveAll}
        />
      }
    </>
  );
}
